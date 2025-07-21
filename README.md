# 🏦 Banco de Modelos - Plataforma de Conectividade

## 📋 Descrição

Plataforma completa para conectar modelos, fotógrafos e contratantes. Sistema desenvolvido com React, Vite, Supabase e integração com Mercado Pago.

## 🚀 Tecnologias

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Pagamentos:** Mercado Pago API
- **Emails:** Resend API
- **Deploy:** Vercel/Netlify

## 🏗️ Estrutura do Projeto

```
banco-de-modelos/
├── src/
│   ├── components/     # Componentes React
│   ├── contexts/       # Contextos (Auth, Payment)
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilitários e configurações
│   └── pages/          # Páginas da aplicação
├── supabase/
│   ├── functions/      # Edge Functions
│   └── sql/           # Scripts SQL
├── public/            # Arquivos estáticos
└── docs/             # Documentação
```

## 🔧 Funcionalidades Principais

### 👤 Sistema de Usuários
- Cadastro e login de modelos, fotógrafos e contratantes
- Perfis personalizados com galeria de fotos
- Sistema de verificação de identidade
- Carteira digital integrada

### 💰 Sistema Financeiro
- Integração com Mercado Pago
- Pagamentos via PIX e cartão
- Sistema de assinaturas PRO
- Carteira digital com saques

### 📧 Sistema de Comunicação
- Chat interno entre usuários
- Sistema de notificações
- Emails transacionais automáticos
- Broadcast para todos os usuários

### 🎯 Sistema de Vagas
- Publicação de vagas por contratantes
- Candidaturas de modelos
- Sistema de matching inteligente
- Avaliações e reviews

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Conta no Mercado Pago
- Conta no Resend (para emails)

### 1. Clone o repositório
```bash
git clone [URL_DO_REPOSITORIO]
cd banco-de-modelos
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

### 4. Configure o Supabase
- Crie um projeto no Supabase
- Configure as variáveis de ambiente
- Execute os scripts SQL

### 5. Configure o Mercado Pago
- Crie uma conta no Mercado Pago
- Configure as credenciais
- Teste os pagamentos

### 6. Configure o Resend
- Crie uma conta no Resend
- Configure a API Key
- Teste o envio de emails

### 7. Execute o projeto
```bash
npm run dev
```

## 📊 Status do Projeto

### ✅ Funcionalidades Implementadas
- [x] Sistema de autenticação completo
- [x] Cadastro de usuários com perfis
- [x] Sistema de pagamentos (PIX e cartão)
- [x] Carteira digital
- [x] Sistema de assinaturas
- [x] Chat interno
- [x] Sistema de notificações
- [x] Emails transacionais
- [x] Painel administrativo
- [x] Sistema de vagas
- [x] Galeria de fotos
- [x] Sistema de verificação

### 🔄 Em Desenvolvimento
- [ ] Sistema de matching avançado
- [ ] Push notifications
- [ ] App mobile (PWA)
- [ ] Analytics avançado

## 🗄️ Banco de Dados

### Tabelas Principais
- `profiles` - Perfis dos usuários
- `wallet_transactions` - Transações financeiras
- `notifications` - Sistema de notificações
- `messages` - Chat interno
- `jobs` - Vagas publicadas
- `job_applications` - Candidaturas

### Edge Functions
- `send-email-resend` - Envio de emails
- `create-payment-preference` - Criação de pagamentos
- `mp-webhook` - Webhook do Mercado Pago
- `process-payment` - Processamento de pagamentos

## 🔐 Segurança

- Autenticação via Supabase Auth
- RLS (Row Level Security) ativo
- Validação de dados em todas as operações
- Sanitização de inputs
- HTTPS obrigatório

## 📈 Performance

- Lazy loading de componentes
- Otimização de imagens
- Cache inteligente
- CDN para assets estáticos

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes de cobertura
npm run test:coverage
```

## 🚀 Deploy

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

## 📝 Changelog

### v1.0.0 (2025-01-21)
- ✅ Sistema completo funcional
- ✅ Integração com Mercado Pago
- ✅ Sistema de emails
- ✅ Painel administrativo
- ✅ Sistema de notificações

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

- **Email:** contato@bancodemodelos.com.br
- **Documentação:** [Link para docs]
- **Issues:** [Link para issues]

---

**Desenvolvido com ❤️ para conectar talentos e oportunidades** 