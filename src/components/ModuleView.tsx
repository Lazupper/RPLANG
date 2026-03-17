import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import Markdown from 'react-markdown';
import { Module } from '../types';

interface ModuleViewProps {
  module: Module;
  onStartExercise: () => void;
}

export const ModuleView: React.FC<ModuleViewProps> = ({ module, onStartExercise }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-3 text-emerald-600 mb-4">
        <BookOpen className="w-8 h-8" />
        <h2 className="text-3xl font-black text-gray-800">{module.title}</h2>
      </div>

      <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-sm prose prose-emerald max-w-none text-gray-700">
        <Markdown>{module.concept}</Markdown>
      </div>

      <button 
        onClick={onStartExercise}
        className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-black text-xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95"
      >
        <span>PRATICAR AGORA</span>
        <ArrowRight className="w-6 h-6" />
      </button>
    </motion.div>
  );
};
