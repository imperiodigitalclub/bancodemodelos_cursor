# 🔧 CORREÇÃO FRONTEND - SUBSTITUIR CAMPO `name` POR `first_name + last_name`

## **📋 PROBLEMA IDENTIFICADO**

Com a remoção do campo `name` da tabela `profiles`, o frontend precisa ser ajustado para usar `first_name + last_name` em todos os locais onde antes usava `name`.

---

## **🔍 LOCAIS IDENTIFICADOS QUE PRECISAM SER CORRIGIDOS**

### **1. ProfileHeader.jsx - CRÍTICO**
**Arquivo:** `src/components/profile/ProfileHeader.jsx`

**Problemas encontrados:**
- Linha 170: `updatedProfile.name`
- Linha 210: `profile.name` (alt de imagem)
- Linha 211: `profile.name` (seed do avatar)
- Linha 223: `profile.name` (título h1)
- Linha 263: `profile.name` (alt de imagem)
- Linha 264: `profile.name` (seed do avatar)
- Linha 273: `profile.name` (título h1)
- Linha 343: `profile.name` (texto de modificação)

---

### **2. Header.jsx - CRÍTICO**
**Arquivo:** `src/components/layout/Header.jsx`

**Problemas encontrados:**
- Linha 217: `user.name` (alt de avatar)
- Linha 220: `user.name?.charAt(0)` (inicial do avatar)
- Linha 277: `user.name` (alt de avatar)
- Linha 280: `user.name?.charAt(0)` (inicial do avatar)
- Linha 284: `user.name` (nome no dropdown)

---

### **3. AboutTab.jsx - IMPORTANTE**
**Arquivo:** `src/components/profile/tabs/AboutTab.jsx`

**Problema encontrado:**
- Linha 73: `profile.name` (Nome Artístico/Social)

---

### **4. FavoritesPage.jsx - IMPORTANTE**
**Arquivo:** `src/components/pages/FavoritesPage.jsx`

**Problemas encontrados:**
- Linha 104: `profile.name` (seed do avatar)
- Linha 105: `profile.name` (alt da imagem)
- Linha 112: `profile.name` (título do perfil)

---

### **5. Outras páginas com menor impacto:**

**AdminUsersTab.jsx:**
- Linha 69: `userToDelete.name`
- Linha 129: `user.name`
- Linha 148: `updatedProfile.name`
- Linha 232-235: `user.name`
- Linha 269: `user.name`

**OverviewTab.jsx:**
- Linha 111: `user.name`

**HiringModal.jsx:**
- Linha 104: `modelProfile.name`

**ApplicantProfileModal.jsx:**
- Linha 33, 39, 78: `applicantProfile.name`

---

## **✅ FUNÇÃO HELPER RECOMENDADA**

Criar função helper para concatenar nome completo:

```javascript
// Função helper para nome completo
const getFullName = (profile) => {
    if (!profile) return '';
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    return `${firstName} ${lastName}`.trim() || profile.email || 'Usuário';
};

// Função helper para iniciais
const getInitials = (profile) => {
    if (!profile) return 'U';
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    const email = profile.email || '';
    
    if (firstName && lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
        return firstName.charAt(0).toUpperCase();
    }
    if (email) {
        return email.charAt(0).toUpperCase();
    }
    return 'U';
};
```

---

## **🎯 PRIORIDADE DE CORREÇÃO**

| **Arquivo** | **Prioridade** | **Impacto** | **Motivo** |
|-------------|----------------|-------------|------------|
| ProfileHeader.jsx | 🚨 **CRÍTICA** | Alto | Página principal do perfil |
| Header.jsx | 🚨 **CRÍTICA** | Alto | Componente usado em toda app |
| AboutTab.jsx | 🔶 **ALTA** | Médio | Info do perfil |
| FavoritesPage.jsx | 🔶 **ALTA** | Médio | Lista de perfis favoritos |
| AdminUsersTab.jsx | 🔶 **MÉDIA** | Baixo | Área admin |
| Outros | 🔶 **BAIXA** | Baixo | Funcionalidades específicas |

---

## **📝 PRÓXIMOS PASSOS**

1. ✅ **Implementar funções helper** em utils
2. ✅ **Corrigir ProfileHeader.jsx** (crítico)
3. ✅ **Corrigir Header.jsx** (crítico)
4. ✅ **Corrigir páginas de alta prioridade**
5. ✅ **Testar todas as funcionalidades**

---

## **⚠️ OBSERVAÇÃO IMPORTANTE**

Alguns componentes podem estar **quebrando** no frontend atual porque tentam acessar `profile.name` que não existe mais. É recomendado fazer essas correções **IMEDIATAMENTE** após aplicar a correção do banco de dados. 