import React from 'react';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center text-white font-bold text-6xl shadow-2xl shadow-emerald-200">
            C
          </div>
          <h1 className="text-5xl font-black text-emerald-500 tracking-tighter">CodeLingo</h1>
          <p className="text-xl text-gray-500 font-medium">
            Aprenda a programar de um jeito divertido, rápido e gratuito.
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white border-2 border-gray-200 rounded-2xl font-bold text-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-6 h-6" />
            Entrar com Google
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">ou</span></div>
          </div>

          <button className="w-full py-4 px-6 bg-blue-500 text-white rounded-2xl font-bold text-lg hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 active:scale-95">
            Começar agora
          </button>
        </div>

        <p className="text-sm text-gray-400 pt-8">
          Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
        </p>
      </motion.div>
    </div>
  );
};
