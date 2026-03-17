/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db, signIn, logOut } from './firebase';
import { UserProfile, Challenge, Module, LeaderboardEntry } from './types';
import { Auth } from './components/Auth';
import { Exercise } from './components/Exercise';
import { ProgressBar } from './components/ProgressBar';
import { Leaderboard } from './components/Leaderboard';
import { ModuleView } from './components/ModuleView';
import { generateChallenge, generateModule } from './services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Heart, Zap, BookOpen, Home, MessageCircle, User as UserIcon } from 'lucide-react';

type View = 'dashboard' | 'leaderboard' | 'lesson' | 'profile' | 'tutor';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            xp: 0,
            hearts: 5,
            streak: 0,
            lastActive: new Date().toISOString(),
            completedLessons: [],
            level: 1
          };
          await setDoc(userRef, newProfile);
          setProfile(newProfile);
          updateLeaderboard(newProfile);
        }

        onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data() as UserProfile;
            setProfile(data);
            updateLeaderboard(data);
          }
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateLeaderboard = async (p: UserProfile) => {
    const leaderboardRef = doc(db, 'leaderboard', p.uid);
    const entry: LeaderboardEntry = {
      uid: p.uid,
      displayName: p.displayName || 'Anônimo',
      photoURL: p.photoURL || '',
      xp: p.xp,
      level: p.level
    };
    await setDoc(leaderboardRef, entry);
  };

  const calculateLevel = (xp: number) => Math.floor(xp / 100) + 1;

  const handleStartModule = async () => {
    if (!profile) return;
    setIsGenerating(true);
    setCurrentView('lesson');
    try {
      const module = await generateModule('javascript', profile.level);
      setCurrentModule(module);
      setLessonProgress(0);
    } catch (error) {
      console.error("Erro ao gerar módulo:", error);
      setCurrentView('dashboard');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartExercise = async () => {
    if (!profile) return;
    setIsGenerating(true);
    try {
      const challenge = await generateChallenge('javascript', profile.level);
      setCurrentChallenge(challenge);
    } catch (error) {
      console.error("Erro ao gerar desafio:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChallengeComplete = async (success: boolean) => {
    if (!profile) return;
    
    if (success) {
      setLessonProgress(prev => prev + 25);
      if (lessonProgress + 25 >= 100) {
        const newXp = profile.xp + 50;
        const newLevel = calculateLevel(newXp);
        const userRef = doc(db, 'users', profile.uid);
        await updateDoc(userRef, {
          xp: newXp,
          level: newLevel,
          streak: profile.streak + 1,
          lastActive: new Date().toISOString()
        });
        setShowSuccess(true);
      }
    } else {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        hearts: Math.max(0, profile.hearts - 1)
      });
    }
  };

  const handleNextChallenge = async () => {
    if (lessonProgress >= 100) {
      setCurrentChallenge(null);
      setCurrentModule(null);
      setShowSuccess(false);
      setCurrentView('dashboard');
      return;
    }
    await handleStartExercise();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl"
        >
          C
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={signIn} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'leaderboard':
        return <Leaderboard />;
      case 'lesson':
        if (isGenerating) return (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
            <p className="text-emerald-600 font-bold text-xl">Gerando sua lição personalizada...</p>
          </div>
        );
        if (showSuccess) return (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-8 py-12">
            <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-16 h-16 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-gray-800 mb-2">Lição Concluída!</h2>
              <p className="text-xl text-gray-500 font-medium">+50 XP • +1 Ofensiva</p>
            </div>
            <button onClick={handleNextChallenge} className="bg-emerald-500 text-white px-12 py-4 rounded-2xl font-black text-xl hover:bg-emerald-600 transition-all shadow-xl active:scale-95">CONTINUAR</button>
          </motion.div>
        );
        if (currentChallenge) return (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => { setCurrentChallenge(null); setCurrentModule(null); setCurrentView('dashboard'); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-6 h-6" /></button>
              <ProgressBar progress={lessonProgress} />
              <div className="flex items-center gap-1 text-red-500 font-bold"><Heart className="w-6 h-6 fill-current" /><span>{profile?.hearts}</span></div>
            </div>
            <Exercise challenge={currentChallenge} onComplete={handleChallengeComplete} onNext={handleNextChallenge} />
          </div>
        );
        if (currentModule) return <ModuleView module={currentModule} onStartExercise={handleStartExercise} />;
        return null;
      case 'dashboard':
      default:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <section className="bg-emerald-500 rounded-3xl p-8 text-white shadow-xl shadow-emerald-100 overflow-hidden relative">
              <div className="relative z-10">
                <h2 className="text-3xl font-black mb-2">Bem-vindo de volta!</h2>
                <p className="text-emerald-50 opacity-90 mb-6 font-medium">Você está no nível {profile?.level}. Continue assim!</p>
                <button onClick={handleStartModule} disabled={isGenerating || (profile?.hearts || 0) <= 0} className="bg-white text-emerald-600 px-8 py-4 rounded-2xl font-black text-lg hover:bg-emerald-50 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isGenerating ? 'Preparando...' : (profile?.hearts || 0) <= 0 ? 'Sem corações :(' : 'COMEÇAR LIÇÃO'}
                </button>
              </div>
              <Sparkles className="absolute -right-4 -bottom-4 w-48 h-48 text-emerald-400 opacity-30" />
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border-2 border-gray-100 rounded-3xl space-y-4">
                <div className="flex items-center gap-3 text-emerald-600 font-bold"><BookOpen className="w-6 h-6" /><h3>Progresso Atual</h3></div>
                <ProgressBar progress={(profile?.xp || 0) % 100} />
                <p className="text-sm text-gray-500 font-medium">{(profile?.xp || 0) % 100} / 100 XP para o próximo nível</p>
              </div>
              <div className="p-6 border-2 border-gray-100 rounded-3xl space-y-4">
                <div className="flex items-center gap-3 text-orange-500 font-bold"><Zap className="w-6 h-6 fill-current" /><h3>Ofensiva</h3></div>
                <p className="text-4xl font-black">{profile?.streak} dias</p>
                <p className="text-sm text-gray-500 font-medium">Não perca o ritmo!</p>
              </div>
            </div>

            <section className="space-y-6">
              <h3 className="text-2xl font-black text-gray-800">Seu Caminho</h3>
              <div className="flex flex-col items-center gap-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`w-20 h-20 rounded-full border-b-8 flex items-center justify-center text-white text-2xl font-black ${i === profile?.level ? 'bg-emerald-500 border-emerald-700 shadow-lg' : i < (profile?.level || 0) ? 'bg-emerald-300 border-emerald-500' : 'bg-gray-200 border-gray-300'}`}>
                    {i}
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 p-4 fixed h-full">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">C</div>
          <h1 className="text-2xl font-bold text-emerald-500 tracking-tight">CodeLingo</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem icon={<Home />} label="Aprender" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <NavItem icon={<Trophy />} label="Ranking" active={currentView === 'leaderboard'} onClick={() => setCurrentView('leaderboard')} />
          <NavItem icon={<UserIcon />} label="Perfil" active={currentView === 'profile'} onClick={() => setCurrentView('profile')} />
          <NavItem icon={<MessageCircle />} label="Tutor IA" active={currentView === 'tutor'} onClick={() => setCurrentView('tutor')} />
        </nav>
        {profile && (
          <div className="mt-auto p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <img src={profile.photoURL || ''} alt="" className="w-10 h-10 rounded-full border-2 border-emerald-500" />
              <div className="overflow-hidden"><p className="font-bold text-sm truncate">{profile.displayName}</p></div>
            </div>
            <button onClick={logOut} className="w-full py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">Sair</button>
          </div>
        )}
      </aside>

      <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="flex items-center gap-2"><div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">C</div><span className="font-bold text-emerald-500">CodeLingo</span></div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-red-500 font-bold"><Heart className="w-5 h-5 fill-current" /><span>{profile?.hearts || 0}</span></div>
          <div className="flex items-center gap-1 text-orange-500 font-bold"><Zap className="w-5 h-5 fill-current" /><span>{profile?.streak || 0}</span></div>
        </div>
      </header>

      <main className="flex-1 md:ml-64 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <div className="hidden md:flex items-center justify-end gap-8 mb-8 sticky top-0 bg-white/80 backdrop-blur-sm py-4 z-10">
          <div className="flex items-center gap-2 text-orange-500 font-bold"><Zap className="w-6 h-6 fill-current" /><span>{profile?.streak || 0}</span></div>
          <div className="flex items-center gap-2 text-red-500 font-bold"><Heart className="w-6 h-6 fill-current" /><span>{profile?.hearts || 0}</span></div>
          <div className="flex items-center gap-2 text-blue-500 font-bold"><Trophy className="w-6 h-6" /><span>{profile?.xp || 0} XP</span></div>
        </div>
        {renderContent()}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-50">
        <NavItem icon={<Home />} active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} mobile />
        <NavItem icon={<Trophy />} active={currentView === 'leaderboard'} onClick={() => setCurrentView('leaderboard')} mobile />
        <NavItem icon={<UserIcon />} active={currentView === 'profile'} onClick={() => setCurrentView('profile')} mobile />
      </nav>
    </div>
  );
}

const NavItem = ({ icon, label, active, mobile, onClick }: { icon: React.ReactNode, label?: string, active?: boolean, mobile?: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${active ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500' : 'text-gray-500 hover:bg-gray-100'} ${mobile ? 'flex-col gap-1 p-2 border-none' : ''}`}>
    <span className="w-6 h-6">{icon}</span>
    {label && <span className="text-lg">{label}</span>}
  </button>
);

const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);


