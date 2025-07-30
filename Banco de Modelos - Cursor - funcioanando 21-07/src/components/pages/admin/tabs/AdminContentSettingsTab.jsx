import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle, Trash2, Save } from 'lucide-react';
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

const AdminContentSettingsTab = () => {
  const { toast } = useToast();
  const [workInterests, setWorkInterests] = useState([]);
  const [newInterestName, setNewInterestName] = useState('');
  const [loadingInterests, setLoadingInterests] = useState(true);
  const [isSavingInterest, setIsSavingInterest] = useState(false);
  const [interestToDelete, setInterestToDelete] = useState(null);
  const [isDeletingInterest, setIsDeletingInterest] = useState(false);
  
  // Estados para características de modelo
  const [modelCharacteristics, setModelCharacteristics] = useState([]);
  const [newCharacteristicName, setNewCharacteristicName] = useState('');
  const [loadingCharacteristics, setLoadingCharacteristics] = useState(true);
  const [isSavingCharacteristic, setIsSavingCharacteristic] = useState(false);
  const [characteristicToDelete, setCharacteristicToDelete] = useState(null);
  const [isDeletingCharacteristic, setIsDeletingCharacteristic] = useState(false);
  
  const [pageLimits, setPageLimits] = useState({
    MODELS_PAGE_PRO_LIMIT: 8,
    MODELS_PAGE_COMMON_LIMIT: 24,
  });
  const [loadingLimits, setLoadingLimits] = useState(true);
  const [isSavingLimits, setIsSavingLimits] = useState(false);


  const fetchWorkInterests = useCallback(async () => {
    setLoadingInterests(true);
    try {
      const { data, error } = await supabase
        .from('work_interests_options')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setWorkInterests(data);
    } catch (error) {
      toast({ title: 'Erro ao buscar interesses', description: error.message, variant: 'destructive' });
    } finally {
      setLoadingInterests(false);
    }
  }, [toast]);

  const fetchModelCharacteristics = useCallback(async () => {
    setLoadingCharacteristics(true);
    try {
      const { data, error } = await supabase
        .from('model_characteristics_options')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setModelCharacteristics(data);
    } catch (error) {
      toast({ title: 'Erro ao buscar características', description: error.message, variant: 'destructive' });
    } finally {
      setLoadingCharacteristics(false);
    }
  }, [toast]);

  const fetchPageLimits = useCallback(async () => {
    setLoadingLimits(true);
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['MODELS_PAGE_PRO_LIMIT', 'MODELS_PAGE_COMMON_LIMIT']);
      if (error) throw error;

      const limits = data.reduce((acc, setting) => {
        acc[setting.key] = setting.value?.value || (setting.key === 'MODELS_PAGE_PRO_LIMIT' ? 8 : 24);
        return acc;
      }, {});
      setPageLimits(prev => ({...prev, ...limits}));

    } catch (error) {
      toast({ title: 'Erro ao buscar limites de página', description: error.message, variant: 'destructive' });
    } finally {
      setLoadingLimits(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWorkInterests();
    fetchModelCharacteristics();
    fetchPageLimits();
  }, [fetchWorkInterests, fetchModelCharacteristics, fetchPageLimits]);

  const handleAddInterest = async (e) => {
    e.preventDefault();
    if (!newInterestName.trim()) {
      toast({ title: 'Nome inválido', description: 'O nome do interesse não pode ser vazio.', variant: 'warning' });
      return;
    }
    setIsSavingInterest(true);
    try {
      const { data, error } = await supabase
        .from('work_interests_options')
        .insert({ name: newInterestName.trim() })
        .select();
      
      if (error) {
        if (error.code === '23505') { // unique_violation
          toast({ title: 'Interesse já existe', description: `O interesse "${newInterestName.trim()}" já está cadastrado.`, variant: 'warning' });
        } else {
          throw error;
        }
      } else {
        toast({ title: 'Sucesso!', description: `Interesse "${data[0].name}" adicionado.` });
        setNewInterestName('');
        fetchWorkInterests();
      }
    } catch (error) {
      toast({ title: 'Erro ao adicionar interesse', description: error.message, variant: 'destructive' });
    } finally {
      setIsSavingInterest(false);
    }
  };

  const handleDeleteInterest = async () => {
    if (!interestToDelete) return;
    setIsDeletingInterest(true);
    try {
      const { error } = await supabase
        .from('work_interests_options')
        .delete()
        .eq('id', interestToDelete.id);
      if (error) throw error;
      toast({ title: 'Sucesso!', description: `Interesse "${interestToDelete.name}" excluído.` });
      setInterestToDelete(null);
      fetchWorkInterests();
    } catch (error) {
      toast({ title: 'Erro ao excluir interesse', description: error.message, variant: 'destructive' });
    } finally {
      setIsDeletingInterest(false);
    }
  };

  const handleAddCharacteristic = async (e) => {
    e.preventDefault();
    if (!newCharacteristicName.trim()) {
      toast({ title: 'Nome inválido', description: 'O nome da característica não pode ser vazio.', variant: 'warning' });
      return;
    }
    setIsSavingCharacteristic(true);
    try {
      const { data, error } = await supabase
        .from('model_characteristics_options')
        .insert({ name: newCharacteristicName.trim() })
        .select();
      
      if (error) {
        if (error.code === '23505') { // unique_violation
          toast({ title: 'Característica já existe', description: `A característica "${newCharacteristicName.trim()}" já está cadastrada.`, variant: 'warning' });
        } else {
          throw error;
        }
      } else {
        toast({ title: 'Sucesso!', description: `Característica "${data[0].name}" adicionada.` });
        setNewCharacteristicName('');
        fetchModelCharacteristics();
      }
    } catch (error) {
      toast({ title: 'Erro ao adicionar característica', description: error.message, variant: 'destructive' });
    } finally {
      setIsSavingCharacteristic(false);
    }
  };

  const handleDeleteCharacteristic = async () => {
    if (!characteristicToDelete) return;
    setIsDeletingCharacteristic(true);
    try {
      const { error } = await supabase
        .from('model_characteristics_options')
        .delete()
        .eq('id', characteristicToDelete.id);
      if (error) throw error;
      toast({ title: 'Sucesso!', description: `Característica "${characteristicToDelete.name}" excluída.` });
      setCharacteristicToDelete(null);
      fetchModelCharacteristics();
    } catch (error) {
      toast({ title: 'Erro ao excluir característica', description: error.message, variant: 'destructive' });
    } finally {
      setIsDeletingCharacteristic(false);
    }
  };

  const handleLimitChange = (key, value) => {
    setPageLimits(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveLimits = async () => {
    setIsSavingLimits(true);
    try {
      const updates = Object.entries(pageLimits).map(([key, value]) => ({
        key,
        value: { value: parseInt(value, 10) || 0 },
        description: key === 'MODELS_PAGE_PRO_LIMIT' 
          ? 'Número de modelos PRO em destaque na página de modelos.' 
          : 'Número de modelos comuns a serem exibidos por página na página de modelos.'
      }));
      
      const { error } = await supabase
        .from('app_settings')
        .upsert(updates, { onConflict: 'key' });

      if (error) throw error;

      toast({ title: 'Sucesso!', description: 'Limites de exibição atualizados.' });
    } catch (error) {
      toast({ title: 'Erro ao salvar limites', description: error.message, variant: 'destructive' });
    } finally {
      setIsSavingLimits(false);
    }
  };


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Limites de Exibição - Página de Modelos</CardTitle>
          <CardDescription>Controle quantos modelos são exibidos nas seções da página de modelos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingLimits ? (
            <div className="flex justify-center items-center h-20"><Loader2 className="h-8 w-8 animate-spin text-pink-600" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="pro-limit">Modelos PRO em Destaque</Label>
                <Input
                  id="pro-limit"
                  type="number"
                  value={pageLimits.MODELS_PAGE_PRO_LIMIT}
                  onChange={(e) => handleLimitChange('MODELS_PAGE_PRO_LIMIT', e.target.value)}
                  disabled={isSavingLimits}
                />
              </div>
              <div>
                <Label htmlFor="common-limit">Modelos Comuns (por página)</Label>
                <Input
                  id="common-limit"
                  type="number"
                  value={pageLimits.MODELS_PAGE_COMMON_LIMIT}
                  onChange={(e) => handleLimitChange('MODELS_PAGE_COMMON_LIMIT', e.target.value)}
                  disabled={isSavingLimits}
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveLimits} disabled={isSavingLimits || loadingLimits}>
            {isSavingLimits ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Limites
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Interesses de Trabalho para Modelos</CardTitle>
          <CardDescription>
            Adicione ou remova opções de interesses que os modelos podem selecionar em seus perfis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddInterest} className="flex items-end gap-4 mb-6">
            <div className="flex-grow">
              <Label htmlFor="new-interest-name">Nome do Novo Interesse</Label>
              <Input
                id="new-interest-name"
                value={newInterestName}
                onChange={(e) => setNewInterestName(e.target.value)}
                placeholder="Ex: Fotografia Comercial"
                disabled={isSavingInterest}
              />
            </div>
            <Button type="submit" disabled={isSavingInterest || !newInterestName.trim()} className="btn-gradient text-white">
              {isSavingInterest ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Adicionar
            </Button>
          </form>

          {loadingInterests ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
            </div>
          ) : workInterests.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Interesse</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workInterests.map((interest) => (
                    <TableRow key={interest.id}>
                      <TableCell className="font-medium">{interest.name}</TableCell>
                      <TableCell>{new Date(interest.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={() => setInterestToDelete(interest)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          {interestToDelete && interestToDelete.id === interest.id && (
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o interesse "<strong>{interestToDelete.name}</strong>"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setInterestToDelete(null)}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteInterest} disabled={isDeletingInterest} className="bg-red-600 hover:bg-red-700">
                                  {isDeletingInterest ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Excluir Interesse"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          )}
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhum interesse de trabalho cadastrado. Adicione alguns acima!
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Características de Modelos</CardTitle>
          <CardDescription>
            Adicione ou remova opções de características que os modelos podem selecionar em seus perfis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCharacteristic} className="flex items-end gap-4 mb-6">
            <div className="flex-grow">
              <Label htmlFor="new-characteristic-name">Nome da Nova Característica</Label>
              <Input
                id="new-characteristic-name"
                value={newCharacteristicName}
                onChange={(e) => setNewCharacteristicName(e.target.value)}
                placeholder="Ex: Tatuada, Siliconada, Natural"
                disabled={isSavingCharacteristic}
              />
            </div>
            <Button type="submit" disabled={isSavingCharacteristic || !newCharacteristicName.trim()} className="btn-gradient text-white">
              {isSavingCharacteristic ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Adicionar
            </Button>
          </form>

          {loadingCharacteristics ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
            </div>
          ) : modelCharacteristics.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Característica</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelCharacteristics.map((characteristic) => (
                    <TableRow key={characteristic.id}>
                      <TableCell className="font-medium">{characteristic.name}</TableCell>
                      <TableCell>{new Date(characteristic.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setCharacteristicToDelete(characteristic)}
                          disabled={isDeletingCharacteristic}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma característica cadastrada. Adicione algumas acima!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmação para excluir característica */}
      <AlertDialog open={!!characteristicToDelete} onOpenChange={() => setCharacteristicToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir a característica <strong>"{characteristicToDelete?.name}"</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCharacteristicToDelete(null)} disabled={isDeletingCharacteristic}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleDeleteCharacteristic} disabled={isDeletingCharacteristic}>
                {isDeletingCharacteristic ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Excluir
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default AdminContentSettingsTab;