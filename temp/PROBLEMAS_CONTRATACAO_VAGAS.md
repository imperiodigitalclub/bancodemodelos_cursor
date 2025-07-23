# 🔧 PROBLEMAS IDENTIFICADOS - CONTRATAÇÃO E VAGAS

## ❌ **PROBLEMAS ENCONTRADOS:**

### **1. Formulário de Contratação - Sistema Indisponível**
- **Problema:** Clica no botão e mostra "Sistema em Manutenção"
- **Causa:** `HiringModal` sempre abre `PaymentDisabledModal`
- **Localização:** `src/components/profile/HiringModal.jsx`

### **2. Fluxo de Contratação Direta - Não Implementado**
- **Problema:** Formulário existe mas não processa pagamento
- **Causa:** Lógica de pagamento não implementada
- **Localização:** `HiringModal.jsx` e `direct_proposals` table

### **3. Publicação de Vagas - Erro RLS 403**
- **Problema:** `new row violates row-level security policy for table "jobs"`
- **Causa:** Políticas RLS não permitem inserção
- **Localização:** `JobForm.jsx` e tabela `jobs`

### **4. Lista de UFs - Campo Manual**
- **Problema:** Campo de estado é manual, pode causar erros de match
- **Causa:** Não há validação de UFs
- **Localização:** `JobForm.jsx`

## ✅ **SOLUÇÕES PROPOSTAS:**

### **1. Corrigir HiringModal**
```javascript
// Remover PaymentDisabledModal e implementar lógica real
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validar dados
  if (!formData.serviceDescription || !agreedCache) {
    toast({ title: "Dados incompletos", description: "Preencha todos os campos obrigatórios." });
    return;
  }
  
  // Processar contratação direta
  try {
    const proposalData = {
      contractor_id: user.id,
      model_id: modelProfile.id,
      service_date: formData.serviceDateTime,
      service_description: formData.serviceDescription,
      work_interest_category: formData.workInterestCategory,
      agreed_cache: unformatCurrency(agreedCache),
      platform_fee_percentage: platformFeePercentage,
      total_payable: totalPayable,
      status: 'pending'
    };
    
    const { data, error } = await supabase
      .from('direct_proposals')
      .insert(proposalData)
      .select()
      .single();
      
    if (error) throw error;
    
    // Processar pagamento via Mercado Pago
    const paymentData = {
      amount: totalPayable,
      description: `Contratação: ${modelProfile.name}`,
      external_reference: data.id,
      notification_url: `${window.location.origin}/api/payment-webhook`
    };
    
    // Criar preferência de pagamento
    const { data: preference, error: paymentError } = await supabase
      .functions.invoke('create-payment-preference', {
        body: paymentData
      });
      
    if (paymentError) throw paymentError;
    
    // Redirecionar para pagamento
    window.location.href = preference.init_point;
    
  } catch (error) {
    toast({ 
      title: "Erro ao processar contratação", 
      description: error.message, 
      variant: "destructive" 
    });
  }
};
```

### **2. Implementar Políticas RLS para Jobs**
```sql
-- Habilitar RLS na tabela jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Política para visualizar vagas (todos podem ver vagas abertas)
CREATE POLICY "Anyone can view open jobs" ON public.jobs
  FOR SELECT USING (status = 'open');

-- Política para contratantes criarem vagas
CREATE POLICY "Contractors can create jobs" ON public.jobs
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type IN ('contractor', 'photographer', 'admin')
    )
  );

-- Política para contratantes editarem suas vagas
CREATE POLICY "Contractors can update own jobs" ON public.jobs
  FOR UPDATE USING (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type IN ('contractor', 'photographer', 'admin')
    )
  );

-- Política para contratantes excluírem suas vagas
CREATE POLICY "Contractors can delete own jobs" ON public.jobs
  FOR DELETE USING (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type IN ('contractor', 'photographer', 'admin')
    )
  );

-- Política para admins (acesso total)
CREATE POLICY "Admins have full access" ON public.jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );
```

### **3. Adicionar Lista de UFs**
```javascript
// Adicionar ao JobForm.jsx
const brazilianStates = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

// Substituir Input por Select
<Select name="job_state" value={currentJobData.job_state || ''} onValueChange={(value) => handleSelectChange('job_state', value)}>
  <SelectTrigger className="mt-1">
    <SelectValue placeholder="Selecione o estado" />
  </SelectTrigger>
  <SelectContent>
    {brazilianStates.map(state => (
      <SelectItem key={state.value} value={state.value}>
        {state.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

## 📋 **FLUXO DE CONTRATAÇÃO DIRETA:**

### **1. Contratante envia proposta:**
- Preenche formulário de contratação
- Sistema calcula taxa da plataforma
- Contratante paga via Mercado Pago
- Valor fica em escrow vinculado à modelo

### **2. Modelo recebe proposta:**
- Notificação push, email e in-app
- Pode aceitar ou recusar
- Se aceitar: valor permanece em escrow
- Se recusar: valor retorna ao contratante

### **3. Execução do serviço:**
- Após data do serviço
- Contratante confirma conclusão
- Sistema libera pagamento para modelo
- Se não confirmar: sistema assume conclusão

### **4. Disputa (se necessário):**
- Modelo pode enviar provas
- Admin avalia e decide
- Libera pagamento ou devolve valor

## 🎯 **IMPLEMENTAÇÕES NECESSÁRIAS:**

### **1. Corrigir HiringModal.jsx**
- ✅ Remover PaymentDisabledModal
- ✅ Implementar lógica de pagamento real
- ✅ Integrar com Mercado Pago
- ✅ Processar proposta direta

### **2. Criar Políticas RLS**
- ✅ Políticas para tabela jobs
- ✅ Permitir contratantes criar/editar
- ✅ Permitir todos visualizar vagas abertas
- ✅ Restringir acesso por tipo de usuário

### **3. Melhorar JobForm.jsx**
- ✅ Adicionar lista de UFs
- ✅ Validar campos obrigatórios
- ✅ Melhorar UX do formulário

### **4. Implementar Webhook de Pagamento**
- ✅ Processar retorno do Mercado Pago
- ✅ Atualizar status da proposta
- ✅ Notificar usuários

## 🚀 **PRÓXIMOS PASSOS:**

1. **Corrigir HiringModal** para processar pagamentos reais
2. **Criar políticas RLS** para tabela jobs
3. **Adicionar lista de UFs** no JobForm
4. **Implementar webhook** de pagamento
5. **Testar fluxo completo** de contratação

---

**Status:** ❌ Problemas identificados  
**Próximo:** Implementar correções  
**Prioridade:** RLS e contratação direta 