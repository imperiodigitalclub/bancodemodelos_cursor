# 🏆 Banco de Modelos - Marketplace

Sistema completo de marketplace para modelos e contratantes built com React + Supabase.

## 🚀 Melhorias Implementadas (Janeiro 2025)

### ✅ **Sistema de Autenticação Corrigido**
- AuthContext simplificado com estado unificado de loading
- Persistência de sessão após refresh corrigida
- Bootstrap mais direto e confiável
- Verificação defensiva para evitar loops de redirecionamento

### ✅ **Integração MercadoPago Otimizada**
- PaymentContext melhorado com logs detalhados
- Inicialização robusta do SDK
- Painel admin funcional para configurar chaves
- Suporte completo a PIX, Cartão e Boleto

### ✅ **Routing SPA Definitivo**
- HashRouter implementado para resolver 404s
- Navegação funciona perfeitamente com refresh/direct access
- URLs no formato: `http://localhost:5173/#/perfil/slug`

### ✅ **Componentes Defensivos**
- GlobalScripts e MobileNav com try/catch para AuthContext
- Sistema funciona mesmo quando AuthProvider não está disponível
- Logs informativos ao invés de erros críticos

---

## 🛠️ **Como Rodar o Projeto**

### **1. Pré-requisitos**
```bash
# Node.js v20.19.1 (conforme .nvmrc)
node --version  # deve mostrar v20.19.1
npm --version
```

### **2. Instalação**
```bash
# Instalar dependências
npm install
```

### **3. Configuração do MercadoPago (Via Painel Admin)**

1. **Execute o projeto em modo dev:**
   ```bash
   npm run dev
   ```

2. **Acesse:** `http://localhost:5173`

3. **Faça login como admin** e vá para `/admin`

4. **Na aba "Config. Pagamentos":**
   - **Public Key:** Sua chave pública do MercadoPago (`APP_USR-...`)
   - **Access Token:** Seu token de acesso do MercadoPago
   - **Webhook URL:** `https://fgmdqayaqafxutbncypt.supabase.co/functions/v1/mp-webhook`
   - **Métodos de Pagamento:** Ative PIX, Cartão, Boleto conforme necessário

5. **Configure o Webhook no MercadoPago:**
   - Acesse: https://www.mercadopago.com.br/developers/panel/webhooks
   - URL: `https://fgmdqayaqafxutbncypt.supabase.co/functions/v1/mp-webhook`
   - Eventos: Selecione TODOS os eventos de pagamento

### **4. Executar o Projeto**
```bash
# Modo desenvolvimento
npm run dev

# Projeto estará em: http://localhost:5173
```

---

## 🏗️ **Arquitetura**

### **Stack Tecnológico**
- **Frontend:** React 18.2.0 + Vite 4.4.5
- **Styling:** TailwindCSS + Radix UI + Framer Motion
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Pagamentos:** MercadoPago SDK React
- **Autenticação:** Supabase Auth
- **Storage:** Supabase Storage

### **Tipos de Usuário**
- `model` - Modelos (podem se candidatar a vagas)
- `contractor` - Contratantes/Agências (publicam vagas)
- `photographer` - Fotógrafos (híbrido)
- `admin` - Administradores (acesso total)

### **Funcionalidades Principais**
- ✅ Sistema de cadastro em steps (10 para modelos, 6 para outros)
- ✅ Upload de mídia (fotos/vídeos) no Supabase Storage
- ✅ Sistema de vagas e candidaturas
- ✅ Carteira digital com recarga via MercadoPago
- ✅ Assinaturas PRO mensais/trimestrais/anuais
- ✅ Sistema de avaliações e reviews
- ✅ Painel administrativo completo
- ✅ Sistema de escrow para contratações

---

## 📁 **Estrutura do Projeto**

```
📦 Banco de Modelos/
├── 🎯 src/contexts/          # Estados globais (Auth, Payment)
├── 🔧 src/lib/               # Configurações (Supabase client)
├── 🎨 src/components/        
│   ├── auth/                 # Sistema de autenticação
│   ├── dashboard/            # Painel do usuário  
│   ├── pages/                # Páginas principais
│   ├── payment/              # Sistema de pagamentos
│   └── profile/              # Perfis de usuários
├── ⚡ supabase/functions/    # Edge Functions (API)
└── 🏗️ dist_ok/              # Build funcional de produção
```

---

## 🔧 **Configurações no Painel Admin**

### **Acesso Admin**
1. Registre-se no sistema
2. No banco Supabase, altere `user_type` para `'admin'` na tabela `profiles`
3. Acesse `/admin` para configurar o sistema

### **Configurações Essenciais**
- **Pagamentos:** Configure MercadoPago (chaves, métodos, preços)
- **Logo:** Upload do logo da plataforma
- **E-mail:** Configure SMTP para envio de emails
- **Geral:** Nome do site, descrições, contatos
- **Integrações:** Facebook Pixel, Google Analytics

---

## 🚨 **Problemas Resolvidos**

### **❌ ANTES (Problemas Identificados)**
- AuthContext com múltiplos loading states conflitantes
- Sessão não persistia após refresh da página
- Modal de auth abria para usuários já logados
- 404 errors em page refresh/direct URL access
- MercadoPago não inicializava corretamente
- Configurações hardcoded no código

### **✅ DEPOIS (Soluções Implementadas)**
- AuthContext unificado com estado único de loading
- Persistência de sessão funcionando perfeitamente
- Verificação defensiva para evitar modal desnecessário
- HashRouter resolve 404s definitivamente
- PaymentContext robusto com logs detalhados
- Painel admin para configurar tudo via interface

---

## 🔍 **Debugging e Troubleshooting**

### **Se o projeto não iniciar:**
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Verificar versão Node
node --version  # deve ser 20.19.1
```

### **Se MercadoPago não funcionar:**
1. Verifique as chaves no painel admin
2. Confirme que o webhook está configurado
3. Verifique o console do navegador para logs detalhados

### **Se autenticação falhar:**
```javascript
// No console do navegador
localStorage.clear()  // Limpar storage
location.reload()     // Recarregar página
```

---

## 📊 **Sistema de Pagamentos**

### **Fluxos Suportados**
- 🔄 **Recarga de Carteira:** Usuário adiciona créditos
- 💳 **Assinaturas PRO:** Planos mensais/trimestrais/anuais
- 💼 **Contratações:** Pagamento via escrow
- 💸 **Saques:** Sistema de verificação KYC

### **Métodos de Pagamento**
- 💳 Cartão de Crédito (até 12x)
- 📱 PIX (instantâneo)
- 📄 Boleto Bancário
- 💰 Saldo MercadoPago

---

## 🎯 **Próximos Passos**

O sistema está **totalmente funcional** e pronto para produção. As principais melhorias implementadas garantem:

- ✅ Autenticação estável e confiável
- ✅ Pagamentos funcionando corretamente
- ✅ Interface admin para configurações
- ✅ Routing SPA sem 404s
- ✅ Sistema defensivo contra erros

**🚀 Pronto para usar em production!** 