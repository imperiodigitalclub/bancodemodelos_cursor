# 🔧 CORREÇÃO ESPECÍFICA - ProfileHeader.jsx

## **📋 ARQUIVO A CORRIGIR**
`src/components/profile/ProfileHeader.jsx`

---

## **🔍 ALTERAÇÕES NECESSÁRIAS**

### **1. Adicionar Import das Funções Helper**
```javascript
// Adicionar no início do arquivo, junto com outros imports
import { getFullName, getAvatarSeed, getInitials } from '@/lib/utils';
```

### **2. Substituições Necessárias**

**ANTES (Linha 170):**
```javascript
toast({ title: "Perfil Atualizado", description: `Dados de ${updatedProfile.name || 'usuário'} salvos.`, variant: "success" });
```

**DEPOIS:**
```javascript
toast({ title: "Perfil Atualizado", description: `Dados de ${getFullName(updatedProfile)} salvos.`, variant: "success" });
```

---

**ANTES (Linhas 210-211):**
```javascript
alt={`Foto de perfil de ${profile.name}`}
src={profile.profile_image_url || `https://api.dicebear.com/7.x/micah/svg?seed=${profile.name || profile.id}`} />
```

**DEPOIS:**
```javascript
alt={`Foto de perfil de ${getFullName(profile)}`}
src={profile.profile_image_url || `https://api.dicebear.com/7.x/micah/svg?seed=${getAvatarSeed(profile)}`} />
```

---

**ANTES (Linha 223):**
```javascript
<h1 className="text-lg font-bold text-gray-900 truncate">{profile.name}</h1>
```

**DEPOIS:**
```javascript
<h1 className="text-lg font-bold text-gray-900 truncate">{getFullName(profile)}</h1>
```

---

**ANTES (Linhas 263-264):**
```javascript
alt={`Foto de perfil de ${profile.name}`}
src={profile.profile_image_url || `https://api.dicebear.com/7.x/micah/svg?seed=${profile.name || profile.id}`} />
```

**DEPOIS:**
```javascript
alt={`Foto de perfil de ${getFullName(profile)}`}
src={profile.profile_image_url || `https://api.dicebear.com/7.x/micah/svg?seed=${getAvatarSeed(profile)}`} />
```

---

**ANTES (Linha 273):**
```javascript
<h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
```

**DEPOIS:**
```javascript
<h1 className="text-2xl font-bold text-gray-900">{getFullName(profile)}</h1>
```

---

**ANTES (Linha 343):**
```javascript
Modifique os dados de {profile.name}.
```

**DEPOIS:**
```javascript
Modifique os dados de {getFullName(profile)}.
```

---

## **✅ RESUMO DAS ALTERAÇÕES**

- ✅ **8 substituições** de `profile.name` por `getFullName(profile)`
- ✅ **2 substituições** de seed do avatar por `getAvatarSeed(profile)`
- ✅ **1 import** das funções helper

**Impacto:** ProfileHeader funcionará corretamente mostrando primeiro e último nome concatenados. 