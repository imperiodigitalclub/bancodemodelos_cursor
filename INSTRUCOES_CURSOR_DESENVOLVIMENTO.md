# INSTRUCOES PARA O CURSOR - DESENVOLVIMENTO BANCO DE MODELOS

## 🎯 OBJETIVO

Este documento fornece instruções específicas para o Cursor sobre como utilizar a análise completa do sistema Banco de Modelos durante o desenvolvimento, garantindo que todas as decisões sejam baseadas no conhecimento completo da arquitetura existente.

---

## 🔧 CONFIGURAÇÕES DO PROJETO

### **Supabase:**
- **Project ID:** `fgmdqayaqafxutbncypt`
- **URL:** `https://fgmdqayaqafxutbncypt.supabase.co`
- **Importante:** Sempre especificar este projeto ao executar comandos Supabase

### **GitHub:**
- **Repository:** `https://github.com/imperiodigitalclub/bancodemodelos_cursor`
- **Branch principal:** `main`
- **Importante:** Sempre fazer commits para este repositório específico

### **Comandos Importantes:**
```bash
# Supabase - sempre especificar o projeto
supabase --project-ref fgmdqayaqafxutbncypt functions deploy
supabase --project-ref fgmdqayaqafxutbncypt db reset
supabase --project-ref fgmdqayaqafxutbncypt start

# Git - sempre para o repositório correto
git remote set-url origin https://github.com/imperiodigitalclub/bancodemodelos_cursor
git push origin main
```

---

## 📋 CHECKLIST OBRIGATÓRIO ANTES DE QUALQUER DESENVOLVIMENTO

### **1. Consultar Análise Completa**
- ✅ Ler `ANALISE_COMPLETA_SISTEMA_BANCO_MODELOS.md`
- ✅ Ler `ESTRUTURA_COMPLETA_BANCO_DADOS.md` (estrutura detalhada do banco)
- ✅ Entender relacionamentos entre tabelas
- ✅ Verificar edge functions existentes
- ✅ Consultar `CHANGELOG.md` para histórico

### **2. Verificar Estrutura Existente**
- ✅ Verificar se funcionalidade similar já existe
- ✅ Consultar padrões de nomenclatura
- ✅ Verificar estrutura de componentes
- ✅ Confirmar configurações de banco

### **3. Analisar Impactos**
- ✅ Identificar tabelas afetadas
- ✅ Verificar relacionamentos impactados
- ✅ Considerar edge functions necessárias
- ✅ Avaliar mudanças no frontend

---

## 🗄️ REGRAS PARA BANCO DE DADOS

### **Sempre Verificar Antes de Criar Tabelas:**

1. **Consultar `ESTRUTURA_COMPLETA_BANCO_DADOS.md`**
   - Verificar se tabela já existe
   - Entender estrutura atual
   - Verificar relacionamentos
   - Consultar funções e triggers existentes

2. **Padrões de Nomenclatura:**
   - Tabelas: `snake_case` (ex: `user_favorites`)
   - Colunas: `snake_case` (ex: `created_at`)
   - Chaves estrangeiras: `table_name_id` (ex: `profile_id`)

3. **Relacionamentos Obrigatórios:**
   - Sempre incluir `profile_id` para dados de usuário
   - Usar `auth.users` como referência principal
   - Implementar RLS (Row Level Security)

4. **Campos Padrão:**
   ```sql
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
   profile_id UUID REFERENCES profiles(id)
   ```

### **Exemplo de Criação de Tabela:**
```sql
CREATE TABLE public.nova_tabela (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  profile_id UUID REFERENCES profiles(id),
  -- campos específicos aqui
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active'
);

-- RLS obrigatório
ALTER TABLE public.nova_tabela ENABLE ROW LEVEL SECURITY;

-- Política básica
CREATE POLICY "Users can view own data" ON public.nova_tabela
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own data" ON public.nova_tabela
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own data" ON public.nova_tabela
  FOR UPDATE USING (auth.uid() = profile_id);
```

---

## 🔧 REGRAS PARA EDGE FUNCTIONS

### **Antes de Criar Nova Edge Function:**

1. **Verificar `supabase/functions/`**
   - Verificar se função similar já existe
   - Consultar padrões de código
   - Verificar configurações CORS

2. **Padrões Obrigatórios:**
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   }

   serve(async (req) => {
     if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: corsHeaders })
     }

     try {
       // lógica aqui
       return new Response(JSON.stringify({ success: true }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
       })
     } catch (error) {
       return new Response(JSON.stringify({ success: false, error: error.message }), {
         status: 500,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
       })
     }
   })
   ```

3. **Logs Obrigatórios:**
   - Console.log para debug
   - Logs de erro detalhados
   - Logs de sucesso

4. **Deploy:**
   ```bash
   supabase --project-ref fgmdqayaqafxutbncypt functions deploy nome-da-funcao
   ```

---

## 🎨 REGRAS PARA FRONTEND

### **Estrutura de Componentes:**

1. **Localização Correta:**
   - Páginas: `src/components/pages/`
   - Componentes: `src/components/`
   - UI: `src/components/ui/`
   - Contextos: `src/contexts/`
   - Hooks: `src/hooks/`

2. **Padrões de Nomenclatura:**
   - Componentes: `PascalCase` (ex: `UserProfile.jsx`)
   - Hooks: `camelCase` (ex: `useUserData.js`)
   - Contextos: `PascalCase` (ex: `AuthContext.jsx`)

3. **Imports Padrão:**
   ```jsx
   import React from 'react'
   import { useAuth } from '@/contexts/AuthContext'
   import { supabase } from '@/lib/supabaseClient'
   import { Button } from '@/components/ui/button'
   import { useToast } from '@/components/ui/use-toast'
   ```

### **Exemplo de Componente:**
```jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export default function NovoComponente() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tabela')
        .select('*')
        .eq('profile_id', user.id)

      if (error) throw error
      setData(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* conteúdo aqui */}
    </div>
  )
}
```

---

## 🔐 REGRAS DE AUTENTICAÇÃO

### **Sempre Verificar:**

1. **User vs Profile:**
   ```jsx
   const { user } = useAuth()
   const [profile, setProfile] = useState(null)

   useEffect(() => {
     if (user) {
       fetchProfile()
     }
   }, [user])

   const fetchProfile = async () => {
     const { data, error } = await supabase
       .from('profiles')
       .select('*')
       .eq('id', user.id)
       .single()
     
     if (!error) setProfile(data)
   }
   ```

2. **Proteção de Rotas:**
   ```jsx
   const ProtectedRoute = ({ children, allowedRoles = [] }) => {
     const { user, profile } = useAuth()
     
     if (!user) return <Navigate to="/login" />
     if (allowedRoles.length > 0 && !allowedRoles.includes(profile?.user_type)) {
       return <Navigate to="/" />
     }
     
     return children
   }
   ```

3. **Verificação de Permissões:**
   ```jsx
   const canEdit = profile?.id === user?.id || profile?.user_type === 'admin'
   ```

---

## 💰 REGRAS PARA PAGAMENTOS

### **Sempre Implementar:**

1. **Verificação de Status:**
   ```jsx
   const checkPaymentStatus = async (paymentId) => {
     const { data, error } = await supabase
       .functions.invoke('check-payment-status', {
         body: { payment_id: paymentId }
       })
   }
   ```

2. **Tratamento de Erros:**
   ```jsx
   try {
     // processar pagamento
   } catch (error) {
     toast({
       title: "Erro no pagamento",
       description: error.message,
       variant: "destructive"
     })
   }
   ```

3. **Logs de Transação:**
   ```jsx
   await supabase
     .from('wallet_transactions')
     .insert({
       profile_id: user.id,
       amount: amount,
       type: 'payment',
       status: 'pending'
     })
   ```

---

## 📧 REGRAS PARA EMAILS

### **Sempre Usar:**

1. **Templates Existentes:**
   ```jsx
   const sendEmail = async (templateName, data) => {
     const { data: template } = await supabase
       .from('email_templates')
       .select('*')
       .eq('name', templateName)
       .single()
     
     // processar template com data
   }
   ```

2. **Logs de Email:**
   ```jsx
   await supabase
     .from('email_logs')
     .insert({
       to_email: email,
       subject: subject,
       template_name: templateName,
       status: 'pending'
     })
   ```

3. **Múltiplos Provedores:**
   - Resend (API key `re_`)
   - SendGrid (API key `SG.`)
   - SMTP genérico

---

## 🔍 CHECKLIST DE QUALIDADE

### **Antes de Finalizar Qualquer Desenvolvimento:**

- [ ] **Banco de Dados:**
  - [ ] RLS implementado
  - [ ] Relacionamentos corretos
  - [ ] Campos obrigatórios
  - [ ] Índices necessários

- [ ] **Frontend:**
  - [ ] Loading states
  - [ ] Error handling
  - [ ] Responsividade
  - [ ] Acessibilidade

- [ ] **Edge Functions:**
  - [ ] CORS configurado
  - [ ] Logs implementados
  - [ ] Error handling
  - [ ] Validação de entrada

- [ ] **Segurança:**
  - [ ] Autenticação verificada
  - [ ] Autorização implementada
  - [ ] Validação de dados
  - [ ] Sanitização

- [ ] **Performance:**
  - [ ] Lazy loading
  - [ ] Otimização de queries
  - [ ] Cache quando necessário
  - [ ] Compressão de imagens

---

## 🚨 PONTOS CRÍTICOS

### **NUNCA FAZER:**

1. **Modificar Estrutura Existente Sem Análise:**
   - Sempre verificar impactos
   - Consultar CHANGELOG.md
   - Testar em ambiente de desenvolvimento

2. **Ignorar Relacionamentos:**
   - Sempre verificar foreign keys
   - Considerar cascata de exclusões
   - Manter integridade referencial

3. **Pular Validações:**
   - Sempre validar entrada do usuário
   - Implementar sanitização
   - Verificar permissões

4. **Esquecer Logs:**
   - Implementar logs de erro
   - Logs de transações importantes
   - Logs de auditoria

### **SEMPRE FAZER:**

1. **Consultar Análise Completa:**
   - Ler `ANALISE_COMPLETA_SISTEMA_BANCO_MODELOS.md`
   - Ler `ESTRUTURA_COMPLETA_BANCO_DADOS.md`
   - Entender arquitetura
   - Seguir padrões estabelecidos

2. **Testar Funcionalidades:**
   - Testar em diferentes dispositivos
   - Verificar diferentes tipos de usuário
   - Testar cenários de erro

3. **Documentar Mudanças:**
   - Atualizar CHANGELOG.md
   - Documentar novas funcionalidades
   - Explicar mudanças importantes

---

## 📝 ATUALIZAÇÃO DA DOCUMENTAÇÃO

### **QUANDO ATUALIZAR:**

1. **Após Aprovação de Nova Funcionalidade:**
   - ✅ Funcionalidade testada e aprovada pelo usuário
   - ✅ Código commitado no GitHub
   - ✅ Deploy realizado no Supabase
   - ✅ Funcionando em produção

2. **Após Alterações Estruturais:**
   - ✅ Nova tabela criada e populada
   - ✅ Novas funções implementadas
   - ✅ Novos triggers ativos
   - ✅ Relacionamentos estabelecidos

3. **Após Modificações Importantes:**
   - ✅ Edge functions atualizadas
   - ✅ Componentes refatorados
   - ✅ Padrões alterados
   - ✅ Configurações modificadas

### **COMO ATUALIZAR:**

1. **Atualizar `ESTRUTURA_COMPLETA_BANCO_DADOS.md`:**
   ```markdown
   ## 📋 NOVA TABELA: nome_da_tabela
   
   ### **Descrição:**
   [Descrição da funcionalidade]
   
   ### **Estrutura:**
   ```sql
   CREATE TABLE public.nova_tabela (
     -- estrutura completa
   );
   ```
   
   ### **Relacionamentos:**
   - [Listar relacionamentos]
   
   ### **Funções Relacionadas:**
   - [Listar funções]
   
   ### **Triggers:**
   - [Listar triggers]
   ```

2. **Atualizar `CHANGELOG.md`:**
   ```markdown
   ## [Data] - Nova Funcionalidade
   
   ### Adicionado
   - Nova tabela `nova_tabela`
   - Nova função `nova_funcao`
   - Novo componente `NovoComponente`
   
   ### Modificado
   - [Listar modificações]
   
   ### Removido
   - [Listar remoções]
   ```

3. **Atualizar `ANALISE_COMPLETA_SISTEMA_BANCO_MODELOS.md`:**
   - Adicionar nova funcionalidade na seção apropriada
   - Atualizar relacionamentos
   - Incluir novos componentes

4. **Atualizar este documento (`INSTRUCOES_CURSOR_DESENVOLVIMENTO.md`):**
   - Adicionar novos padrões se necessário
   - Atualizar exemplos
   - Incluir novas regras

### **COMANDOS PARA ATUALIZAÇÃO:**
```bash
# 1. Fazer backup da documentação atual
cp ESTRUTURA_COMPLETA_BANCO_DADOS.md ESTRUTURA_COMPLETA_BANCO_DADOS.md.backup

# 2. Atualizar documentação
# [Editar arquivos conforme necessário]

# 3. Commit das mudanças
git add .
git commit -m "docs: atualizar documentação após implementação de nova funcionalidade"
git push origin main

# 4. Verificar se tudo está correto
# [Testar funcionalidade em produção]
```

### **CHECKLIST DE ATUALIZAÇÃO:**
- [ ] ✅ Funcionalidade aprovada pelo usuário
- [ ] ✅ Código commitado no GitHub
- [ ] ✅ Deploy realizado no Supabase
- [ ] ✅ Funcionando em produção
- [ ] ✅ Documentação atualizada
- [ ] ✅ CHANGELOG.md atualizado
- [ ] ✅ Estrutura do banco documentada
- [ ] ✅ Relacionamentos mapeados
- [ ] ✅ Funções documentadas
- [ ] ✅ Triggers catalogados

---

## 📞 SUPORTE

### **Em Caso de Dúvidas:**

1. **Consultar Documentação:**
   - `ANALISE_COMPLETA_SISTEMA_BANCO_MODELOS.md`
   - `ESTRUTURA_COMPLETA_BANCO_DADOS.md`
   - `CHANGELOG.md`
   - `README.md`

2. **Verificar Código Existente:**
   - Componentes similares
   - Edge functions relacionadas
   - Padrões estabelecidos

3. **Testar em Ambiente Seguro:**
   - Usar branch de desenvolvimento
   - Testar localmente primeiro
   - Verificar impactos

4. **Comandos Úteis:**
   ```bash
   # Verificar status do projeto Supabase
   supabase --project-ref fgmdqayaqafxutbncypt status
   
   # Ver logs das edge functions
   supabase --project-ref fgmdqayaqafxutbncypt functions logs
   
   # Reset do banco local
   supabase --project-ref fgmdqayaqafxutbncypt db reset
   ```

---

## 🎯 CONCLUSÃO

Seguindo estas instruções, o Cursor terá conhecimento completo do sistema Banco de Modelos e poderá desenvolver funcionalidades de forma consistente, segura e eficiente, sempre respeitando a arquitetura existente e os padrões estabelecidos.

**Lembre-se:** 
- Sempre usar o projeto Supabase correto: `fgmdqayaqafxutbncypt`
- Sempre fazer commits para o repositório correto: `https://github.com/imperiodigitalclub/bancodemodelos_cursor`
- Sempre atualizar a documentação após aprovação de novas funcionalidades
- A análise completa do sistema é a base para qualquer desenvolvimento 