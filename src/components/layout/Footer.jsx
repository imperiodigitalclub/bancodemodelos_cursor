
import React from 'react';
import { Heart, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BM</span>
              </div>
              <span className="font-bold text-xl">Banco de Modelos</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              A plataforma líder para conectar modelos, agências e fotógrafos. 
              Encontre oportunidades únicas em eventos, feiras e catálogos.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer">
                <Instagram className="h-5 w-5" />
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer">
                <Twitter className="h-5 w-5" />
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer">
                <Facebook className="h-5 w-5" />
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer">
                <Linkedin className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <span className="font-semibold text-lg mb-4 block">Links Rápidos</span>
            <ul className="space-y-2">
              <li><Link to="/modelos" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Encontrar Modelos</Link></li>
              <li><Link to="/vagas" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Publicar Vaga</Link></li>
              <li><Link to="/como-funciona" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Como Funciona</Link></li>
              <li><Link to="/precos" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Preços</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <span className="font-semibold text-lg mb-4 block">Suporte</span>
            <ul className="space-y-2">
              <li><Link to="/central-de-ajuda" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Central de Ajuda</Link></li>
              <li><Link to="/contato" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Contato</Link></li>
              <li><Link to="/termos" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Termos de Uso</Link></li>
              <li><Link to="/privacidade" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/seguranca" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Segurança</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Banco de Modelos. Todos os direitos reservados.
          </p>
          <div className="flex items-center space-x-1 text-gray-400 text-sm mt-4 md:mt-0">
            <span>Feito com</span>
            <Heart className="h-4 w-4 text-pink-600" />
            <span>para a comunidade de modelos</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
