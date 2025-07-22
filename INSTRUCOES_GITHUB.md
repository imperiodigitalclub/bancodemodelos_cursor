# 🚀 INSTRUÇÕES PARA CONFIGURAR GITHUB

## ✅ O que já foi feito:

1. **✅ Git inicializado** no projeto
2. **✅ .gitignore criado** com configurações adequadas
3. **✅ README.md criado** com documentação completa
4. **✅ Configuração do usuário** (nome e email)
5. **✅ Commit inicial realizado** com todos os arquivos

## 🔧 O que você precisa fazer:

### **PASSO 1: Criar conta no GitHub**
1. Acesse: https://github.com
2. Clique em "Sign up"
3. Preencha seus dados:
   - **Username:** `bancodemodelos` (ou outro disponível)
   - **Email:** `contato@bancodemodelos.com.br`
   - **Senha:** (crie uma senha forte)
4. Complete o processo de verificação

### **PASSO 2: Criar repositório no GitHub**
1. Após fazer login, clique em **"New repository"**
2. Configure o repositório:
   - **Repository name:** `banco-de-modelos`
   - **Description:** `Plataforma completa para conectar modelos, fotógrafos e contratantes`
   - **Visibility:** `Private` (recomendado para projeto comercial)
   - **NÃO marque** "Add a README file" (já temos um)
   - **NÃO marque** "Add .gitignore" (já temos um)
3. Clique em **"Create repository"**

### **PASSO 3: Conectar repositório local ao GitHub**
Após criar o repositório, GitHub mostrará comandos. Execute estes comandos no terminal:

```bash
# Adicionar o repositório remoto
git remote add origin https://github.com/SEU_USERNAME/banco-de-modelos.git

# Enviar o código para o GitHub
git branch -M main
git push -u origin main
```

### **PASSO 4: Configurar proteções (opcional)**
1. No repositório GitHub, vá em **Settings > Branches**
2. Clique em **"Add rule"**
3. Configure:
   - **Branch name pattern:** `main`
   - **✅ Require a pull request before merging**
   - **✅ Require status checks to pass before merging**
   - **✅ Include administrators**

## 🔐 Configurações de Segurança

### **1. Configurar SSH (recomendado)**
```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "contato@bancodemodelos.com.br"

# Adicionar chave ao SSH agent
ssh-add ~/.ssh/id_ed25519

# Copiar chave pública (adicione no GitHub)
cat ~/.ssh/id_ed25519.pub
```

### **2. Adicionar SSH key no GitHub**
1. Vá em **Settings > SSH and GPG keys**
2. Clique em **"New SSH key"**
3. Cole a chave pública gerada
4. Clique em **"Add SSH key"**

## 📋 Comandos Git Úteis

### **Para fazer commits futuros:**
```bash
# Ver status dos arquivos
git status

# Adicionar arquivos modificados
git add .

# Fazer commit
git commit -m "📝 Descrição das mudanças"

# Enviar para GitHub
git push
```

### **Para criar branches:**
```bash
# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Fazer mudanças e commit
git add .
git commit -m "✨ Adiciona nova funcionalidade"

# Enviar branch para GitHub
git push -u origin feature/nova-funcionalidade
```

### **Para atualizar código:**
```bash
# Baixar mudanças do GitHub
git pull origin main

# Ou se estiver em outra branch
git pull origin nome-da-branch
```

## 🛡️ Backup e Segurança

### **1. Backup local**
```bash
# Criar backup completo
git archive --format=zip --output=backup-banco-modelos.zip main
```

### **2. Backup no GitHub**
- O GitHub já faz backup automático
- Configure **GitHub Actions** para deploy automático
- Use **GitHub Releases** para versões estáveis

## 📊 Estrutura do Repositório

```
banco-de-modelos/
├── 📁 src/                    # Código fonte
├── 📁 supabase/               # Backend e Edge Functions
├── 📁 public/                 # Arquivos estáticos
├── 📁 docs/                   # Documentação
├── 📄 README.md               # Documentação principal
├── 📄 .gitignore              # Arquivos ignorados
├── 📄 package.json            # Dependências
└── 📄 CHANGELOG.md            # Histórico de mudanças
```

## 🎯 Próximos Passos

### **1. Após configurar GitHub:**
1. Teste o sistema localmente
2. Execute os scripts de debug de email
3. Configure as APIs (Resend, Mercado Pago)
4. Faça deploy em produção

### **2. Para desenvolvimento:**
1. Crie branches para novas funcionalidades
2. Use Pull Requests para revisão de código
3. Mantenha o main sempre estável
4. Documente todas as mudanças

### **3. Para produção:**
1. Configure GitHub Actions para deploy automático
2. Configure domínio personalizado
3. Configure SSL/HTTPS
4. Configure monitoramento

## 🔗 Links Úteis

- **GitHub:** https://github.com
- **GitHub CLI:** https://cli.github.com
- **GitHub Desktop:** https://desktop.github.com
- **Documentação Git:** https://git-scm.com/doc

---

**✅ Status:** Pronto para configurar GitHub - Siga os passos acima! 