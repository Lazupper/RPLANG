import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { LeaderboardEntry } from '../types';
import { Trophy, Medal, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
      setEntries(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando ranking...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="w-8 h-8 text-yellow-500" />
        <h2 className="text-3xl font-black text-gray-800">Ranking Global</h2>
      </div>

      <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden shadow-sm">
        {entries.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Nenhum competidor ainda. Seja o primeiro!</div>
        ) : (
          entries.map((entry, idx) => (
            <div 
              key={entry.uid} 
              className={`flex items-center gap-4 p-4 border-b border-gray-50 last:border-none transition-colors hover:bg-gray-50`}
            >
              <div className="w-8 text-center font-black text-gray-400">
                {idx === 0 ? <Medal className="text-yellow-500 mx-auto" /> : 
                 idx === 1 ? <Medal className="text-gray-400 mx-auto" /> : 
                 idx === 2 ? <Medal className="text-orange-400 mx-auto" /> : 
                 idx + 1}
              </div>
              <img 
                src={entry.photoURL || ''} 
                alt="" 
                className="w-12 h-12 rounded-full border-2 border-emerald-500"
                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/48')}
              />
              <div className="flex-1">
                <p className="font-bold text-gray-800">{entry.displayName}</p>
                <p className="text-xs text-gray-500 font-medium">Nível {entry.level}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-emerald-600">{entry.xp} XP</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
