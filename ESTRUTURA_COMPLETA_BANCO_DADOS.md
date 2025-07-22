# ESTRUTURA COMPLETA DA BASE DE DADOS - BANCO DE MODELOS

## 🔧 CONFIGURAÇÃO DO PROJETO

### **Supabase:**
- **Project ID:** `fgmdqayaqafxutbncypt`
- **URL:** `https://fgmdqayaqafxutbncypt.supabase.co`
- **Database:** PostgreSQL 17.4
- **Importante:** Sempre especificar este projeto ao executar comandos

### **Comandos Importantes:**
```bash
# Conectar ao projeto correto
supabase --project-ref fgmdqayaqafxutbncypt status

# Deploy de edge functions
supabase --project-ref fgmdqayaqafxutbncypt functions deploy

# Reset do banco local
supabase --project-ref fgmdqayaqafxutbncypt db reset

# Iniciar ambiente local
supabase --project-ref fgmdqayaqafxutbncypt start
```

---

## 📋 TABELAS PRINCIPAIS (Schema `public`)

### **1. PROFILES (Tabela Central)**
```sql
CREATE TABLE public.profiles (
    id uuid NOT NULL, -- FK para auth.users
    email text,
    user_type text DEFAULT 'model', -- 'model', 'contractor', 'admin'
    phone text,
    city text, state text,
    -- Dados físicos (modelos)
    height text, weight text, bust text, waist text, hips text,
    model_type text, model_physical_type text,
    hair_color text, eye_color text, shoe_size text, gender text,
    model_characteristics text[], work_interests text[],
    -- Dados empresariais (contratantes)
    company_name text, company_details text, company_website text,
    -- Verificação e assinatura
    is_verified boolean DEFAULT false,
    is_identity_verified boolean DEFAULT false,
    verification_status text DEFAULT 'not_verified',
    subscription_type text, subscription_status text,
    subscription_expires_at timestamp with time zone,
    -- Carteira e avaliações
    wallet_balance numeric(10,2) DEFAULT 0.00,
    cache_value numeric(10,2) DEFAULT 0.00,
    avg_rating numeric(2,1) DEFAULT 0.0,
    rating_count integer DEFAULT 0,
    -- Dados pessoais
    first_name text, last_name text, profile_slug text,
    legal_full_name text, birth_date date, cpf text,
    -- Contato e redes
    profile_image_url text, instagram_handle text, instagram_handle_raw text,
    bio text, pix_info jsonb,
    -- Configurações
    platform_fee_on_hiring numeric(5,2) DEFAULT 10.00,
    display_age integer, notification_preferences jsonb,
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    email_confirmed_at timestamp with time zone,
    email_verified boolean DEFAULT false,
    phone_verified boolean DEFAULT false,
    last_login_at timestamp with time zone,
    login_count integer DEFAULT 0
);
```

### **2. JOBS (Sistema de Vagas)**
```sql
CREATE TABLE public.jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_by uuid NOT NULL, -- FK para profiles
    title text NOT NULL, description text,
    status text DEFAULT 'open', -- 'open', 'closed', 'cancelled'
    job_type text, job_city text, job_state text,
    event_date date, event_time time without time zone,
    duration_days integer DEFAULT 1,
    daily_rate numeric(10,2),
    num_models_needed integer DEFAULT 1,
    required_model_type text, required_model_profile text,
    specific_requirements text, job_image_url text,
    required_interests text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

### **3. JOB_APPLICATIONS (Candidaturas)**
```sql
CREATE TABLE public.job_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL, -- FK para jobs
    model_id uuid NOT NULL, -- FK para profiles
    status text DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    application_date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

### **4. JOB_CONTRACTS (Contratos)**
```sql
CREATE TABLE public.job_contracts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL, -- FK para jobs
    hirer_id uuid NOT NULL, -- FK para profiles (contratante)
    model_id uuid NOT NULL, -- FK para profiles (modelo)
    status text DEFAULT 'proposed', -- 'proposed', 'accepted', 'completed'
    agreed_value numeric(10,2),
    platform_fee_amount numeric(10,2),
    agreed_cache jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

### **5. REVIEWS (Avaliações)**
```sql
CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reviewer_id uuid NOT NULL, -- FK para profiles (quem avalia)
    reviewee_id uuid NOT NULL, -- FK para profiles (quem é avaliado)
    job_id uuid, -- FK para jobs (opcional)
    rating numeric NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text, review_type text,
    created_at timestamp with time zone DEFAULT now()
);
```

### **6. WALLET_TRANSACTIONS (Transações Financeiras)**
```sql
CREATE TABLE public.wallet_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL, -- FK para profiles
    type text NOT NULL, -- 'payment', 'withdrawal', 'subscription', 'refund'
    amount numeric(10,2) NOT NULL,
    status text NOT NULL, -- 'pending', 'approved', 'failed', 'cancelled'
    description text, status_detail text,
    provider_transaction_id text, payment_method_id text,
    external_reference text, related_id text,
    metadata jsonb, provider_data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

### **7. SUBSCRIPTIONS (Assinaturas)**
```sql
CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid, -- FK para profiles
    status text, -- 'active', 'cancelled', 'expired'
    started_at timestamp without time zone,
    expires_at timestamp without time zone,
    last_payment_id uuid,
    plan text, -- 'basic', 'pro', 'premium'
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
```

### **8. USER_FAVORITES (Favoritos)**
```sql
CREATE TABLE public.user_favorites (
    id integer NOT NULL,
    user_id uuid NOT NULL, -- FK para profiles (quem favorita)
    favorited_profile_id uuid NOT NULL, -- FK para profiles (favoritado)
    created_at timestamp with time zone DEFAULT now()
);
```

### **9. PROFILE_PHOTOS (Fotos dos Perfis)**
```sql
CREATE TABLE public.profile_photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL, -- FK para profiles
    image_url text NOT NULL,
    caption text, sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);
```

### **10. PROFILE_VIDEOS (Vídeos dos Perfis)**
```sql
CREATE TABLE public.profile_videos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL, -- FK para profiles
    video_url text NOT NULL,
    thumbnail_url text, caption text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);
```

### **11. NOTIFICATIONS (Sistema de Notificações)**
```sql
CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id uuid NOT NULL, -- FK para profiles
    type text DEFAULT 'system', -- 'system', 'job', 'payment', 'subscription'
    title text DEFAULT 'Notificação',
    message text DEFAULT 'Nova notificação',
    data jsonb DEFAULT '{}',
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    read_at timestamp with time zone
);
```

### **12. NOTIFICATION_PREFERENCES (Preferências de Notificação)**
```sql
CREATE TABLE public.notification_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL, -- FK para profiles
    in_app_enabled boolean DEFAULT true,
    email_enabled boolean DEFAULT true,
    push_enabled boolean DEFAULT true,
    -- Tipos específicos
    account_welcome boolean DEFAULT true,
    verification_updates boolean DEFAULT true,
    subscription_updates boolean DEFAULT true,
    favorites_received boolean DEFAULT true,
    messages_received boolean DEFAULT true,
    wallet_updates boolean DEFAULT true,
    job_matches boolean DEFAULT true,
    job_applications boolean DEFAULT true,
    job_selections boolean DEFAULT true,
    hiring_proposals boolean DEFAULT true,
    work_reminders boolean DEFAULT true,
    payment_disputes boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

### **13. USER_VERIFICATIONS (Verificações de Usuário)**
```sql
CREATE TABLE public.user_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL, -- FK para profiles
    full_name text NOT NULL, birth_date date NOT NULL,
    document_type text NOT NULL,
    document_front_image_url text,
    document_back_image_url text,
    document_selfie_url text,
    cpf text NOT NULL,
    pix_key_type text NOT NULL, pix_key text NOT NULL,
    status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    admin_notes text,
    requested_at timestamp with time zone DEFAULT now(),
    reviewed_at timestamp with time zone
);
```

### **14. WITHDRAWAL_REQUESTS (Solicitações de Saque)**
```sql
CREATE TABLE public.withdrawal_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL, -- FK para profiles
    amount numeric(10,2) NOT NULL,
    pix_key text NOT NULL,
    pix_key_type text NOT NULL,
    status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    admin_notes text,
    requested_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone
);
```

### **15. USER_FCM_TOKENS (Tokens Push)**
```sql
CREATE TABLE public.user_fcm_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid, -- FK para profiles
    token text NOT NULL,
    device_type text, is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

## 📋 TABELAS DE CONFIGURAÇÃO

### **16. APP_SETTINGS (Configurações Gerais)**
```sql
CREATE TABLE public.app_settings (
    key text NOT NULL,
    value jsonb,
    description text,
    updated_at timestamp with time zone DEFAULT now()
);
```

### **17. EMAIL_TEMPLATES (Templates de Email)**
```sql
CREATE TABLE public.email_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trigger_identifier text NOT NULL, -- 'welcome_email', 'verification_approved', etc.
    name text NOT NULL, subject text NOT NULL,
    body_html text NOT NULL, is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

### **18. EMAIL_LOGS (Logs de Email)**
```sql
CREATE TABLE public.email_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid, -- FK para profiles
    template_identifier text NOT NULL,
    subject text NOT NULL, recipient_email text NOT NULL,
    status text DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    error_message text, sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'
);
```

### **19. BROADCAST_LOGS (Logs de Broadcast)**
```sql
CREATE TABLE public.broadcast_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL, message text NOT NULL,
    channels text[] DEFAULT '{}', -- ['in_app', 'email', 'push']
    target_audience text DEFAULT 'all', -- 'all', 'models', 'contractors'
    total_recipients integer DEFAULT 0,
    sent_count integer DEFAULT 0, failed_count integer DEFAULT 0,
    status text DEFAULT 'pending', -- 'pending', 'sending', 'completed', 'failed'
    created_by uuid, -- FK para profiles (admin)
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'
);
```

### **20. LANDING_PAGES (Páginas Dinâmicas)**
```sql
CREATE TABLE public.landing_pages (
    slug text NOT NULL, title text NOT NULL,
    content jsonb, is_published boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

### **21. MENUS (Configuração de Menus)**
```sql
CREATE TABLE public.menus (
    id integer NOT NULL, name text NOT NULL,
    items jsonb, -- Estrutura do menu
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

### **22. PAGES (Páginas do Sistema)**
```sql
CREATE TABLE public.pages (
    id integer NOT NULL, slug text NOT NULL,
    title text NOT NULL, content jsonb,
    is_published boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

### **23. MODEL_CHARACTERISTICS_OPTIONS (Opções de Características)**
```sql
CREATE TABLE public.model_characteristics_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    value text GENERATED ALWAYS AS (lower(regexp_replace(name, '[^a-zA-Z0-9]+', '_', 'g'))) STORED,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

### **24. WORK_INTERESTS_OPTIONS (Opções de Interesses)**
```sql
CREATE TABLE public.work_interests_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    value text GENERATED ALWAYS AS (lower(regexp_replace(name, '[^a-zA-Z0-9]+', '_', 'g'))) STORED,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```

### **25. WEBHOOK_EVENTS (Eventos de Webhook)**
```sql
CREATE TABLE public.webhook_events (
    id bigint NOT NULL, event_id text,
    status text, processed_at timestamp without time zone,
    payload jsonb
);
```

### **26. ESCROW (Sistema de Escrow)**
```sql
CREATE TABLE public.escrow (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id text, contractor_id uuid, client_id uuid,
    amount numeric(12,2) NOT NULL, status text,
    transaction_id uuid, released_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);
```

## 📋 VIEWS IMPORTANTES

### **1. PROFILES_WITH_NAME (View de Compatibilidade)**
```sql
CREATE VIEW public.profiles_with_name AS
SELECT *, 
  CASE
    WHEN (first_name IS NOT NULL AND last_name IS NOT NULL) THEN (first_name || ' ' || last_name)
    WHEN (first_name IS NOT NULL) THEN first_name
    WHEN (last_name IS NOT NULL) THEN last_name
    WHEN (company_name IS NOT NULL) THEN company_name
    WHEN (email IS NOT NULL) THEN split_part(email, '@', 1)
    ELSE 'Usuário'
  END AS name
FROM public.profiles;
```

### **2. SMART_SUBSCRIPTION_STATUS (Status Inteligente de Assinatura)**
```sql
CREATE VIEW public.smart_subscription_status AS
SELECT p.id AS user_id,
  COALESCE(TRIM(BOTH FROM ((COALESCE(p.first_name, '') || ' ') || COALESCE(p.last_name, ''))), 'Usuário') AS name,
  p.email, p.subscription_type AS current_subscription_type,
  p.subscription_expires_at AS current_expires_at,
  CASE
    WHEN (wt.latest_payment_date IS NOT NULL AND wt.latest_payment_date > (now() - '30 days'::interval)) THEN 'pro'
    ELSE NULL
  END AS calculated_subscription_type,
  CASE
    WHEN (wt.latest_payment_date IS NOT NULL AND wt.latest_payment_date > (now() - '30 days'::interval)) THEN (wt.latest_payment_date + '30 days'::interval)
    ELSE NULL
  END AS calculated_expires_at,
  wt.latest_payment_date, wt.latest_payment_id, wt.latest_payment_amount,
  CASE
    WHEN ((wt.latest_payment_date IS NOT NULL AND wt.latest_payment_date > (now() - '30 days'::interval) AND p.subscription_type <> 'pro') OR 
          (wt.latest_payment_date IS NULL OR (wt.latest_payment_date <= (now() - '30 days'::interval) AND p.subscription_type = 'pro'))) THEN true
    ELSE false
  END AS needs_sync,
  now() AS calculated_at
FROM public.profiles p
LEFT JOIN (
  SELECT wallet_transactions.user_id,
    max(wallet_transactions.created_at) AS latest_payment_date,
    max(wallet_transactions.provider_transaction_id) AS latest_payment_id,
    max(wallet_transactions.amount) AS latest_payment_amount
  FROM public.wallet_transactions
  WHERE (wallet_transactions.type = 'subscription' AND wallet_transactions.status = 'approved' 
         AND wallet_transactions.created_at > (now() - '60 days'::interval))
  GROUP BY wallet_transactions.user_id
) wt ON (p.id = wt.user_id)
WHERE (p.user_type = 'model');
```

### **3. EMAIL_STATISTICS (Estatísticas de Email)**
```sql
CREATE VIEW public.email_statistics AS
SELECT date(created_at) AS date,
  count(*) AS total_emails,
  count(CASE WHEN (status = 'sent') THEN 1 ELSE NULL END) AS sent_emails,
  count(CASE WHEN (status = 'failed') THEN 1 ELSE NULL END) AS failed_emails,
  count(CASE WHEN (status = 'pending') THEN 1 ELSE NULL END) AS pending_emails,
  template_identifier,
  count(DISTINCT user_id) AS unique_users
FROM public.email_logs
GROUP BY (date(created_at)), template_identifier
ORDER BY (date(created_at)) DESC, template_identifier;
```

### **4. BROADCAST_STATISTICS (Estatísticas de Broadcast)**
```sql
CREATE VIEW public.broadcast_statistics AS
SELECT id, title, target_audience,
  total_recipients, sent_count, failed_count,
  status, created_at,
  CASE
    WHEN (completed_at IS NOT NULL) THEN (EXTRACT(epoch FROM (completed_at - started_at)))::integer
    ELSE NULL
  END AS duration_seconds
FROM public.broadcast_logs
ORDER BY created_at DESC;
```

## 🔧 FUNÇÕES PRINCIPAIS

### **1. FUNÇÕES DE AUTENTICAÇÃO E PERFIL**
```sql
-- Criar perfil de usuário
CREATE FUNCTION public.create_user_profile(user_id uuid, user_email text, user_metadata jsonb) RETURNS jsonb

-- Criar perfil manual
CREATE FUNCTION public.create_profile_manual(p_user_id uuid, p_email text, p_metadata jsonb) RETURNS json

-- Gerar slug do perfil
CREATE FUNCTION public.generate_profile_slug(p_first_name text, p_last_name text, p_user_id uuid) RETURNS text

-- Obter nome completo do usuário
CREATE FUNCTION public.get_user_full_name(p_user_id uuid) RETURNS text

-- Admin deletar usuário
CREATE FUNCTION public.admin_delete_user(user_id_to_delete uuid) RETURNS json
```

### **2. FUNÇÕES DE NOTIFICAÇÕES**
```sql
-- Criar notificação
CREATE FUNCTION public.create_notification(p_user_id uuid, p_type text, p_title text, p_message text, p_data jsonb DEFAULT NULL) RETURNS bigint

-- Obter notificações do usuário
CREATE FUNCTION public.get_user_notifications(p_user_id uuid, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0) RETURNS TABLE(...)

-- Marcar notificação como lida
CREATE FUNCTION public.mark_notification_read(p_notification_id bigint, p_user_id uuid DEFAULT NULL) RETURNS json

-- Marcar todas como lidas
CREATE FUNCTION public.mark_all_notifications_read(p_user_id uuid) RETURNS json

-- Contar não lidas
CREATE FUNCTION public.get_unread_notification_count(p_user_id uuid) RETURNS integer

-- Criar preferências padrão
CREATE FUNCTION public.create_default_notification_preferences() RETURNS trigger
```

### **3. FUNÇÕES DE EMAIL**
```sql
-- Enviar email automatizado
CREATE FUNCTION public.send_automated_email(p_user_id uuid, p_template_identifier text, p_metadata jsonb DEFAULT '{}') RETURNS uuid

-- Enviar email direto
CREATE FUNCTION public.send_email_direct(p_to_email text, p_subject text, p_html_content text) RETURNS boolean

-- Enviar notificação para admin
CREATE FUNCTION public.send_admin_notification(p_template_identifier text, p_metadata jsonb DEFAULT '{}') RETURNS integer

-- Enviar notificação automática para admin
CREATE FUNCTION public.send_admin_notification_auto(p_user_id uuid, p_user_email text, p_user_name text) RETURNS boolean

-- Enviar broadcast
CREATE FUNCTION public.send_broadcast(p_title text, p_message text, p_channels text[] DEFAULT ARRAY['in_app', 'email'], p_target_audience text DEFAULT 'all', p_created_by uuid DEFAULT NULL) RETURNS json
```

### **4. FUNÇÕES DE PAGAMENTOS E CARTEIRA**
```sql
-- Atualizar saldo da carteira
CREATE FUNCTION public.update_wallet_balance(p_user_id uuid, p_amount numeric, p_transaction_description text, p_provider_transaction_id text DEFAULT NULL, p_transaction_status text DEFAULT 'completed', p_payment_method_id text DEFAULT NULL, p_status_detail text DEFAULT NULL, p_external_reference text DEFAULT NULL, p_metadata jsonb DEFAULT '{}', p_provider_data jsonb DEFAULT '{}', p_related_id text DEFAULT NULL) RETURNS json

-- Processar webhook de pagamento
CREATE FUNCTION public.process_payment_webhook(p_provider_transaction_id text, p_external_reference text, p_new_status text, p_status_detail text, p_payment_method_id text, p_provider_data jsonb) RETURNS json

-- Verificar status de pagamento MP
CREATE FUNCTION public.check_payment_status_mp(p_payment_id text) RETURNS json

-- Verificar todos os pagamentos pendentes
CREATE FUNCTION public.check_all_pending_payments() RETURNS json

-- Limpar transações antigas
CREATE FUNCTION public.cleanup_old_transactions() RETURNS json

-- Expirar transações antigas
CREATE FUNCTION public.expire_old_transactions_simple() RETURNS integer
```

### **5. FUNÇÕES DE ASSINATURA**
```sql
-- Processar nova assinatura
CREATE FUNCTION public.process_new_subscription(p_user_id uuid, p_plan_identifier text, p_duration_months integer, p_payment_provider text, p_provider_transaction_id text, p_amount_paid numeric, p_transaction_status text, p_metadata jsonb DEFAULT '{}') RETURNS json

-- Sincronizar status de assinatura
CREATE FUNCTION public.sync_subscription_status(p_user_id uuid) RETURNS json

-- Sincronizar todas as assinaturas
CREATE FUNCTION public.sync_all_subscriptions() RETURNS json

-- Revogar assinatura pro
CREATE FUNCTION public.revoke_pro_subscription(p_user_id uuid) RETURNS void

-- Obter status inteligente de assinatura
CREATE FUNCTION public.get_smart_subscription_status(p_user_id uuid) RETURNS json
```

### **6. FUNÇÕES DE VERIFICAÇÃO**
```sql
-- Solicitar nova verificação
CREATE FUNCTION public.request_new_verification(p_user_id uuid, p_full_name text, p_birth_date date, p_document_type text, p_document_front_image_url text, p_document_back_image_url text, p_document_selfie_url text, p_cpf text, p_pix_key_type text, p_pix_key text) RETURNS json

-- Enviar notificação de verificação
CREATE FUNCTION public.send_verification_notification(p_user_id uuid, p_status text, p_reason text DEFAULT NULL) RETURNS json
```

### **7. FUNÇÕES DE TRABALHO**
```sql
-- Obter ou criar conversa
CREATE FUNCTION public.get_or_create_conversation(p_hirer_id uuid, p_model_id uuid) RETURNS TABLE(id uuid)

-- Notificar nova mensagem
CREATE FUNCTION public.notify_new_message(p_receiver_id uuid, p_sender_id uuid, p_sender_name text, p_message_preview text) RETURNS json

-- Enviar notificação de favorito
CREATE FUNCTION public.send_favorite_notification(p_user_id uuid, p_favorited_by_user_id uuid) RETURNS json
```

### **8. FUNÇÕES DE LIMPEZA E MANUTENÇÃO**
```sql
-- Limpar notificações antigas
CREATE FUNCTION public.cleanup_old_notifications() RETURNS json

-- Limpar registros órfãos
CREATE FUNCTION public.cleanup_orphaned_records() RETURNS json

-- Limpar transações inválidas
CREATE FUNCTION public.cleanup_invalid_transactions() RETURNS json

-- Limpar transações de admin
CREATE FUNCTION public.cleanup_admin_transactions() RETURNS json

-- Contar transações antigas
CREATE FUNCTION public.count_old_transactions() RETURNS json
```

### **9. FUNÇÕES DE ADMIN**
```sql
-- Obter estatísticas do dashboard admin
CREATE FUNCTION public.get_admin_dashboard_stats() RETURNS json

-- Obter emails de admin
CREATE FUNCTION public.get_admin_emails() RETURNS text[]

-- Enviar relatório diário para admin
CREATE FUNCTION public.send_admin_daily_report() RETURNS void
```

## ⚡ TRIGGERS PRINCIPAIS

### **1. TRIGGERS DE ATUALIZAÇÃO AUTOMÁTICA**
```sql
-- Atualizar updated_at em profiles
CREATE TRIGGER on_profiles_updated BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Atualizar updated_at em jobs
CREATE TRIGGER on_jobs_updated BEFORE UPDATE ON public.jobs 
  FOR EACH ROW EXECUTE FUNCTION public.handle_jobs_updated_at();

-- Atualizar updated_at em job_applications
CREATE TRIGGER on_job_applications_updated BEFORE UPDATE ON public.job_applications 
  FOR EACH ROW EXECUTE FUNCTION public.handle_job_applications_updated_at();

-- Atualizar updated_at em job_contracts
CREATE TRIGGER on_job_contracts_updated BEFORE UPDATE ON public.job_contracts 
  FOR EACH ROW EXECUTE FUNCTION public.handle_job_contracts_updated_at();

-- Atualizar updated_at em wallet_transactions
CREATE TRIGGER on_wallet_transactions_updated BEFORE UPDATE ON public.wallet_transactions 
  FOR EACH ROW EXECUTE FUNCTION public.handle_wallet_transactions_updated_at();

-- Atualizar updated_at em withdrawal_requests
CREATE TRIGGER on_withdrawal_requests_updated BEFORE UPDATE ON public.withdrawal_requests 
  FOR EACH ROW EXECUTE FUNCTION public.handle_withdrawal_requests_updated_at();

-- Atualizar updated_at em app_settings
CREATE TRIGGER on_app_settings_updated BEFORE UPDATE ON public.app_settings 
  FOR EACH ROW EXECUTE FUNCTION public.handle_app_settings_updated_at();

-- Atualizar updated_at em email_templates
CREATE TRIGGER on_email_templates_updated BEFORE UPDATE ON public.email_templates 
  FOR EACH ROW EXECUTE FUNCTION public.handle_email_templates_updated_at();

-- Atualizar updated_at em landing_pages
CREATE TRIGGER on_landing_pages_updated BEFORE UPDATE ON public.landing_pages 
  FOR EACH ROW EXECUTE FUNCTION public.handle_landing_pages_updated_at();
```

### **2. TRIGGERS DE EMAIL AUTOMÁTICO**
```sql
-- Email de boas-vindas (seguro)
CREATE TRIGGER trigger_welcome_email_safe AFTER INSERT ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.trigger_welcome_email_safe();

-- Email de boas-vindas com admin automático
CREATE TRIGGER trigger_welcome_email_with_auto_admin_trigger AFTER INSERT ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.trigger_welcome_email_with_auto_admin();

-- Email de assinatura ativada
CREATE TRIGGER trigger_subscription_activated_email_trigger AFTER UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.trigger_subscription_activated_email();

-- Email de verificação aprovada
CREATE TRIGGER trigger_verification_approved_email_trigger AFTER UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.trigger_verification_approved_email();

-- Email de verificação rejeitada
CREATE TRIGGER trigger_verification_rejected_email_trigger AFTER UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.trigger_verification_rejected_email();
```

### **3. TRIGGERS DE NOTIFICAÇÃO PARA ADMIN**
```sql
-- Notificar admin sobre nova assinatura
CREATE TRIGGER trigger_admin_new_subscription_trigger AFTER UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.trigger_admin_new_subscription();

-- Notificar admin sobre solicitação de verificação
CREATE TRIGGER trigger_admin_verification_request_trigger AFTER UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.trigger_admin_verification_request();

-- Notificar admin sobre solicitação de saque
CREATE TRIGGER trigger_admin_withdrawal_request_trigger AFTER INSERT ON public.withdrawal_requests 
  FOR EACH ROW EXECUTE FUNCTION public.trigger_admin_withdrawal_request();
```

### **4. TRIGGERS DE ATUALIZAÇÃO DE DADOS**
```sql
-- Atualizar nome e slug do perfil
CREATE TRIGGER on_profile_name_change BEFORE INSERT OR UPDATE OF first_name, last_name ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_name_and_slug();

-- Atualizar características
CREATE TRIGGER update_characteristics_updated_at BEFORE UPDATE ON public.model_characteristics_options 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Atualizar interesses de trabalho
CREATE TRIGGER update_work_interests_updated_at BEFORE UPDATE ON public.work_interests_options 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

## 📋 RELACIONAMENTOS PRINCIPAIS

### **PROFILES (Centro do Sistema)**
```
profiles (1) ←→ (N) profile_photos
profiles (1) ←→ (N) profile_videos
profiles (1) ←→ (N) reviews (como reviewer_id)
profiles (1) ←→ (N) reviews (como reviewee_id)
profiles (1) ←→ (N) user_favorites (como user_id)
profiles (1) ←→ (N) user_favorites (como favorited_profile_id)
profiles (1) ←→ (N) wallet_transactions
profiles (1) ←→ (N) withdrawal_requests
profiles (1) ←→ (N) notifications
profiles (1) ←→ (N) user_fcm_tokens
profiles (1) ←→ (N) user_verifications
profiles (1) ←→ (N) subscriptions
profiles (1) ←→ (N) job_applications (como model_id)
profiles (1) ←→ (N) jobs (como created_by)
profiles (1) ←→ (N) job_contracts (como hirer_id)
profiles (1) ←→ (N) job_contracts (como model_id)
profiles (1) ←→ (1) notification_preferences
```

### **JOBS (Sistema de Vagas)**
```
jobs (1) ←→ (N) job_applications
jobs (1) ←→ (N) job_contracts
jobs (N) ←→ (1) profiles (criador via created_by)
```

### **WALLET_TRANSACTIONS (Sistema Financeiro)**
```
wallet_transactions (N) ←→ (1) profiles (via user_id)
```

### **NOTIFICATIONS (Sistema de Notificações)**
```
notifications (N) ←→ (1) profiles (via user_id)
notification_preferences (1) ←→ (1) profiles (via user_id)
```

## 🔐 REGRAS DE SEGURANÇA (RLS)

### **Políticas Básicas para Novas Tabelas:**
```sql
-- Habilitar RLS
ALTER TABLE public.nova_tabela ENABLE ROW LEVEL SECURITY;

-- Política de visualização (usuários veem apenas seus dados)
CREATE POLICY "Users can view own data" ON public.nova_tabela
  FOR SELECT USING (auth.uid() = profile_id);

-- Política de inserção (usuários podem inserir apenas seus dados)
CREATE POLICY "Users can insert own data" ON public.nova_tabela
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Política de atualização (usuários podem atualizar apenas seus dados)
CREATE POLICY "Users can update own data" ON public.nova_tabela
  FOR UPDATE USING (auth.uid() = profile_id);

-- Política de exclusão (usuários podem excluir apenas seus dados)
CREATE POLICY "Users can delete own data" ON public.nova_tabela
  FOR DELETE USING (auth.uid() = profile_id);

-- Política para admins (admins podem ver tudo)
CREATE POLICY "Admins can view all data" ON public.nova_tabela
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );
```

## 📋 PADRÕES DE NOMENCLATURA

### **Tabelas:**
- `snake_case` (ex: `user_favorites`, `wallet_transactions`)
- Nomes descritivos e claros
- Sempre incluir `profile_id` para dados de usuário

### **Colunas:**
- `snake_case` (ex: `created_at`, `updated_at`)
- Chaves estrangeiras: `table_name_id` (ex: `profile_id`, `job_id`)
- Campos de status: `status` (ex: `'pending'`, `'approved'`, `'rejected'`)

### **Funções:**
- `verb_noun` (ex: `create_user_profile`, `update_wallet_balance`)
- Prefixos: `get_`, `create_`, `update_`, `delete_`, `send_`, `process_`

### **Triggers:**
- `on_table_action` (ex: `on_profiles_updated`, `on_jobs_updated`)
- `trigger_function_name_trigger` (ex: `trigger_welcome_email_safe`)

## 📋 CAMPOS PADRÃO

### **Campos Obrigatórios:**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
profile_id UUID REFERENCES profiles(id) -- Para dados de usuário
```

### **Campos de Status:**
```sql
status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
```

### **Campos de Metadados:**
```sql
metadata JSONB DEFAULT '{}',
provider_data JSONB DEFAULT '{}'
```

## 📋 EXEMPLO DE CRIAÇÃO DE TABELA

```sql
-- Criar nova tabela seguindo padrões
CREATE TABLE public.nova_tabela (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  profile_id UUID REFERENCES profiles(id),
  
  -- Campos específicos
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  amount NUMERIC(10,2),
  metadata JSONB DEFAULT '{}',
  
  -- Índices importantes
  CONSTRAINT nova_tabela_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Criar índices para performance
CREATE INDEX idx_nova_tabela_profile_id ON public.nova_tabela(profile_id);
CREATE INDEX idx_nova_tabela_status ON public.nova_tabela(status);
CREATE INDEX idx_nova_tabela_created_at ON public.nova_tabela(created_at);

-- Habilitar RLS
ALTER TABLE public.nova_tabela ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view own data" ON public.nova_tabela
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own data" ON public.nova_tabela
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own data" ON public.nova_tabela
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own data" ON public.nova_tabela
  FOR DELETE USING (auth.uid() = profile_id);

-- Criar trigger para updated_at
CREATE TRIGGER on_nova_tabela_updated BEFORE UPDATE ON public.nova_tabela
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

## 📝 ATUALIZAÇÃO DA DOCUMENTAÇÃO

### **QUANDO ATUALIZAR ESTE DOCUMENTO:**

1. **Após Criação de Nova Tabela:**
   - ✅ Tabela criada e populada
   - ✅ Relacionamentos estabelecidos
   - ✅ RLS implementado
   - ✅ Triggers ativos

2. **Após Criação de Nova Função:**
   - ✅ Função implementada e testada
   - ✅ Deploy realizado
   - ✅ Funcionando em produção

3. **Após Criação de Novo Trigger:**
   - ✅ Trigger ativo
   - ✅ Testado e funcionando
   - ✅ Documentado

### **COMO ATUALIZAR:**

1. **Adicionar Nova Tabela:**
   ```markdown
   ### **27. NOVA_TABELA (Descrição)**
   ```sql
   CREATE TABLE public.nova_tabela (
     -- estrutura completa
   );
   ```
   ```

2. **Adicionar Nova Função:**
   ```markdown
   ### **10. FUNÇÕES DE NOVA_CATEGORIA**
   ```sql
   -- Descrição da função
   CREATE FUNCTION public.nova_funcao(...) RETURNS tipo
   ```
   ```

3. **Adicionar Novo Trigger:**
   ```markdown
   ### **5. TRIGGERS DE NOVA_CATEGORIA**
   ```sql
   -- Descrição do trigger
   CREATE TRIGGER nome_do_trigger AFTER INSERT ON public.tabela
     FOR EACH ROW EXECUTE FUNCTION public.funcao_do_trigger();
   ```
   ```

### **COMANDOS PARA ATUALIZAÇÃO:**
```bash
# 1. Fazer backup
cp ESTRUTURA_COMPLETA_BANCO_DADOS.md ESTRUTURA_COMPLETA_BANCO_DADOS.md.backup

# 2. Atualizar documentação
# [Editar arquivo conforme necessário]

# 3. Commit das mudanças
git add ESTRUTURA_COMPLETA_BANCO_DADOS.md
git commit -m "docs: atualizar estrutura do banco após implementação de nova funcionalidade"
git push origin main
```

### **CHECKLIST DE ATUALIZAÇÃO:**
- [ ] ✅ Nova funcionalidade implementada e testada
- [ ] ✅ Deploy realizado no Supabase
- [ ] ✅ Funcionando em produção
- [ ] ✅ Documentação atualizada
- [ ] ✅ Commit realizado no GitHub
- [ ] ✅ Backup da documentação anterior 