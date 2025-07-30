import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit, Trash2, Search, ShieldCheck, Crown, UserPlus, CalendarDays, ExternalLink, X } from 'lucide-react';
import ProfileForm from '@/components/dashboard/ProfileForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';
import { getFullName } from '@/lib/utils';

const AdminUsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [isGrantSubscriptionModalOpen, setIsGrantSubscriptionModalOpen] = useState(false);
  const [subscriptionMonths, setSubscriptionMonths] = useState(1);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRevokingSubscription, setIsRevokingSubscription] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (searchTerm) {
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`);
    }
    const { data, error } = await query;
    if (error) {
      toast({ title: 'Erro ao buscar usuários', description: error.message, variant: 'destructive' });
    } else {
      // Adicionar campo "name" para compatibilidade
      const usersWithNames = (data || []).map(user => ({
        ...user,
        name: getFullName(user)
      }));
      setUsers(usersWithNames);
    }
    setLoading(false);
  }, [searchTerm, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = (user) => {
    setSelectedUserForEdit(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      // 1. Excluir dados SQL
      const { error } = await supabase.rpc('admin_delete_user', { user_id_to_delete: userToDelete.id });
      if (error) throw error;

      // 2. Excluir do Auth via Edge Function
      const SUPABASE_FUNCTIONS_URL =
        import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ||
        'https://fgmdqayaqafxutbncypt.functions.supabase.co';

      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/delete-auth-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userToDelete.id })
      });
      const result = await res.json();
      if (!result.success) {
        toast({ title: 'Usuário excluído parcialmente', description: `Dados removidos, mas erro ao excluir do Auth: ${result.error}`, variant: 'warning' });
      } else {
        toast({ title: 'Usuário Excluído', description: `O usuário ${userToDelete.name} foi excluído com sucesso.` });
      }
      fetchUsers();
      setUserToDelete(null); 
    } catch (error) {
      toast({ title: 'Erro ao excluir usuário', description: error.message, variant: 'destructive' });
      console.error("Erro ao excluir usuário:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openGrantSubscriptionModal = (user) => {
    setSelectedUserForEdit(user);
    setSubscriptionMonths(1);
    setIsGrantSubscriptionModalOpen(true);
  };

  const handleGrantSubscription = async () => {
    if (!selectedUserForEdit) return;
    setIsDeleting(true); 
    try {
      const paymentId = `admin_grant_${selectedUserForEdit.id}_${Date.now()}`;
      const planIdentifier = `pro_${subscriptionMonths}m_admin`;
      
      const { error } = await supabase.rpc('process_new_subscription', {
        p_user_id: selectedUserForEdit.id,
        p_plan_identifier: planIdentifier,
        p_duration_months: parseInt(subscriptionMonths, 10),
        p_payment_provider: 'admin_grant',
        p_provider_transaction_id: paymentId,
        p_amount_paid: 0,
        p_transaction_description: `Assinatura PRO concedida pelo admin - ${subscriptionMonths} meses`,
        p_transaction_status_detail: 'admin_granted'
      });

      if (error) throw error;

      toast({ title: 'Assinatura Concedida', description: `Assinatura PRO de ${subscriptionMonths} mes(es) concedida para ${selectedUserForEdit.name}.` });
      fetchUsers(); 
      setIsGrantSubscriptionModalOpen(false);
      setSelectedUserForEdit(null);
    } catch (error) {
      toast({ title: 'Erro ao conceder assinatura', description: error.message, variant: 'destructive' });
      console.error("Erro ao conceder assinatura:", error);
    } finally {
      setIsDeleting(false); 
    }
  };

  const handleRevokeSubscription = async (user) => {
    setIsRevokingSubscription(true);
    try {
      const { error } = await supabase.rpc('revoke_pro_subscription', {
        p_user_id: user.id
      });

      if (error) throw error;

      toast({ 
        title: 'Assinatura Revogada', 
                        description: `A assinatura PRO de ${getFullName(user)} foi revogada com sucesso.` 
      });
      fetchUsers(); 
    } catch (error) {
      toast({ 
        title: 'Erro ao revogar assinatura', 
        description: error.message, 
        variant: 'destructive' 
      });
      console.error("Erro ao revogar assinatura:", error);
    } finally {
      setIsRevokingSubscription(false);
    }
  };

  const handleProfileFormSuccess = (updatedProfile) => {
    setIsModalOpen(false);
    setSelectedUserForEdit(null);
    fetchUsers();
    toast({ title: "Perfil Atualizado", description: `Dados de ${updatedProfile.name} salvos.`, variant: "success" });
  };
  
  const UserTypeBadge = ({ userType }) => {
    const typeMap = {
      model: { label: "Modelo", color: "bg-pink-500" },
      contractor: { label: "Contratante", color: "bg-blue-500" },
      photographer: { label: "Fotógrafo", color: "bg-purple-500" },
      admin: { label: "Admin", color: "bg-red-600" },
    };
    const typeInfo = typeMap[userType] || { label: userType, color: "bg-gray-500" };
    return <Badge className={`${typeInfo.color} text-white hover:${typeInfo.color}`}>{typeInfo.label}</Badge>;
  };

  const formatExpirationDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    
    if (date <= now) return null; 
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isUserProActive = (user) => {
    return user.subscription_type === 'pro' && 
           user.subscription_expires_at && 
           new Date(user.subscription_expires_at) > new Date();
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Gerenciamento de Usuários</h2>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-sm">
          <Input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <Button onClick={() => { setSelectedUserForEdit(null); setIsModalOpen(true);}} className="btn-gradient text-white">
            <UserPlus className="mr-2 h-4 w-4" /> Novo Usuário (Admin)
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-pink-600" />
        </div>
      ) : users.length === 0 && !searchTerm ? (
        <p className="text-center text-gray-500 py-8">Nenhum usuário encontrado.</p>
      ) : users.length === 0 && searchTerm ? (
        <p className="text-center text-gray-500 py-8">Nenhum usuário encontrado para "{searchTerm}".</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isProActive = isUserProActive(user);
                const expirationDate = formatExpirationDate(user.subscription_expires_at);
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                          <img 
                              src={user.profile_image_url || `https://api.dicebear.com/7.x/micah/svg?seed=${user.id}`} 
                              alt={getFullName(user)}
                              className="w-8 h-8 rounded-full object-cover"
                          />
                          {getFullName(user)}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><UserTypeBadge userType={user.user_type} /></TableCell>
                    <TableCell className="text-center space-x-1">
                      {user.is_verified && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                          <ShieldCheck className="h-3.5 w-3.5 mr-1"/>Verificado
                        </Badge>
                      )}
                      {isProActive && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                          <Crown className="h-3.5 w-3.5 mr-1"/>
                          PRO {expirationDate && `até ${expirationDate}`}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                        <Edit className="mr-1 h-3.5 w-3.5"/> Editar
                      </Button>
                      
                      {isProActive ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-orange-600 border-orange-300 hover:bg-orange-50">
                              <X className="mr-1 h-3.5 w-3.5"/> Revogar PRO
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revogar Assinatura PRO</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja revogar a assinatura PRO de <strong>{getFullName(user)}</strong>? 
                                Esta ação irá remover imediatamente todos os benefícios PRO do usuário.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleRevokeSubscription(user)} 
                                disabled={isRevokingSubscription}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                {isRevokingSubscription ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Revogar Assinatura"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => openGrantSubscriptionModal(user)}>
                          <CalendarDays className="mr-1 h-3.5 w-3.5"/> Conceder PRO
                        </Button>
                      )}
                      
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" onClick={() => setUserToDelete(user)}>
                                <Trash2 className="mr-1 h-3.5 w-3.5"/> Excluir
                              </Button>
                          </AlertDialogTrigger>
                           {userToDelete && userToDelete.id === user.id && (
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Tem certeza que deseja excluir o usuário <strong>{userToDelete.name}</strong>? Esta ação é irreversível e removerá todos os dados associados, incluindo informações de autenticação.
                                  </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDeleteUser} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                                      {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Excluir Usuário"}
                                  </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          )}
                      </AlertDialog>
                      <Button variant="ghost" size="sm" onClick={() => user.profile_slug && navigate(`/perfil/${user.profile_slug}`)} title="Ver Perfil">
                        <ExternalLink className="h-4 w-4 text-gray-600 hover:text-pink-600"/>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => { if(!isOpen) setSelectedUserForEdit(null); setIsModalOpen(isOpen);}}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedUserForEdit ? 'Editar Usuário' : 'Criar Novo Usuário (Admin)'}</DialogTitle>
            <DialogDescription>
              {selectedUserForEdit ? `Modifique os dados de ${selectedUserForEdit.name}.` : 'Crie um novo perfil de usuário. A senha será definida pelo usuário no primeiro login ou via recuperação.'}
            </DialogDescription>
          </DialogHeader>
          <ProfileForm 
            initialProfileData={selectedUserForEdit} 
            onSuccess={handleProfileFormSuccess} 
            onCancel={() => {setSelectedUserForEdit(null); setIsModalOpen(false);}}
            viewMode="admin"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isGrantSubscriptionModalOpen} onOpenChange={setIsGrantSubscriptionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conceder Assinatura PRO</DialogTitle>
            <DialogDescription>
              {selectedUserForEdit && isUserProActive(selectedUserForEdit) ? (
                <div className="space-y-2">
                  <p className="text-orange-600 font-medium">
                    ⚠️ Este usuário já possui uma assinatura PRO ativa!
                  </p>
                  <p>
                    <strong>{selectedUserForEdit.name}</strong> já é PRO até{' '}
                    <strong>{formatExpirationDate(selectedUserForEdit.subscription_expires_at)}</strong>.
                  </p>
                  <p className="text-sm text-gray-600">
                    Conceder uma nova assinatura irá estender o período atual.
                  </p>
                </div>
              ) : (
                <p>Conceda um período de assinatura PRO para {selectedUserForEdit?.name}.</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="subscription-months">Duração (meses)</Label>
            <Select value={String(subscriptionMonths)} onValueChange={(value) => setSubscriptionMonths(Number(value))}>
              <SelectTrigger id="subscription-months">
                <SelectValue placeholder="Selecione a duração" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Mês</SelectItem>
                <SelectItem value="3">3 Meses</SelectItem>
                <SelectItem value="6">6 Meses</SelectItem>
                <SelectItem value="12">12 Meses (1 Ano)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGrantSubscriptionModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleGrantSubscription} className="btn-gradient text-white" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                (selectedUserForEdit && isUserProActive(selectedUserForEdit) ? "Estender Assinatura" : "Conceder Assinatura")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersTab;