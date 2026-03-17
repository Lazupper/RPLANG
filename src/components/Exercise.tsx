import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Info, Sparkles, MessageCircle, Loader2 } from 'lucide-react';
import { Challenge } from '../types';
import Markdown from 'react-markdown';
import { explainCode } from '../services/geminiService';

interface ExerciseProps {
  challenge: Challenge;
  onComplete: (success: boolean) => void;
  onNext: () => void;
}

export const Exercise: React.FC<ExerciseProps> = ({ challenge, onComplete, onNext }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleCheck = () => {
    if (!selectedOption) return;
    const correct = selectedOption === challenge.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);
    onComplete(correct);
  };

  const handleAiHelp = async () => {
    if (!challenge.code) return;
    setIsLoadingAi(true);
    try {
      const explanation = await explainCode(challenge.code, challenge.language);
      setAiExplanation(explanation);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h2 className="text-2xl font-bold text-gray-800">{challenge.question}</h2>

        {challenge.code && (
          <div className="relative group">
            <div className="bg-gray-900 rounded-2xl p-6 font-mono text-emerald-400 overflow-x-auto shadow-xl">
              <pre><code>{challenge.code}</code></pre>
            </div>
            <button 
              onClick={handleAiHelp}
              disabled={isLoadingAi}
              className="absolute top-4 right-4 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 p-2 rounded-xl border border-emerald-500/30 transition-all flex items-center gap-2 text-xs font-bold"
            >
              {isLoadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
              TUTOR IA
            </button>
          </div>
        )}

        {aiExplanation && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-2xl relative"
          >
            <button 
              onClick={() => setAiExplanation(null)}
              className="absolute top-2 right-2 text-emerald-400 hover:text-emerald-600"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold">
              <Sparkles className="w-5 h-5" />
              <span>Explicação do Tutor IA</span>
            </div>
            <div className="prose prose-emerald prose-sm max-w-none">
              <Markdown>{aiExplanation}</Markdown>
            </div>
          </motion.div>
        )}

        <div className="grid gap-3">
          {challenge.options?.map((option, idx) => (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => setSelectedOption(option)}
              className={`
                p-4 text-left rounded-2xl border-2 transition-all font-medium text-lg
                ${selectedOption === option 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-inner' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                ${isAnswered && option === challenge.correctAnswer ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''}
                ${isAnswered && selectedOption === option && !isCorrect ? 'border-red-500 bg-red-50 text-red-700' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {isAnswered && option === challenge.correctAnswer && <Check className="text-emerald-500" />}
                {isAnswered && selectedOption === option && !isCorrect && <X className="text-red-500" />}
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`p-6 rounded-2xl ${isCorrect ? 'bg-emerald-100' : 'bg-red-100'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                {isCorrect ? (
                  <Sparkles className="text-emerald-600" />
                ) : (
                  <X className="text-red-600" />
                )}
                <h3 className={`font-bold text-xl ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                  {isCorrect ? 'Excelente!' : 'Ops, quase lá!'}
                </h3>
              </div>
              
              <button 
                onClick={() => setShowExplanation(!showExplanation)}
                className="flex items-center gap-2 text-sm font-bold opacity-70 hover:opacity-100 mb-4"
              >
                <Info className="w-4 h-4" />
                {showExplanation ? 'Ocultar explicação' : 'Por que esta é a resposta?'}
              </button>

              {showExplanation && (
                <div className="prose prose-sm max-w-none text-gray-700 mb-4 bg-white/50 p-4 rounded-xl">
                  <Markdown>{challenge.explanation}</Markdown>
                </div>
              )}

              <button
                onClick={onNext}
                className={`
                  w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-transform active:scale-95
                  ${isCorrect ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-red-500 text-white hover:bg-red-600'}
                `}
              >
                Continuar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!isAnswered && (
          <button
            disabled={!selectedOption}
            onClick={handleCheck}
            className={`
              w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all
              ${selectedOption 
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
          >
            Verificar
          </button>
        )}
      </motion.div>
    </div>
  );
};
