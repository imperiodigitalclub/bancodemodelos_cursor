# 🔍 PROCESSO DE REMOÇÃO GRADUAL DE TRIGGERS

## **🎯 ESTRATÉGIA INTELIGENTE**

Ao invés de remover todos os triggers de uma vez, vamos remover **gradualmente** para identificar **exatamente** qual trigger está causando o erro 500.

---

## **📋 PROCESSO PASSO A PASSO:**

### **PASSO 1: Remover Triggers de Email**
```sql
-- Execute: REMOCAO_GRADUAL_TRIGGERS_PASSO1.sql
```

**Remove:**
- `trigger_welcome_email_trigger`
- `trigger_subscription_activated_email_trigger` 
- `trigger_verification_approved_email_trigger`
- `trigger_verification_rejected_email_trigger`

**Depois:** Teste o cadastro
- **Se erro 500 sumir** → Problema estava nos triggers de email
- **Se erro 500 continuar** → Execute PASSO 2

---

### **PASSO 2: Remover Triggers de Notificações Admin**
```sql
-- Execute: REMOCAO_GRADUAL_TRIGGERS_PASSO2.sql
```

**Remove:**
- `trigger_admin_new_subscription_trigger`
- `trigger_admin_verification_request_trigger`
- `trigger_admin_withdrawal_request_trigger`

**Depois:** Teste o cadastro
- **Se erro 500 sumir** → Problema estava nos triggers admin
- **Se erro 500 continuar** → Execute PASSO 3

---

### **PASSO 3: Remover Triggers Restantes em Profiles**
```sql
-- Execute: REMOCAO_GRADUAL_TRIGGERS_PASSO3.sql
```

**Remove:**
- `on_profile_name_change` (geração de slug)
- Outros triggers possíveis em profiles

**Depois:** Teste o cadastro
- **Se erro 500 sumir** → Problema estava no trigger de profiles
- **Se erro 500 continuar** → Problema é no trigger principal de auth.users

---

## **🔄 RESTAURAÇÃO APÓS DIAGNÓSTICO:**

Quando identificar qual grupo causava o problema:

```sql
-- Execute: RESTAURAR_TRIGGERS_REMOVIDOS.sql
```

Isso vai **restaurar todos os triggers**, exceto o problemático que você pode corrigir separadamente.

---

## **📊 VANTAGENS DESTA ABORDAGEM:**

### **✅ Identificação Precisa:**
- Saberemos **exatamente** qual trigger causa o problema
- Não quebraremos funcionalidades desnecessariamente

### **✅ Controle Total:**
- Cada passo é documentado
- Tudo pode ser restaurado facilmente

### **✅ Segurança:**
- Mantém trigger principal de cadastro intacto
- Remove apenas triggers secundários

---

## **🎯 RESULTADOS ESPERADOS POR PASSO:**

| **Passo** | **Se Erro Sumir** | **Trigger Problemático** |
|-----------|-------------------|---------------------------|
| 1 | ✅ | Triggers de email | 
| 2 | ✅ | Triggers de notificação admin |
| 3 | ✅ | Trigger de profiles (slug) |
| Todos | ❌ | Problema no trigger principal ou outros |

---

## **⚡ EXECUTE AGORA:**

1. **PASSO 1:** `REMOCAO_GRADUAL_TRIGGERS_PASSO1.sql`
2. **Teste** cadastro
3. **Me confirme:** "Erro sumiu" ou "Erro continua"
4. **Se erro continuar:** Execute próximo passo
5. **Quando identificar:** Execute restauração

**Esta abordagem vai nos dar a resposta exata!** 🎯 