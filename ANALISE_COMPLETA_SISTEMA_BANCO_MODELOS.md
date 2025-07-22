# ANÁLISE COMPLETA DO SISTEMA BANCO DE MODELOS

## 📋 RESUMO EXECUTIVO

O **Banco de Modelos** é uma plataforma completa de marketplace para modelos, fotógrafos e contratantes, desenvolvida em React + Vite com backend Supabase (PostgreSQL). O sistema possui funcionalidades avançadas de autenticação, pagamentos, notificações, gestão de conteúdo e administração.

---

## 🏗️ ARQUITETURA DO SISTEMA

### **Frontend (React + Vite)**
- **Framework**: React 18 com Vite
- **UI**: Tailwind CSS + Shadcn/ui
- **Roteamento**: React Router DOM
- **Estado**: Context API + Hooks customizados
- **Build**: Vite com configurações otimizadas

### **Backend (Supabase)**
- **Banco**: PostgreSQL 17.4
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage
- **Edge Functions**: Deno runtime
- **Realtime**: WebSockets para notificações

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### **Schemas Principais**

#### **Schema `public` (Tabelas de Negócio)**

| Tabela | Descrição | Relacionamentos |
|--------|-----------|-----------------|
| `profiles` | Perfis de usuários (modelos, contratantes, admins) | FK: auth.users |
| `jobs` | Vagas de trabalho publicadas | FK: profiles (criador) |
| `job_applications` | Candidaturas para vagas | FK: jobs, profiles |
| `job_contracts` | Contratos fechados | FK: jobs, profiles |
| `reviews` | Avaliações de usuários | FK: profiles (avaliador/avaliado) |
| `user_favorites` | Favoritos dos usuários | FK: profiles |
| `profile_photos` | Fotos dos perfis | FK: profiles |
| `profile_videos` | Vídeos dos perfis | FK: profiles |
| `notifications` | Sistema de notificações | FK: profiles |
| `notification_preferences` | Preferências de notificação | FK: profiles |
| `wallet_transactions` | Transações da carteira | FK: profiles |
| `withdrawal_requests` | Solicitações de saque | FK: profiles |
| `user_verifications` | Verificações de usuário | FK: profiles |
| `subscriptions` | Assinaturas premium | FK: profiles |
| `user_fcm_tokens` | Tokens para push notifications | FK: profiles |

#### **Schema `auth` (Autenticação Supabase)**
- `users` - Usuários do sistema
- `sessions` - Sessões ativas
- `identities` - Identidades (Google, etc.)
- `mfa_factors` - Autenticação multi-fator
- `audit_log_entries` - Logs de auditoria

#### **Schema `storage` (Arquivos)**
- `buckets` - Buckets de storage
- `objects` - Objetos armazenados
- `migrations` - Migrações do storage

#### **Schema `realtime` (Tempo Real)**
- `messages` - Mensagens em tempo real
- `subscription` - Inscrições em canais

### **Tabelas de Configuração**

| Tabela | Descrição |
|--------|-----------|
| `app_settings` | Configurações gerais do sistema |
| `email_templates` | Templates de email |
| `email_logs` | Logs de envio de emails |
| `broadcast_logs` | Logs de broadcasts |
| `landing_pages` | Páginas de landing |
| `menus` | Configuração de menus |
| `pages` | Páginas dinâmicas |
| `model_characteristics_options` | Opções de características |
| `work_interests_options` | Opções de interesses |
| `webhook_events` | Eventos de webhook |

---

## 🔧 EDGE FUNCTIONS

### **Funções de Email**
- `send-email/` - Envio via SMTP/Resend/SendGrid
- `send-email-resend/` - Envio específico via Resend
- `webhook-email/` - Webhook para emails

### **Funções de Pagamento**
- `create-payment-preference/` - Criar preferência Mercado Pago
- `process-payment/` - Processar pagamentos
- `mp-webhook/` - Webhook Mercado Pago
- `get-mp-public-key/` - Obter chave pública MP

### **Funções Administrativas**
- `send-broadcast/` - Enviar broadcasts
- `delete-auth-user/` - Deletar usuário
- `save-app-secrets/` - Salvar segredos

---

## 🎨 ESTRUTURA DO FRONTEND

### **Componentes Principais**

#### **Autenticação (`src/components/auth/`)**
- `AuthModal.jsx` - Modal de login/registro
- `WelcomeModal.jsx` - Modal de boas-vindas
- `RegistrationLoadingModal.jsx` - Loading do registro
- Steps de registro:
  - `UserTypeStep.jsx` - Tipo de usuário
  - `AccountDetailsStep.jsx` - Detalhes da conta
  - `ProfilePictureStep.jsx` - Foto do perfil
  - `ModelProfileTypeStep.jsx` - Tipo de perfil (modelo)
  - `ModelPhysicalTypeStep.jsx` - Tipo físico
  - `ModelPhysicalProfileStep.jsx` - Perfil físico
  - `ModelCharacteristicsStep.jsx` - Características
  - `ModelInterestsStep.jsx` - Interesses
  - `ModelAppearanceStep.jsx` - Aparência
  - `LocationStep.jsx` - Localização
  - `InstagramStep.jsx` - Instagram
  - `WhatsappStep.jsx` - WhatsApp

#### **Dashboard (`src/components/dashboard/`)**
- `DashboardPage.jsx` - Página principal
- `ProfileTab.jsx` - Aba de perfil
- `GalleryTab.jsx` - Aba de galeria
- `ReviewsTab.jsx` - Aba de avaliações
- `SettingsTab.jsx` - Aba de configurações
- `WalletTab.jsx` - Aba da carteira
- `SubscriptionTab.jsx` - Aba de assinatura
- `NotificationsTab.jsx` - Aba de notificações

#### **Páginas (`src/components/pages/`)**
- `HomePage.jsx` - Página inicial
- `ModelsPage.jsx` - Lista de modelos
- `JobsPage.jsx` - Lista de vagas
- `ProfilePage.jsx` - Perfil público
- `ContractorsPage.jsx` - Lista de contratantes
- `FavoritesPage.jsx` - Favoritos
- `ForgotPasswordPage.jsx` - Esqueci senha
- `ResetPasswordPage.jsx` - Resetar senha

#### **Admin (`src/components/pages/admin/`)**
- `AdminDashboardPage.jsx` - Dashboard admin
- Tabs administrativas:
  - `AdminOverviewTab.jsx` - Visão geral
  - `AdminUsersTab.jsx` - Gestão de usuários
  - `AdminJobsTab.jsx` - Gestão de vagas
  - `AdminPaymentsTab.jsx` - Gestão de pagamentos
  - `AdminEmailsTab.jsx` - Gestão de emails
  - `AdminNotificationsTab.jsx` - Gestão de notificações
  - `AdminContentSettingsTab.jsx` - Configurações de conteúdo
  - `AdminIntegrationsTab.jsx` - Integrações
  - `AdminBroadcastTab.jsx` - Broadcasts

#### **UI Components (`src/components/ui/`)**
- Componentes Shadcn/ui customizados
- `button.jsx`, `card.jsx`, `dialog.jsx`, etc.

### **Contextos (`src/contexts/`)**
- `AuthContext.jsx` - Contexto de autenticação
- `PaymentContext.jsx` - Contexto de pagamentos
- `SmartSubscriptionContext.jsx` - Contexto de assinatura
- `SupabaseAuthContext.jsx` - Contexto Supabase

### **Hooks (`src/hooks/`)**
- `useNotifications.js` - Hook de notificações
- `useSmartSubscription.js` - Hook de assinatura

### **Lib (`src/lib/`)**
- `supabaseClient.js` - Cliente Supabase
- `customSupabaseClient.js` - Cliente customizado
- `utils.js` - Utilitários
- `notificationService.js` - Serviço de notificações

---

## 🔐 SISTEMA DE AUTENTICAÇÃO

### **Fluxo de Registro**
1. **UserTypeStep** - Escolha do tipo (Modelo/Contratante)
2. **AccountDetailsStep** - Email, senha, nome
3. **ProfilePictureStep** - Upload de foto
4. **ModelProfileTypeStep** - Tipo de perfil (se modelo)
5. **ModelPhysicalTypeStep** - Tipo físico
6. **ModelPhysicalProfileStep** - Dados físicos
7. **ModelCharacteristicsStep** - Características
8. **ModelInterestsStep** - Interesses
9. **ModelAppearanceStep** - Aparência
10. **LocationStep** - Localização
11. **InstagramStep** - Instagram
12. **WhatsappStep** - WhatsApp

### **Tipos de Usuário**
- **Modelo** - Perfil completo com características físicas
- **Contratante** - Perfil simplificado para contratar
- **Admin** - Acesso administrativo completo

---

## 💰 SISTEMA DE PAGAMENTOS

### **Integração Mercado Pago**
- **Criação de preferência** - `create-payment-preference/`
- **Processamento** - `process-payment/`
- **Webhook** - `mp-webhook/`
- **Verificação de status** - `check_payment_status_mp.sql`

### **Carteira Digital**
- **Transações** - `wallet_transactions`
- **Solicitações de saque** - `withdrawal_requests`
- **Verificações** - `user_verifications`

### **Assinaturas Premium**
- **Tabela** - `subscriptions`
- **Contexto** - `SmartSubscriptionContext`
- **Hook** - `useSmartSubscription`

---

## 📧 SISTEMA DE EMAILS

### **Configuração SMTP**
- **Host, Port, User, Password** - `app_settings`
- **Templates** - `email_templates`
- **Logs** - `email_logs`

### **Provedores Suportados**
1. **Resend** - API Key começando com `re_`
2. **SendGrid** - API Key começando com `SG.`
3. **SMTP Genérico** - Configuração manual

### **Templates Disponíveis**
- Boas-vindas
- Confirmação de email
- Reset de senha
- Notificações de vaga
- Broadcasts

---

## 🔔 SISTEMA DE NOTIFICAÇÕES

### **Tipos de Notificação**
- **Email** - Via SMTP/Resend/SendGrid
- **Push** - Via FCM tokens
- **In-app** - Via Supabase Realtime

### **Preferências**
- **Tabela** - `notification_preferences`
- **Configuração por usuário**
- **Tipos**: Email, Push, In-app

---

## 🎯 FUNCIONALIDADES PRINCIPAIS

### **Para Modelos**
- Perfil completo com características físicas
- Galeria de fotos e vídeos
- Sistema de avaliações
- Candidatura para vagas
- Carteira digital
- Assinatura premium

### **Para Contratantes**
- Publicação de vagas
- Busca de modelos
- Sistema de avaliações
- Contratação direta
- Histórico de contratos

### **Para Administradores**
- Gestão completa de usuários
- Moderação de conteúdo
- Configurações do sistema
- Relatórios e analytics
- Broadcasts em massa

---

## 🛠️ CONFIGURAÇÕES TÉCNICAS

### **Variáveis de Ambiente**
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_MERCADO_PAGO_PUBLIC_KEY=
VITE_GOOGLE_MAPS_API_KEY=
```

### **Dependências Principais**
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "@supabase/supabase-js": "^2.38.0",
  "tailwindcss": "^3.3.0",
  "lucide-react": "^0.263.1",
  "react-hook-form": "^7.45.0",
  "zustand": "^4.4.0"
}
```

### **Scripts Disponíveis**
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"
}
```

---

## 📊 RELACIONAMENTOS PRINCIPAIS

### **Profiles (Centro do Sistema)**
```
profiles (1) ←→ (N) profile_photos
profiles (1) ←→ (N) profile_videos
profiles (1) ←→ (N) reviews (como avaliador)
profiles (1) ←→ (N) reviews (como avaliado)
profiles (1) ←→ (N) user_favorites
profiles (1) ←→ (N) wallet_transactions
profiles (1) ←→ (N) withdrawal_requests
profiles (1) ←→ (N) notifications
profiles (1) ←→ (N) job_applications
profiles (1) ←→ (N) jobs (como criador)
profiles (1) ←→ (N) subscriptions
```

### **Jobs (Sistema de Vagas)**
```
jobs (1) ←→ (N) job_applications
jobs (1) ←→ (N) job_contracts
jobs (N) ←→ (1) profiles (criador)
```

### **Notifications (Sistema de Notificações)**
```
notifications (N) ←→ (1) profiles
notification_preferences (1) ←→ (1) profiles
```

---

## 🔍 PONTOS DE ATENÇÃO PARA DESENVOLVIMENTO

### **1. Autenticação e Autorização**
- Sempre verificar `user.id` vs `profile.id`
- Usar RLS (Row Level Security) do Supabase
- Verificar roles: `model`, `contractor`, `admin`

### **2. Upload de Arquivos**
- Usar Supabase Storage
- Validar tipos e tamanhos
- Processar imagens (crop, resize)

### **3. Pagamentos**
- Sempre verificar status via webhook
- Implementar fallbacks para falhas
- Logs detalhados de transações

### **4. Emails**
- Múltiplos provedores (Resend, SendGrid, SMTP)
- Templates dinâmicos
- Logs de envio

### **5. Performance**
- Lazy loading de componentes
- Otimização de imagens
- Cache de dados

### **6. Segurança**
- Validação de entrada
- Sanitização de dados
- Rate limiting

---

## 📝 INSTRUÇÕES PARA O CURSOR

### **Como Usar Esta Análise**

1. **Antes de Qualquer Desenvolvimento:**
   - Leia esta análise completa
   - Entenda os relacionamentos entre tabelas
   - Verifique as edge functions existentes
   - Consulte o CHANGELOG.md para histórico

2. **Ao Implementar Novas Funcionalidades:**
   - Verifique se já existe estrutura similar
   - Use os padrões estabelecidos
   - Mantenha consistência com o design system
   - Implemente logs e tratamento de erros

3. **Ao Modificar Funcionalidades Existentes:**
   - Verifique impactos em outras partes
   - Teste relacionamentos de banco
   - Mantenha compatibilidade com dados existentes
   - Atualize documentação

4. **Boas Práticas:**
   - Sempre use TypeScript quando possível
   - Implemente loading states
   - Trate erros graciosamente
   - Mantenha responsividade
   - Teste em diferentes dispositivos

### **Estrutura de Arquivos Importante**
```
src/
├── components/     # Componentes React
├── contexts/       # Contextos de estado
├── hooks/          # Hooks customizados
├── lib/           # Utilitários e clientes
├── pages/         # Páginas principais
└── ui/            # Componentes de UI

supabase/
├── functions/     # Edge Functions
├── sql/          # Scripts SQL
└── config.toml   # Configuração Supabase
```

### **Comandos Úteis**
```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Supabase
supabase start
supabase functions deploy
supabase db reset
```

---

## 🎯 CONCLUSÃO

O sistema Banco de Modelos é uma plataforma robusta e bem estruturada, com funcionalidades avançadas de marketplace, pagamentos, notificações e administração. A arquitetura modular permite fácil manutenção e expansão, enquanto as integrações com serviços externos garantem confiabilidade e escalabilidade.

**Principais Pontos Fortes:**
- Arquitetura bem estruturada
- Sistema de autenticação robusto
- Integração com múltiplos provedores
- Interface responsiva e moderna
- Sistema de notificações completo
- Administração avançada

**Áreas de Atenção:**
- Manter consistência de dados
- Otimizar performance
- Implementar testes automatizados
- Manter documentação atualizada 