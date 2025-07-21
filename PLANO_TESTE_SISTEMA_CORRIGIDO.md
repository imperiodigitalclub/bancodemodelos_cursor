# 🔍 PLANO DE TESTE - SISTEMA BANCO DE MODELOS CORRIGIDO

## 📋 **RESUMO DAS CORREÇÕES APLICADAS**

### **🏗️ PROBLEMAS IDENTIFICADOS E RESOLVIDOS:**
1. **❌ Queries SQL** com campo `"name"` inexistente → ✅ Alteradas para `first_name`, `last_name`, `company_name`
2. **❌ Frontend acessando** `user.name` → ✅ Função utilitária `getFullName()` criada  
3. **❌ Admin busca por** `name.ilike` → ✅ Alterado para buscar em `first_name`, `last_name`, `company_name`
4. **❌ RPC admin_delete_user** → ✅ Corrigida para usar `first_name + last_name`

### **📁 ARQUIVOS CRIADOS/MODIFICADOS:**
- ✅ `CORRECAO_CAMPO_NAME_SISTEMA_COMPLETO.sql` - Correções backend
- ✅ `src/lib/userUtils.js` - Funções utilitárias para nomes
- ✅ 8 componentes React corrigidos com queries atualizadas

---

## 🚀 **INSTRUÇÕES DE IMPLEMENTAÇÃO**

### **PASSO 1: Executar Correções SQL**
```bash
# 1. Acesse o Supabase Dashboard
# 2. Vá em SQL Editor 
# 3. Execute o arquivo: CORRECAO_CAMPO_NAME_SISTEMA_COMPLETO.sql
# 4. Aguarde mensagens de sucesso: "🎉 CORREÇÃO APLICADA COM SUCESSO!"
```

### **PASSO 2: Reiniciar Aplicação React**  
```bash
# No terminal do projeto:
npm run dev
# ou 
yarn dev
```

---

## 🧪 **PLANO DE TESTE DETALHADO**

### **1️⃣ SISTEMA DE VAGAS**

**Testes a realizar:**
- [ ] **Listar vagas** - verificar se nomes das empresas aparecem corretamente
- [ ] **Candidatar-se a vaga** - verificar se funciona sem erros
- [ ] **Ver detalhes da vaga** - verificar informações da empresa
- [ ] **Painel "Minhas Candidaturas"** - verificar nomes das empresas

**Como testar:**
1. Acesse `/vagas` 
2. Verifique se os cards mostram nome da empresa (ex: "João Silva" ou "Empresa ABC")
3. Clique em "Ver Detalhes" de uma vaga
4. Verifique se mostra "Publicado por: [Nome Empresa]"
5. Se for modelo, candidate-se a uma vaga
6. Acesse painel Dashboard → "Minhas Candidaturas"
7. Verifique se mostra "por [Nome Empresa]"

### **2️⃣ SISTEMA DE TRANSAÇÕES (ADMIN)**

**Testes a realizar:**
- [ ] **Listar transações** - verificar se nomes dos usuários aparecem
- [ ] **Buscar por nome** - verificar se busca funciona
- [ ] **Ver detalhes transação** - verificar informações do usuário

**Como testar:**
1. Login como admin
2. Acesse painel Admin → "Histórico de Pagamentos"  
3. Verifique se a coluna "Usuário" mostra nomes (ex: "Maria Santos")
4. Digite um nome na busca (ex: "João")
5. Verifique se filtra corretamente
6. Clique em "Ver Detalhes" de uma transação

### **3️⃣ SISTEMA DE SAQUES (ADMIN)**

**Testes a realizar:**
- [ ] **Listar pedidos de saque** - verificar nomes dos usuários
- [ ] **Aprovar/Rejeitar saque** - verificar se processa corretamente
- [ ] **Ver informações do usuário** - verificar dados do solicitante

**Como testar:**
1. Login como admin
2. Acesse painel Admin → "Pedidos de Saque"
3. Verifique se mostra nomes dos usuários (ex: "Ana Costa")
4. Clique em "Analisar" um pedido
5. Verifique se mostra "Usuário: [Nome] (ID: [ID])"
6. Teste aprovar ou rejeitar um pedido

### **4️⃣ EXCLUSÃO DE USUÁRIOS (ADMIN)**

**Testes a realizar:**
- [ ] **Listar usuários** - verificar se nomes aparecem
- [ ] **Buscar usuários** - verificar busca por nome
- [ ] **Excluir usuário** - verificar se funciona sem erros  
- [ ] **Ver logs** - verificar logs de exclusão

**Como testar:**
1. Login como admin
2. Acesse painel Admin → "Gerenciar Usuários"
3. Verifique se coluna "Nome" mostra nomes completos
4. Digite um nome na busca (ex: "Pedro")
5. Teste excluir um usuário de teste
6. Verifique no console se aparece logs: "🎉 SUCESSO: Usuário [Nome] deletado"

### **5️⃣ SISTEMA DE NOTIFICAÇÕES** *(Já estava funcionando)*

**Testes a realizar:**
- [ ] **Criar notificação** - verificar se funciona
- [ ] **Marcar como lida** - verificar se atualiza
- [ ] **Listar notificações** - verificar carregamento

**Como testar:**
1. Acesse qualquer página como usuário logado
2. Clique no sino de notificações (header)
3. Verifique se carrega sem erros
4. Clique em "Atualizar" 
5. Teste marcar uma notificação como lida

### **6️⃣ SISTEMA DE PAGAMENTOS** *(Já estava funcionando)*

**Testes a realizar:**
- [ ] **Iniciar pagamento** - verificar se abre modal
- [ ] **Processar PIX** - verificar QR Code
- [ ] **Webhook recebimento** - verificar atualização automática

**Como testar:**
1. Acesse Dashboard → "Carteira"
2. Clique em "Adicionar Fundos"
3. Digite um valor (ex: R$ 10,00)
4. Verifique se abre modal do MercadoPago
5. Escolha PIX e verifique QR Code

---

## 🐛 **POSSÍVEIS ERROS E SOLUÇÕES**

### **Erro: "column 'name' does not exist"**
**Solução:** Execute novamente o SQL `CORRECAO_CAMPO_NAME_SISTEMA_COMPLETO.sql`

### **Erro: "Cannot read property 'name' of undefined"**
**Solução:** Limpe cache do navegador (Ctrl+Shift+R)

### **Erro: "function get_user_full_name does not exist"**
**Solução:** Verifique se SQL foi executado com sucesso no Supabase

### **Nomes aparecendo como "undefined undefined"**
**Solução:** Verifique se usuários têm `first_name` e `last_name` preenchidos

---

## ✅ **CHECKLIST FINAL**

- [ ] SQL executado no Supabase sem erros
- [ ] Aplicação reiniciada
- [ ] Sistema de vagas testado (nomes empresas OK)
- [ ] Transações admin testadas (nomes usuários OK) 
- [ ] Saques admin testados (nomes OK + aprovação/rejeição OK)
- [ ] Exclusão usuários testada (função RPC OK)
- [ ] Notificações testadas (funcionando)
- [ ] Pagamentos testados (funcionando)
- [ ] Busca por nome funcionando (admin)
- [ ] Nenhum erro no console do navegador

---

## 🎯 **RESULTADO ESPERADO**

Após seguir este plano de teste, **TODAS** as funcionalidades devem estar funcionando normalmente com a nova estrutura `first_name` + `last_name`. 

Os usuários verão nomes completos em todas as interfaces (ex: "João Silva", "Empresa ABC") e administradores poderão gerenciar usuários, transações e saques sem erros relacionados ao campo "name".

**🚀 Sistema 100% compatível com a nova estrutura do banco de dados!** 