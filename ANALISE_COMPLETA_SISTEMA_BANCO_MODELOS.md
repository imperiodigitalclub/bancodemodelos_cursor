# ANÁLISE COMPLETA DO SISTEMA BANCO DE MODELOS

## 📋 RESUMO EXECUTIVO

O **Banco de Modelos** é uma plataforma completa de marketplace para modelos, fotógrafos e contratantes, desenvolvida em React + Vite com backend Supabase (PostgreSQL). O sistema possui funcionalidades avançadas de autenticação, pagamentos, notificações, gestão de conteúdo e administração.

**Status Atual:** Sistema em produção com funcionalidades completas implementadas e testadas.

---

## 🏗️ ARQUITETURA DO SISTEMA

### **Frontend (React + Vite)**
- **Framework**: React 18 com Vite
- **UI**: Tailwind CSS + Shadcn/ui
- **Roteamento**: React Router DOM
- **Estado**: Context API + Hooks customizados
- **Build**: Vite com configurações otimizadas
- **Lazy Loading**: Implementado para otimização de performance

### **Backend (Supabase)**
- **Banco**: PostgreSQL 17.4
- **Autenticação**: Supabase Auth com RLS
- **Storage**: Supabase Storage para uploads
- **Edge Functions**: Deno runtime para APIs
- **Realtime**: WebSockets para notificações em tempo real

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### **Schemas Principais**

#### **Schema `public` (Tabelas de Negócio)**

| Tabela | Descrição | Relacionamentos | Status |
|--------|-----------|-----------------|---------|
| `profiles` | Perfis de usuários (modelos, contratantes, admins) | FK: auth.users | ✅ Ativo |
| `jobs` | Vagas de trabalho publicadas | FK: profiles (criador) | ✅ Ativo |
| `job_applications` | Candidaturas para vagas | FK: jobs, profiles | ✅ Ativo |
| `job_contracts` | Contratos fechados | FK: jobs, profiles | ✅ Ativo |
| `reviews` | Avaliações de usuários | FK: profiles (avaliador/avaliado) | ✅ Ativo |
| `user_favorites` | Favoritos dos usuários | FK: profiles | ✅ Ativo |
| `profile_photos` | Fotos dos perfis | FK: profiles | ✅ Ativo |
| `profile_videos` | Vídeos dos perfis | FK: profiles | ✅ Ativo |
| `notifications` | Sistema de notificações | FK: profiles | ✅ Ativo |
| `notification_preferences` | Preferências de notificação | FK: profiles | ✅ Ativo |
| `wallet_transactions` | Transações da carteira | FK: profiles | ✅ Ativo |
| `withdrawal_requests` | Solicitações de saque | FK: profiles | ✅ Ativo |
| `user_verifications` | Verificações de usuário | FK: profiles | ✅ Ativo |
| `subscriptions` | Assinaturas premium | FK: profiles | ✅ Ativo |
| `user_fcm_tokens` | Tokens para push notifications | FK: profiles | ✅ Ativo |

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

| Tabela | Descrição | Status |
|--------|-----------|---------|
| `app_settings` | Configurações gerais do sistema | ✅ Ativo |
| `email_templates` | Templates de email | ✅ Ativo |
| `email_logs` | Logs de envio de emails | ✅ Ativo |
| `broadcast_logs` | Logs de broadcasts | ✅ Ativo |
| `landing_pages` | Páginas de landing | ✅ Ativo |
| `menus` | Configuração de menus | ✅ Ativo |
| `pages` | Páginas dinâmicas | ✅ Ativo |
| `model_characteristics_options` | Opções de características | ✅ Ativo |
| `work_interests_options` | Opções de interesses | ✅ Ativo |
| `webhook_events` | Eventos de webhook | ✅ Ativo |

---

## 🔐 SISTEMA DE AUTENTICAÇÃO E CADASTRO

### **Fluxo de Registro Completo**
1. **UserTypeStep** - Escolha do tipo (Modelo/Contratante)
2. **AccountDetailsStep** - Email, senha, nome
3. **ProfilePictureStep** - Upload de foto
4. **ModelProfileTypeStep** - Tipo de perfil (se modelo)
5. **ModelPhysicalTypeStep** - Tipo físico
6. **ModelPhysicalProfileStep** - Dados físicos (altura, peso, medidas)
7. **ModelCharacteristicsStep** - Características (cabelo, olhos, etc.)
8. **ModelInterestsStep** - Interesses de trabalho
9. **ModelAppearanceStep** - Aparência e estilo
10. **LocationStep** - Localização (cidade, estado)
11. **InstagramStep** - Instagram
12. **WhatsappStep** - WhatsApp

### **Tipos de Usuário**
- **Modelo** - Perfil completo com características físicas e medidas
- **Contratante** - Perfil simplificado para contratar
- **Fotógrafo** - Perfil especializado para fotografia
- **Admin** - Acesso administrativo completo

### **Funcionalidades de Autenticação**
- ✅ Login/Logout com Supabase Auth
- ✅ Registro multi-step com validação
- ✅ Upload de foto de perfil
- ✅ Verificação de email
- ✅ Recuperação de senha
- ✅ Proteção de rotas por tipo de usuário
- ✅ Modal de boas-vindas para novos usuários

---

## 💰 SISTEMA DE PAGAMENTOS

### **Integração Mercado Pago**
- **Criação de preferência** - `create-payment-preference/`
- **Processamento** - `process-payment/`
- **Webhook** - `mp-webhook/` (versão 2.1.0)
- **Verificação de status** - `check_payment_status_mp.sql`

### **Funcionalidades Implementadas**
- ✅ Criação de preferências de pagamento
- ✅ Processamento de pagamentos PIX e cartão
- ✅ Webhook robusto com validação de assinatura
- ✅ Sistema de idempotência para evitar duplicatas
- ✅ Logs detalhados de transações
- ✅ Verificação automática de status
- ✅ Tratamento de erros e fallbacks

### **Carteira Digital**
- **Transações** - `wallet_transactions`
- **Solicitações de saque** - `withdrawal_requests`
- **Verificações** - `user_verifications`

### **Assinaturas Premium**
- **Tabela** - `subscriptions`
- **Contexto** - `SmartSubscriptionContext`
- **Hook** - `useSmartSubscription`
- **Sistema Inteligente** - Sincronização automática baseada em pagamentos

---

## 🎯 SISTEMA DE VAGAS E MATCH

### **Funcionalidades de Vagas**
- ✅ Publicação de vagas por contratantes
- ✅ Busca e filtros avançados
- ✅ Candidaturas de modelos
- ✅ Gestão de candidatos
- ✅ Sistema de contratos
- ✅ Avaliações pós-trabalho
- ✅ Vagas regionais e nacionais

### **Sistema de Match**
- ✅ Separação de vagas por região
- ✅ Filtros por tipo de trabalho
- ✅ Filtros por características físicas
- ✅ Filtros por interesses
- ✅ Ordenação por relevância e data
- ✅ Alertas para vagas da região

### **Fluxo de Trabalho**
1. **Contratante** publica vaga com requisitos específicos
2. **Sistema** filtra e apresenta vagas relevantes para modelos
3. **Modelo** se candidata à vaga
4. **Contratante** avalia candidatos
5. **Sistema** facilita contratação e pagamento
6. **Ambas as partes** avaliam após o trabalho

---

## 📧 SISTEMA DE EMAILS

### **Configuração Multi-Provedor**
- **Resend** - API Key começando com `re_`
- **SendGrid** - API Key começando com `SG.`
- **SMTP Genérico** - Configuração manual

### **Templates Disponíveis**
- ✅ Boas-vindas para novos usuários
- ✅ Confirmação de email
- ✅ Reset de senha
- ✅ Notificações de vaga
- ✅ Status de pagamento
- ✅ Status de assinatura
- ✅ Broadcasts em massa

### **Funcionalidades**
- ✅ Envio automático via Edge Functions
- ✅ Logs detalhados de envio
- ✅ Fallback entre provedores
- ✅ Templates dinâmicos
- ✅ Configuração via painel admin

---

## 🔔 SISTEMA DE NOTIFICAÇÕES

### **Tipos de Notificação**
- **Email** - Via SMTP/Resend/SendGrid
- **Push** - Via FCM tokens
- **In-app** - Via Supabase Realtime

### **Funcionalidades**
- ✅ Notificações em tempo real
- ✅ Contagem de não lidas
- ✅ Marcação como lida
- ✅ Preferências por tipo
- ✅ Notificações automáticas para:
  - Novas candidaturas
  - Status de pagamento
  - Assinatura ativada/expirada
  - Mensagens recebidas
  - Vagas da região

### **Hooks Customizados**
- `useNotifications` - Gestão completa de notificações
- `useNotificationCount` - Contagem de não lidas
- `useCreateNotification` - Criação de notificações

---

## 🔧 EDGE FUNCTIONS

### **Funções de Email**
- `send-email/` - Envio via SMTP/Resend/SendGrid
- `send-email-resend/` - Envio específico via Resend
- `webhook-email/` - Webhook para emails

### **Funções de Pagamento**
- `create-payment-preference/` - Criar preferência Mercado Pago
- `process-payment/` - Processar pagamentos
- `mp-webhook/` - Webhook Mercado Pago (v2.1.0)
- `get-mp-public-key/` - Obter chave pública MP

### **Funções Administrativas**
- `send-broadcast/` - Enviar broadcasts
- `delete-auth-user/` - Deletar usuário
- `save-app-secrets/` - Salvar segredos
- `generate-fake-jobs/` - Gerar vagas de teste

---

## 🎨 ESTRUTURA DO FRONTEND

### **Componentes Principais**

#### **Autenticação (`src/components/auth/`)**
- `AuthModal.jsx` - Modal de login/registro
- `WelcomeModal.jsx` - Modal de boas-vindas
- `RegistrationLoadingModal.jsx` - Loading do registro
- Steps de registro completos com validação

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
- `JobsPage.jsx` - Lista de vagas (completa)
- `ProfilePage.jsx` - Perfil público
- `ContractorsPage.jsx` - Lista de contratantes
- `FavoritesPage.jsx` - Favoritos

#### **Admin (`src/components/pages/admin/`)**
- `AdminDashboardPage.jsx` - Dashboard admin completo
- Tabs administrativas para todas as funcionalidades

### **Contextos (`src/contexts/`)**
- `AuthContext.jsx` - Contexto de autenticação
- `PaymentContext.jsx` - Contexto de pagamentos
- `SmartSubscriptionContext.jsx` - Contexto de assinatura
- `SupabaseAuthContext.jsx` - Contexto Supabase

### **Hooks (`src/hooks/`)**
- `useNotifications.js` - Hook de notificações
- `useSmartSubscription.js` - Hook de assinatura
- `useAsyncState.js` - Hook para estados assíncronos

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

## 🎯 FUNCIONALIDADES PRINCIPAIS

### **Para Modelos**
- ✅ Perfil completo com características físicas
- ✅ Galeria de fotos e vídeos
- ✅ Sistema de avaliações
- ✅ Candidatura para vagas
- ✅ Carteira digital
- ✅ Assinatura premium
- ✅ Notificações personalizadas

### **Para Contratantes**
- ✅ Publicação de vagas
- ✅ Busca de modelos
- ✅ Sistema de avaliações
- ✅ Contratação direta
- ✅ Histórico de contratos
- ✅ Gestão de candidatos

### **Para Administradores**
- ✅ Gestão completa de usuários
- ✅ Moderação de conteúdo
- ✅ Configurações do sistema
- ✅ Relatórios e analytics
- ✅ Broadcasts em massa
- ✅ Gestão de pagamentos
- ✅ Configuração de emails

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

## 🔍 PONTOS DE ATENÇÃO PARA DESENVOLVIMENTO

### **1. Autenticação e Autorização**
- ✅ Sempre verificar `user.id` vs `profile.id`
- ✅ Usar RLS (Row Level Security) do Supabase
- ✅ Verificar roles: `model`, `contractor`, `admin`
- ✅ Proteção de rotas implementada

### **2. Upload de Arquivos**
- ✅ Usar Supabase Storage
- ✅ Validar tipos e tamanhos
- ✅ Processar imagens (crop, resize)

### **3. Pagamentos**
- ✅ Sempre verificar status via webhook
- ✅ Implementar fallbacks para falhas
- ✅ Logs detalhados de transações
- ✅ Sistema de idempotência

### **4. Emails**
- ✅ Múltiplos provedores (Resend, SendGrid, SMTP)
- ✅ Templates dinâmicos
- ✅ Logs de envio
- ✅ Fallback automático

### **5. Performance**
- ✅ Lazy loading de componentes
- ✅ Otimização de imagens
- ✅ Cache de dados
- ✅ Paginação implementada

### **6. Segurança**
- ✅ Validação de entrada
- ✅ Sanitização de dados
- ✅ Rate limiting
- ✅ RLS implementado

---

## 📝 INSTRUÇÕES PARA O CURSOR

### **Como Usar Esta Análise**

1. **Antes de Qualquer Desenvolvimento:**
   - ✅ Ler esta análise completa
   - ✅ Entender os relacionamentos entre tabelas
   - ✅ Verificar as edge functions existentes
   - ✅ Consulte o CHANGELOG.md para histórico

2. **Ao Implementar Novas Funcionalidades:**
   - ✅ Verificar se já existe estrutura similar
   - ✅ Use os padrões estabelecidos
   - ✅ Mantenha consistência com o design system
   - ✅ Implemente logs e tratamento de erros

3. **Ao Modificar Funcionalidades Existentes:**
   - ✅ Verificar impactos em outras partes
   - ✅ Teste relacionamentos de banco
   - ✅ Mantenha compatibilidade com dados existentes
   - ✅ Atualize documentação

4. **Boas Práticas:**
   - ✅ Sempre use TypeScript quando possível
   - ✅ Implemente loading states
   - ✅ Trate erros graciosamente
   - ✅ Mantenha responsividade
   - ✅ Teste em diferentes dispositivos

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
supabase --project-ref fgmdqayaqafxutbncypt start
supabase --project-ref fgmdqayaqafxutbncypt functions deploy
supabase --project-ref fgmdqayaqafxutbncypt db reset
```

---

## 🎯 CONCLUSÃO

O sistema Banco de Modelos é uma plataforma robusta e bem estruturada, com funcionalidades avançadas de marketplace, pagamentos, notificações e administração. A arquitetura modular permite fácil manutenção e expansão, enquanto as integrações com serviços externos garantem confiabilidade e escalabilidade.

**Principais Pontos Fortes:**
- ✅ Arquitetura bem estruturada
- ✅ Sistema de autenticação robusto
- ✅ Integração com múltiplos provedores
- ✅ Interface responsiva e moderna
- ✅ Sistema de notificações completo
- ✅ Administração avançada
- ✅ Sistema de pagamentos confiável
- ✅ Match inteligente entre vagas e modelos

**Áreas de Atenção:**
- Manter consistência de dados
- Otimizar performance
- Implementar testes automatizados
- Manter documentação atualizada 

**Status do Sistema:** ✅ PRODUÇÃO - Funcionando com todas as funcionalidades principais implementadas e testadas. 