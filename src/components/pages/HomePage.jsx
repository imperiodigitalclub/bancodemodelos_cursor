import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, Briefcase, Camera, Edit3, ShieldCheck, Wallet, FileText, CheckCircle, Search, UserCheck, Sparkles, Crown, Lock, Filter, Zap, TrendingUp } from 'lucide-react';

const HomePage = () => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('model');

  const handleRegister = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      openAuthModal('register');
    }
  };

  const modelSteps = [
    {
      icon: Edit3,
      title: 'Crie seu Perfil Vitrine',
      description: 'Destaque suas melhores fotos, vídeos e informações para atrair os melhores trabalhos.'
    },
    {
      icon: Search,
      title: 'Encontre Vagas Exclusivas',
      description: 'Navegue e candidate-se a vagas de grandes marcas, agências e fotógrafos de todo o país.'
    },
    {
      icon: Wallet,
      title: 'Receba com Segurança',
      description: 'Com nossa carteira digital, seu pagamento é garantido e fica disponível após a conclusão do trabalho.'
    }
  ];

  const contractorSteps = [
    {
      icon: Briefcase,
      title: 'Publique sua Vaga',
      description: 'Descreva seu projeto, o perfil de modelo que você precisa e o cachê em poucos minutos.'
    },
    {
      icon: Filter,
      title: 'Descubra o Talento Ideal',
      description: 'Use nossos filtros inteligentes para encontrar e convidar os perfis mais compatíveis para o seu job.'
    },
    {
      icon: FileText,
      title: 'Contrate com 1 Clique',
      description: 'Gerencie propostas, aceite candidatos e formalize contratos de forma simples e segura.'
    }
  ];
  
  const features = [
    {
      icon: ShieldCheck,
      title: 'Perfis Verificados',
      description: 'Mais segurança e confiança com nosso selo de verificação de identidade para todos os usuários.',
      color: 'text-blue-500'
    },
    {
      icon: Wallet,
      title: 'Carteira Digital Segura',
      description: 'Pagamentos e recebimentos são processados com segurança dentro da plataforma, garantindo tranquilidade.',
      color: 'text-green-500'
    },
    {
      icon: FileText,
      title: 'Contratos Simplificados',
      description: 'Gere e gerencie contratos digitais com validade jurídica, tudo em um só lugar.',
      color: 'text-purple-500'
    },
    {
      icon: CheckCircle,
      title: 'Qualidade Garantida',
      description: 'Sistema de avaliações mútuas que mantém a alta qualidade e o profissionalismo da comunidade.',
      color: 'text-pink-500'
    }
  ];
  
  const StatCard = ({ icon, value, label }) => {
    const Icon = icon;
    return (
      <div className="text-center p-4">
        <Icon className="h-10 w-10 mx-auto text-pink-500 mb-2" />
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    );
  };
  
  const HowItWorksCard = ({ icon, title, description }) => {
    const Icon = icon;
    return (
      <motion.div 
        className="text-center p-6"
        whileHover={{ y: -5 }}
      >
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="h-8 w-8 text-pink-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </motion.div>
    );
  };

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-28">
         <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-purple-50 z-0"></div>
         <div className="container mx-auto px-4 relative z-10">
          {/* Cartões Mobile - Aparecem acima da headline */}
          <motion.div
            className="lg:hidden mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center space-x-4">
              {/* Cartão de Perfil de Modelo - Mobile */}
              <motion.div 
                className="w-40 h-48 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl shadow-lg transform rotate-[-4deg] flex flex-col items-center justify-center p-4"
                whileHover={{ scale: 1.05, rotate: -2 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-2">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Perfil Modelo</h3>
                <p className="text-gray-600 text-center text-xs">Portfólio profissional</p>
                <div className="mt-2 flex space-x-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                </div>
              </motion.div>
              
              {/* Cartão de Contratante - Mobile */}
              <motion.div 
                className="w-40 h-48 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl shadow-lg transform rotate-[4deg] flex flex-col items-center justify-center p-4"
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-2">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Contratante</h3>
                <p className="text-gray-600 text-center text-xs mb-2">Talentos verificados</p>
                <div className="bg-white/70 rounded-lg p-2 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Garantido</span>
                    <ShieldCheck className="h-3 w-3 text-green-500" />
                  </div>
                  <div className="text-sm font-bold text-gray-800">R$ 2.500</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                Sua Carreira Decola Aqui.
                <span className="gradient-text"> Conecte-se, Trabalhe, Brilhe.</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                A plataforma definitiva que une modelos, fotógrafos e contratantes. Encontre oportunidades, gerencie sua carreira e construa um portfólio de sucesso.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleRegister} size="lg" className="btn-gradient text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
                  Criar meu Perfil Grátis
                </Button>
                <Button onClick={() => navigate('/vagas')} size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                  Explorar Oportunidades
                </Button>
              </div>
            </motion.div>
            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative h-[450px]">
                {/* Cartão de Perfil de Modelo */}
                <motion.div 
                  className="absolute top-0 left-10 w-64 h-80 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl shadow-2xl transform rotate-[-8deg] flex flex-col items-center justify-center p-6"
                  whileHover={{ scale: 1.05, rotate: -5 }}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Perfil Modelo</h3>
                  <p className="text-gray-600 text-center text-sm">Crie seu portfólio profissional</p>
                  <div className="mt-4 flex space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                </motion.div>
                
                {/* Cartão de Contratante */}
                <motion.div 
                  className="absolute bottom-0 right-10 w-72 h-96 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl shadow-2xl transform rotate-[6deg] flex flex-col items-center justify-center p-6"
                  whileHover={{ scale: 1.05, rotate: 3 }}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                    <Camera className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Área do Contratante</h3>
                  <p className="text-gray-600 text-center text-sm mb-4">Encontre talentos verificados</p>
                  <div className="bg-white/70 rounded-lg p-3 w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Cachê Garantido</span>
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-lg font-bold text-gray-800">R$ 2.500</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
         </div>
      </section>
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-gray-200">
            <StatCard icon={Users} value="10k+" label="Modelos Ativos" />
            <StatCard icon={Briefcase} value="5k+" label="Jobs Publicados" />
            <StatCard icon={Camera} value="3k+" label="Contratantes" />
            <StatCard icon={Star} value="4.9/5" label="Avaliação Média" />
          </div>
        </div>
      </section>

      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Desenhado para o seu Sucesso
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Um fluxo de trabalho simples e poderoso, seja você um talento ou quem o contrata.
            </p>
          </div>
          
          <div className="flex justify-center mb-10 bg-gray-200 rounded-full p-1 max-w-sm mx-auto">
            <button 
              onClick={() => setActiveTab('model')}
              className={`w-1/2 py-2 px-4 rounded-full text-base font-semibold transition-colors ${activeTab === 'model' ? 'bg-white text-gray-800 shadow' : 'text-gray-500 hover:bg-gray-300'}`}
            >
              Sou Modelo
            </button>
            <button 
              onClick={() => setActiveTab('contractor')}
              className={`w-1/2 py-2 px-4 rounded-full text-base font-semibold transition-colors ${activeTab === 'contractor' ? 'bg-white text-gray-800 shadow' : 'text-gray-500 hover:bg-gray-300'}`}
            >
              Sou Contratante
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {activeTab === 'model' && modelSteps.map((step, i) => <HowItWorksCard key={i} {...step} />)}
            {activeTab === 'contractor' && contractorSteps.map((step, i) => <HowItWorksCard key={i} {...step} />)}
          </div>
        </div>
      </section>
      
      {/* Seção Cachê Garantido */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Lock className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Seu Cachê está <span className="text-green-600">100% Garantido</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Nunca mais se preocupe com calotes. Nosso sistema retém o valor do cachê e só libera após a conclusão do trabalho.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div 
              className="bg-white rounded-xl p-6 shadow-lg"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">1. Valor Retido</h3>
              <p className="text-gray-600">
                O contratante deposita o cachê em nossa plataforma antes do trabalho começar. O valor fica seguro e protegido.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-6 shadow-lg"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">2. Trabalho Realizado</h3>
              <p className="text-gray-600">
                Você executa o trabalho com total tranquilidade, sabendo que seu pagamento está garantido e protegido.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-6 shadow-lg"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">3. Pagamento Liberado</h3>
              <p className="text-gray-600">
                Após a conclusão e aprovação do trabalho, o valor é automaticamente liberado para sua carteira digital.
              </p>
            </motion.div>
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-6 py-3 rounded-full">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-semibold">Zero Risco de Calote - Garantia Total</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher nossa plataforma?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Recursos exclusivos que fazem a diferença na sua carreira e projetos.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Busca Inteligente */}
            <motion.div 
              className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Filter className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Busca Inteligente</h3>
              <p className="text-gray-600">
                Filtros avançados por localização, experiência, biótipo e disponibilidade para encontrar o talento perfeito.
              </p>
            </motion.div>
            
            {/* Perfis Verificados */}
            <motion.div 
              className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Perfis Verificados</h3>
              <p className="text-gray-600">
                Todos os perfis passam por verificação de identidade e documentos para garantir segurança e confiabilidade.
              </p>
            </motion.div>
            
            {/* Modelos PRO */}
            <motion.div 
              className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Crown className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Modelos PRO</h3>
              <p className="text-gray-600">
                Acesso a modelos premium com portfólios completos, maior visibilidade e prioridade nas buscas.
              </p>
            </motion.div>
            
            {/* Contratos Digitais */}
            <motion.div 
              className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Contratos Digitais</h3>
              <p className="text-gray-600">
                Gere contratos profissionais com validade jurídica automaticamente, protegendo ambas as partes.
              </p>
            </motion.div>
            
            {/* Pagamentos Seguros */}
            <motion.div 
              className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Pagamentos Seguros</h3>
              <p className="text-gray-600">
                Sistema de escrow que protege o pagamento até a conclusão do trabalho, eliminando riscos de calote.
              </p>
            </motion.div>
            
            {/* Crescimento Profissional */}
            <motion.div 
              className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Crescimento Profissional</h3>
              <p className="text-gray-600">
                Sistema de avaliações, estatísticas de performance e ferramentas para impulsionar sua carreira.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 gradient-bg">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Faça Parte da Revolução.
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de profissionais que estão transformando suas carreiras. O cadastro é rápido e gratuito.
          </p>
          <Button
            onClick={handleRegister}
            className="bg-white text-pink-600 hover:bg-gray-100 px-10 py-4 text-lg font-bold shadow-lg transform hover:scale-105 transition-transform"
            size="lg"
          >
            Começar Agora
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;