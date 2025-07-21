// 🔍 VERSÃO DO AUTHCONTEXT COM LOGS COMPLETOS PARA DIAGNÓSTICO
// Se o problema for no frontend, esta versão vai capturar TUDO

const register = async (userData) => {
  console.log('🚀 INICIANDO PROCESSO DE CADASTRO - VERSÃO DIAGNÓSTICO');
  console.log('📝 Dados recebidos:', userData);
  
  try {
    setLoading(true);
    setError(null);
    console.log('✅ Estado inicial configurado - loading: true, error: null');

    // ============================================
    // 1. VALIDAÇÃO DOS DADOS ANTES DO ENVIO
    // ============================================
    
    console.log('🔍 VALIDANDO DADOS...');
    
    if (!userData.email) {
      console.error('❌ ERRO: Email não fornecido');
      throw new Error('Email é obrigatório');
    }
    
    if (!userData.password) {
      console.error('❌ ERRO: Senha não fornecida');
      throw new Error('Senha é obrigatória');
    }
    
    if (!userData.first_name || !userData.last_name) {
      console.error('❌ ERRO: Nome ou sobrenome não fornecido');
      throw new Error('Nome completo é obrigatório');
    }
    
    console.log('✅ Validação inicial passou');

    // ============================================
    // 2. PREPARAR METADATA COM LOGS DETALHADOS
    // ============================================
    
    console.log('🔧 PREPARANDO METADATA...');
    
    const metadata = {
      first_name: userData.first_name?.trim(),
      last_name: userData.last_name?.trim(),
      user_type: userData.user_type || 'model',
      phone: userData.phone?.trim() || '',
      city: userData.city?.trim() || '',
      state: userData.state || '',
      instagram: userData.instagram?.trim() || '',
      bio: userData.bio?.trim() || '',
      experience_years: userData.experience_years || null,
      height: userData.height || null,
      weight: userData.weight || null,
      measurements: userData.measurements || null,
      hair_color: userData.hair_color || null,
      eye_color: userData.eye_color || null
    };
    
    console.log('📋 Metadata preparada:', metadata);
    console.log('📊 Tamanho da metadata:', JSON.stringify(metadata).length, 'chars');

    // ============================================
    // 3. TENTATIVA DE CADASTRO VIA SUPABASE AUTH
    // ============================================
    
    console.log('🔐 INICIANDO CADASTRO VIA SUPABASE AUTH...');
    console.log('📧 Email:', userData.email);
    console.log('🔑 Senha:', userData.password ? `${userData.password.length} caracteres` : 'VAZIA');
    
    const { data, error: authError } = await supabase.auth.signUp({
      email: userData.email.trim(),
      password: userData.password,
      options: {
        data: metadata
      }
    });

    console.log('📤 RESPOSTA DO SUPABASE AUTH:');
    console.log('📊 Data completa:', data);
    console.log('❌ Error (se houver):', authError);

    // ============================================
    // 4. ANÁLISE DETALHADA DA RESPOSTA
    // ============================================
    
    if (authError) {
      console.error('💥 ERRO NO SUPABASE AUTH:');
      console.error('🔴 Código:', authError.code);
      console.error('📝 Mensagem:', authError.message);
      console.error('🔍 Detalhes completos:', authError);
      console.error('🌐 Status HTTP:', authError.status);
      console.error('🏷️ Nome do erro:', authError.name);
      
      // Verificar se é erro 500
      if (authError.status === 500 || authError.message?.includes('500') || authError.message?.includes('Internal Server Error')) {
        console.error('🚨 CONFIRMADO: ERRO 500 INTERNAL SERVER ERROR');
        console.error('🔧 Causa: Backend/Database');
      }
      
      throw authError;
    }

    // ============================================
    // 5. ANÁLISE DA RESPOSTA DE SUCESSO
    // ============================================
    
    console.log('✅ AUTH PASSOU - ANALISANDO RESPOSTA:');
    
    if (data?.user) {
      console.log('👤 Usuário criado:');
      console.log('🆔 ID:', data.user.id);
      console.log('📧 Email:', data.user.email);
      console.log('✅ Email confirmado:', data.user.email_confirmed_at);
      console.log('📋 Metadata salva:', data.user.user_metadata);
      console.log('🔐 Role:', data.user.role);
      console.log('⏰ Criado em:', data.user.created_at);
    } else {
      console.warn('⚠️ ATENÇÃO: data.user é null ou undefined');
      console.log('📊 Data completa:', data);
    }

    if (data?.session) {
      console.log('🎫 Sessão criada:');
      console.log('🔑 Access Token:', data.session.access_token ? 'PRESENTE' : 'AUSENTE');
      console.log('🔄 Refresh Token:', data.session.refresh_token ? 'PRESENTE' : 'AUSENTE');
      console.log('⏰ Expira em:', data.session.expires_at);
    } else {
      console.log('ℹ️ Nenhuma sessão criada (normal se email não confirmado)');
    }

    // ============================================
    // 6. VERIFICAR SE PROFILE FOI CRIADO
    // ============================================
    
    if (data?.user?.id) {
      console.log('🔍 VERIFICANDO SE PROFILE FOI CRIADO...');
      
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error('❌ ERRO AO BUSCAR PROFILE:', profileError);
        } else if (profileData) {
          console.log('✅ PROFILE CRIADO PELO TRIGGER:');
          console.log('📋 Profile completo:', profileData);
        } else {
          console.warn('⚠️ PROFILE NÃO ENCONTRADO - trigger pode não ter funcionado');
        }
      } catch (profileCheckError) {
        console.error('💥 ERRO NA VERIFICAÇÃO DO PROFILE:', profileCheckError);
      }
    }

    // ============================================
    // 7. FINALIZAÇÃO
    // ============================================
    
    console.log('🎉 CADASTRO FINALIZADO COM SUCESSO!');
    console.log('📊 Resultado final:', data);
    
    setUser(data.user);
    setSession(data.session);
    
    return data;

  } catch (error) {
    console.error('💥 ERRO GERAL NO PROCESSO DE CADASTRO:');
    console.error('🔴 Tipo:', error.constructor.name);
    console.error('📝 Mensagem:', error.message);
    console.error('🔍 Stack:', error.stack);
    console.error('📊 Objeto completo:', error);
    
    // Análise específica de erro 500
    if (error.message?.includes('500') || error.status === 500) {
      console.error('🚨 ERRO 500 CONFIRMADO - PROBLEMA NO BACKEND');
      console.error('🔧 Possíveis causas:');
      console.error('   - Trigger com erro');
      console.error('   - Constraint violado');
      console.error('   - RLS policy');
      console.error('   - Função com bug');
    }
    
    setError(error.message);
    throw error;
  } finally {
    console.log('🔄 FINALIZANDO - setLoading(false)');
    setLoading(false);
  }
};

// ============================================
// INSTRUÇÕES DE USO:
// ============================================

/*
🔧 COMO USAR ESTE DIAGNÓSTICO:

1. SUBSTITUIR temporariamente a função register() no AuthContext.jsx
2. Tentar fazer um cadastro
3. Abrir Console do Navegador (F12)
4. Copiar TODOS os logs e me enviar

📊 O QUE OS LOGS VÃO REVELAR:
- Se o problema é no frontend (validação/preparação)
- Se o problema é na chamada para o Supabase
- Se o erro 500 vem do backend
- Detalhes exatos do erro
- Se o trigger funcionou ou não

🎯 Com esses logs vamos identificar EXATAMENTE onde está o problema!
*/ 