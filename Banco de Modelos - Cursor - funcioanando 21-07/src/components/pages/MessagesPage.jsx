import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, MessageSquare, ArrowLeft, Paperclip } from 'lucide-react';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useLocation, useNavigate } from 'react-router-dom';

const MessagesPage = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();

    const initialProfile = location.state?.profile;
    const initialConversationId = location.state?.conversationId;

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');

    const scrollToBottom = (behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    const fetchConversations = useCallback(async () => {
        if (!user) return;
        setLoadingConversations(true);
        try {
            const { data, error } = await supabase.rpc('get_user_conversations', { p_user_id: user.id });
            if (error) throw error;
            
            let fetchedConversations = data || [];

            if (initialConversationId) {
                const convo = fetchedConversations.find(c => c.id === initialConversationId);
                if (convo) setSelectedConversation(convo);
            } else if (initialProfile) {
                 const convo = fetchedConversations.find(c => c.other_user_id === initialProfile.id);
                 if (convo) {
                    setSelectedConversation(convo);
                 } else {
                    const newPlaceholderConvo = {
                        id: `temp_${initialProfile.id}`, other_user_id: initialProfile.id,
                        other_user_name: initialProfile.name, other_user_slug: initialProfile.profile_slug,
                        other_user_avatar: initialProfile.profile_image_url,
                        last_message_content: 'Inicie a conversa!', last_message_at: new Date().toISOString(),
                        is_placeholder: true 
                    };
                    fetchedConversations = [newPlaceholderConvo, ...fetchedConversations];
                    setSelectedConversation(newPlaceholderConvo);
                    setMessages([]); 
                 }
            }
            setConversations(fetchedConversations);

        } catch (error) {
            if (error.code !== 'SUPABASE_INIT_ERROR') toast({ title: 'Erro ao carregar conversas', description: error.message, variant: 'destructive' });
            console.error("Erro em fetchConversations:", error);
        } finally {
            setLoadingConversations(false);
        }
    }, [user, toast, initialProfile, initialConversationId]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (!selectedConversation || selectedConversation.is_placeholder) {
            if (selectedConversation?.is_placeholder) setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            setLoadingMessages(true);
            try {
                const { data, error } = await supabase.from('messages').select('*').eq('conversation_id', selectedConversation.id).order('created_at', { ascending: true });
                if (error) throw error;
                setMessages(data || []);
                setTimeout(() => scrollToBottom('auto'), 100);
            } catch (error) {
                 if (error.code !== 'SUPABASE_INIT_ERROR') toast({ title: 'Erro ao carregar mensagens', description: error.message, variant: 'destructive' });
                 console.error("Erro em fetchMessages:", error);
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessages();

        const channel = supabase.channel(`messages:${selectedConversation.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConversation.id}` },
                (payload) => setMessages(currentMessages => [...currentMessages, payload.new])
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [selectedConversation, toast]);

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || !user) return;
        setIsSending(true);

        let conversationIdToUse = selectedConversation.id;
        let currentConversationIsPlaceholder = selectedConversation.is_placeholder;

        try {
            if (currentConversationIsPlaceholder) {
                const { data: convResult, error: convError } = await supabase.rpc('get_or_create_conversation', {
                    p_hirer_id: user.user_type === 'model' ? selectedConversation.other_user_id : user.id,
                    p_model_id: user.user_type === 'model' ? user.id : selectedConversation.other_user_id
                });
                if (convError) throw convError;
                conversationIdToUse = convResult[0].id;
            }

            const { error } = await supabase.from('messages').insert({
                conversation_id: conversationIdToUse, sender_id: user.id,
                receiver_id: selectedConversation.other_user_id, content: newMessage,
            });
            if (error) throw error;
            
            setNewMessage('');
            if (currentConversationIsPlaceholder) { 
                fetchConversations();
            }
        } catch (error) {
            if (error.code !== 'SUPABASE_INIT_ERROR') toast({ title: 'Erro ao enviar mensagem', description: error.message, variant: 'destructive' });
            console.error("Erro em handleSendMessage:", error);
        } finally {
            setIsSending(false);
        }
    };
    
    const filteredConversations = conversations.filter(convo => 
        convo.other_user_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffSeconds = (now.getTime() - date.getTime()) / 1000;

        if (diffSeconds < 60) return 'agora';
        if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m`; 
        if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h`; 
        
        return formatDistanceToNowStrict(date, { addSuffix: true, locale: ptBR });
    };

    return (
        <div className="container mx-auto p-0 md:p-4 h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)]">
            <div className="flex h-full border md:rounded-lg bg-white shadow-lg overflow-hidden">
                <div className={`w-full md:w-1/3 border-r flex flex-col ${selectedConversation && 'hidden md:flex'}`}>
                    <div className="p-4 border-b"><h2 className="text-xl font-bold text-gray-800">Conversas</h2><Input type="text" placeholder="Buscar conversa..." className="mt-2" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                    <div className="flex-1 overflow-y-auto">
                        {loadingConversations ? (<div className="flex justify-center items-center h-full p-4"><Loader2 className="h-8 w-8 animate-spin text-pink-500" /></div>) : 
                         filteredConversations.length === 0 ? (<div className="text-center p-8 text-gray-500"><MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300"/>Nenhuma conversa encontrada.</div>) : 
                         (filteredConversations.map(convo => (
                            <div key={convo.id} onClick={() => setSelectedConversation(convo)} className={`flex items-center p-3 cursor-pointer hover:bg-pink-50 transition-colors ${selectedConversation?.id === convo.id ? 'bg-pink-100 border-r-4 border-pink-500' : 'border-r-4 border-transparent'}`}>
                                <Avatar className="h-12 w-12 mr-3"><AvatarImage src={convo.other_user_avatar} alt={convo.other_user_name} /><AvatarFallback className="bg-gray-200 text-gray-600">{convo.other_user_name?.[0]?.toUpperCase()}</AvatarFallback></Avatar>
                                <div className="flex-1 overflow-hidden"><p className={`font-semibold truncate ${selectedConversation?.id === convo.id ? 'text-pink-700' : 'text-gray-800'}`}>{convo.other_user_name}</p><p className="text-sm text-gray-500 truncate">{convo.last_message_content || 'Inicie a conversa!'}</p></div>
                                <span className="text-xs text-gray-400 ml-2 self-start pt-1">{convo.last_message_at ? formatTimestamp(convo.last_message_at) : ''}</span>
                            </div>
                        )))}
                    </div>
                </div>
                <div className={`w-full md:w-2/3 flex flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
                    {selectedConversation ? (
                        <>
                            <div className="flex items-center p-3 border-b bg-gray-50">
                                <Button variant="ghost" size="icon" className="md:hidden mr-2 text-gray-600 hover:text-pink-600" onClick={() => setSelectedConversation(null)}><ArrowLeft /></Button>
                                <Avatar className="h-10 w-10 mr-3 cursor-pointer" onClick={() => selectedConversation.other_user_slug && navigate(`/perfil/${selectedConversation.other_user_slug}`)}><AvatarImage src={selectedConversation.other_user_avatar} alt={selectedConversation.other_user_name} /><AvatarFallback className="bg-gray-300 text-gray-700">{selectedConversation.other_user_name?.[0]?.toUpperCase()}</AvatarFallback></Avatar>
                                <p className="font-semibold text-gray-800 cursor-pointer hover:text-pink-600" onClick={() => selectedConversation.other_user_slug && navigate(`/perfil/${selectedConversation.other_user_slug}`)}>{selectedConversation.other_user_name}</p>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 space-y-3">
                                {loadingMessages ? (<div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-pink-500" /></div>) : 
                                 messages.length === 0 && !selectedConversation.is_placeholder ? (<div className="text-center text-gray-500 py-10">Nenhuma mensagem ainda. Envie uma!</div>) : 
                                 (messages.map((msg) => (
                                    <div key={msg.id} className={`flex my-1 ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-2.5 px-3.5 rounded-2xl max-w-[70%] shadow-sm ${msg.sender_id === user.id ? 'bg-pink-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border'}`}>
                                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                            <p className={`text-xs mt-1 opacity-70 ${msg.sender_id === user.id ? 'text-right' : 'text-left'}`}>{format(new Date(msg.created_at), 'HH:mm')}</p>
                                        </div>
                                    </div>
                                )))}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="p-3 border-t bg-white">
                                <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="icon" type="button" className="text-gray-500 hover:text-pink-600" onClick={() => toast({title: "Em breve!", description: "Envio de anexos."})}><Paperclip className="h-5 w-5" /></Button>
                                    <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Digite sua mensagem..." autoComplete="off" disabled={isSending} className="flex-grow rounded-full px-4 py-2 focus-visible:ring-pink-500"/>
                                    <Button type="submit" disabled={isSending || !newMessage.trim()} className="btn-gradient text-white rounded-full">{isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}</Button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-col justify-center items-center h-full text-gray-500 p-8 text-center"><MessageSquare className="h-20 w-20 mb-4 text-gray-300" /><h3 className="text-xl font-semibold text-gray-700">Selecione uma conversa</h3><p className="text-gray-500">Escolha alguém da sua lista para começar a conversar.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;