import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const RegistrationLoadingModal = () => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-sm w-full"
      >
        <Loader2 className="h-12 w-12 text-pink-500 animate-spin mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Quase lá!</h3>
        <p className="text-gray-600 text-sm">
          Estamos preparando tudo para você... Seu perfil está sendo criado!
        </p>
      </motion.div>
    </div>
  );
};

export default RegistrationLoadingModal;