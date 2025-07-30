import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, CheckCircle, XCircle, RefreshCw, Eye, FileText, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getFullName } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPixKey, DOCUMENT_TYPES } from '@/components/dashboard/wallet/utils/verificationFormUtils';
import { useNavigate } from 'react-router-dom';

const AdminUserVerificationsTab = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVerification, setSelectedVerification] = useState(null);
    const [actionType, setActionType] = useState(null); 
    const [adminNotes, setAdminNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [imageToView, setImageToView] = useState('');

    const fetchVerifications = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_verifications')
                .select('*, profiles(id, first_name, last_name, email, profile_slug, company_name)')
                .order('requested_at', { ascending: false });

            if (error) {
                console.error("Erro ao buscar verificações:", error);
                if (error.message.includes("relationship") && error.message.includes("does not exist")) {
                     toast({
                        title: "Erro de Configuração",
                        description: "A relação entre verificações e perfis não foi encontrada. Tente recarregar o esquema ou contate o suporte.",
                        variant: "destructive",
                        duration: 10000
                    });
                } else {
                    throw error;
                }
            }
            // Adicionar campo "name" para compatibilidade
            const verificationsWithNames = (data || []).map(ver => ({
              ...ver,
              profiles: ver.profiles ? {
                ...ver.profiles,
                name: getFullName(ver.profiles)
              } : null
            }));
            setVerifications(verificationsWithNames);
        } catch (error) {
            toast({
                title: "Erro ao buscar verificações",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchVerifications();
    }, [fetchVerifications]);

    const openActionModal = (verification, type) => {
        setSelectedVerification(verification);
        setActionType(type); 
        setAdminNotes(verification.admin_notes || '');
    };

    const closeActionModal = () => {
        setSelectedVerification(null);
        setActionType(null);
        setAdminNotes('');
    };

    const openImageViewer = (url) => {
        setImageToView(url);
        setIsImageViewerOpen(true);
    };

    const handleProcessVerification = async (processAction) => { 
        if (!selectedVerification || !processAction) return;
        setIsProcessing(true);
        setActionType(processAction); 

        let newVerificationStatus = '';
        let profileUpdateData = {};

        if (processAction === 'approve') {
            newVerificationStatus = 'approved';
            profileUpdateData = { 
                is_identity_verified: true, 
                is_verified: true, 
                verification_status: 'verified',
                legal_full_name: selectedVerification.full_name,
                birth_date: selectedVerification.birth_date,
                cpf: selectedVerification.cpf,
                pix_info: { type: selectedVerification.pix_key_type, key: selectedVerification.pix_key }
            };
        } else if (processAction === 'reject') {
            newVerificationStatus = 'rejected_verification';
            profileUpdateData = { 
                is_identity_verified: false, 
                verification_status: 'rejected_verification' 
            };
            if (!adminNotes.trim()) {
                toast({ title: "Nota Obrigatória", description: "Por favor, adicione uma nota explicando o motivo da rejeição.", variant: "warning" });
                setIsProcessing(false);
                return;
            }
        } else {
            setIsProcessing(false);
            return;
        }

        try {
            const { error: verificationError } = await supabase
                .from('user_verifications')
                .update({ 
                    status: processAction === 'approve' ? 'approved' : 'rejected', 
                    admin_notes: adminNotes, 
                    reviewed_at: new Date().toISOString() 
                })
                .eq('id', selectedVerification.id);

            if (verificationError) throw verificationError;

            const { error: profileError } = await supabase
                .from('profiles')
                .update(profileUpdateData)
                .eq('id', selectedVerification.user_id);
            
            if (profileError) {
                await supabase.from('user_verifications').update({ status: selectedVerification.status, admin_notes: 'Falha ao atualizar perfil, revertido.', reviewed_at: null }).eq('id', selectedVerification.id);
                throw profileError;
            }
            
            toast({ title: `Verificação ${processAction === 'approve' ? 'Aprovada' : 'Rejeitada'}`, description: `O status do usuário foi atualizado.` });
            fetchVerifications();
            closeActionModal();
        } catch (error) {
            toast({ title: "Erro ao processar verificação", description: error.message, variant: "destructive" });
            console.error("Erro ao processar verificação:", error);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending': return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Pendente</Badge>;
            case 'approved': return <Badge className="bg-green-500 hover:bg-green-600 text-white">Aprovada</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejeitada</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Verificações de Identidade de Usuário</CardTitle>
                    <CardDescription>
                        Analise e aprove ou rejeite os pedidos de verificação de identidade dos usuários.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                        </div>
                    ) : verifications.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuário</TableHead>
                                    <TableHead>Nome Completo Legal</TableHead>
                                    <TableHead>Data Pedido</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {verifications.map((ver) => (
                                <TableRow key={ver.id}>
                                    <TableCell>
                                        <div className="font-medium hover:text-pink-600 cursor-pointer" onClick={() => ver.profiles?.profile_slug && navigate(`/perfil/${ver.profiles.profile_slug}`)}>
                                            {ver.profiles?.name || 'N/A'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">{ver.profiles?.email || 'N/A'}</div>
                                    </TableCell>
                                    <TableCell>{ver.full_name}</TableCell>
                                    <TableCell>{new Date(ver.requested_at).toLocaleString('pt-BR')}</TableCell>
                                    <TableCell>{getStatusBadge(ver.status)}</TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="outline" size="sm" onClick={() => openActionModal(ver, ver.status === 'pending' ? 'analyze' : 'view')} className="text-indigo-600 border-indigo-500 hover:bg-indigo-50">
                                            <Eye className="mr-2 h-4 w-4" /> {ver.status === 'pending' ? 'Analisar' : 'Ver Detalhes'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground p-8">
                            Nenhum pedido de verificação encontrado.
                        </p>
                    )}
                     <div className="mt-6 text-right">
                        <Button variant="outline" onClick={fetchVerifications} disabled={loading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Atualizar Lista
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {selectedVerification && (
                <Dialog open={!!selectedVerification} onOpenChange={(open) => !open && closeActionModal()}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {actionType === 'view' ? 'Detalhes da Verificação' : 'Analisar Pedido de Verificação'}
                            </DialogTitle>
                            <DialogDescription>
                                Usuário: {selectedVerification.profiles?.name} (ID: {selectedVerification.user_id})
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                            <p><strong>Nome Completo:</strong> {selectedVerification.full_name}</p>
                            <p><strong>Data de Nascimento:</strong> {new Date(selectedVerification.birth_date).toLocaleDateString('pt-BR')}</p>
                            <p><strong>CPF:</strong> {selectedVerification.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")}</p>
                            <p><strong>Tipo de Documento:</strong> {DOCUMENT_TYPES.find(d => d.value === selectedVerification.document_type)?.label || selectedVerification.document_type?.toUpperCase()}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {selectedVerification.document_front_image_url && (
                                    <Button variant="outline" onClick={() => openImageViewer(selectedVerification.document_front_image_url)}>
                                        <FileText className="mr-2 h-4 w-4"/> Ver Doc. Frente/Único
                                    </Button>
                                )}
                                {selectedVerification.document_back_image_url && (
                                    <Button variant="outline" onClick={() => openImageViewer(selectedVerification.document_back_image_url)}>
                                        <FileText className="mr-2 h-4 w-4"/> Ver Doc. Verso
                                    </Button>
                                )}
                                {selectedVerification.document_selfie_url && (
                                    <Button variant="outline" onClick={() => openImageViewer(selectedVerification.document_selfie_url)}>
                                        <Camera className="mr-2 h-4 w-4"/> Ver Selfie com Doc.
                                    </Button>
                                )}
                            </div>
                            <p><strong>Chave PIX ({selectedVerification.pix_key_type?.toUpperCase()}):</strong> {formatPixKey(selectedVerification.pix_key, selectedVerification.pix_key_type)}</p>
                            <p><strong>Status Atual:</strong> {getStatusBadge(selectedVerification.status)}</p>
                            
                            <div className="space-y-2">
                                <Label htmlFor="admin_notes">Notas Administrativas</Label>
                                <Input 
                                    id="admin_notes" 
                                    value={adminNotes} 
                                    onChange={(e) => setAdminNotes(e.target.value)} 
                                    placeholder={selectedVerification.status === 'pending' && actionType !== 'view' ? 'Motivo da aprovação/rejeição...' : 'Notas internas...'}
                                    disabled={selectedVerification.status !== 'pending' || actionType === 'view'}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={closeActionModal} disabled={isProcessing}>Fechar</Button>
                            {selectedVerification.status === 'pending' && actionType === 'analyze' && (
                                <>
                                <Button onClick={() => handleProcessVerification('reject')} disabled={isProcessing} variant="destructive">
                                    {isProcessing && actionType === 'reject' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                                    Rejeitar
                                </Button>
                                <Button onClick={() => handleProcessVerification('approve')} disabled={isProcessing} className="bg-green-600 hover:bg-green-700 text-white">
                                    {isProcessing && actionType === 'approve' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                    Aprovar
                                </Button>
                                </>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Visualizador de Documento</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center items-center p-4">
                        {imageToView && imageToView.endsWith('.pdf') ? (
                            <iframe src={imageToView} className="w-full h-[70vh]" title="Documento PDF"></iframe>
                        ) : (
                            <img src={imageToView} alt="Documento do Usuário" className="max-w-full max-h-[75vh] object-contain"/>
                        )}
                    </div>
                     <DialogFooter>
                        <Button variant="outline" onClick={() => setIsImageViewerOpen(false)}>Fechar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminUserVerificationsTab;