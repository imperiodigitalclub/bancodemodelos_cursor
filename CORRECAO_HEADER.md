# 🔧 CORREÇÃO ESPECÍFICA - Header.jsx

## **📋 ARQUIVO A CORRIGIR**
`src/components/layout/Header.jsx`

---

## **🔍 ALTERAÇÕES NECESSÁRIAS**

### **1. Adicionar Import das Funções Helper**
```javascript
// Adicionar no início do arquivo, junto com outros imports
import { getFullName, getInitials } from '@/lib/utils';
```

### **2. Substituições Necessárias**

**ANTES (Linha 217):**
```javascript
alt={user.name || 'Usuário'}
```

**DEPOIS:**
```javascript
alt={getFullName(user)}
```

---

**ANTES (Linha 220):**
```javascript
{user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
```

**DEPOIS:**
```javascript
{getInitials(user)}
```

---

**ANTES (Linha 277):**
```javascript
alt={user.name}
```

**DEPOIS:**
```javascript
alt={getFullName(user)}
```

---

**ANTES (Linha 280):**
```javascript
{user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
```

**DEPOIS:**
```javascript
{getInitials(user)}
```

---

**ANTES (Linha 284):**
```javascript
<p className="text-sm font-medium leading-none">{user.name}</p>
```

**DEPOIS:**
```javascript
<p className="text-sm font-medium leading-none">{getFullName(user)}</p>
```

---

## **✅ RESUMO DAS ALTERAÇÕES**

- ✅ **3 substituições** de `user.name` por `getFullName(user)`
- ✅ **2 substituições** de iniciais manuais por `getInitials(user)`
- ✅ **1 import** das funções helper

**Impacto:** Header funcionará corretamente em toda a aplicação mostrando nome completo e iniciais corretas. 