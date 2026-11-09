import { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { LogIn, KeyRound, User, GraduationCap, AlertCircle, ShieldCheck, Briefcase, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LoginPage() {
  const { login } = useAuth();
  const [activeRole, setActiveRole] = useState<UserRole>('guru_umum');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) return;
    
    setIsLoading(true);
    const result = await login(username, password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[40px] shadow-2xl shadow-slate-200 p-8 sm:p-12"
      >
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-200">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Hadirin</h1>
            <p className="text-[10px] font-black text-slate-400 tracking-[0.1em] uppercase mt-1">BIRO KONSULTASI MATA PELAJARAN</p>
          </div>
        </div>

        <div className="mb-8">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2 block">Pilih Peran Anda</label>
           <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <button 
                onClick={() => setActiveRole('admin')}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${activeRole === 'admin' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[8px] font-black uppercase">Admin</span>
              </button>
              <button 
                onClick={() => setActiveRole('guru_biro')}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${activeRole === 'guru_biro' ? 'bg-white shadow-sm text-emerald-600 ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Briefcase className="w-4 h-4" />
                <span className="text-[8px] font-black uppercase">Guru Biro</span>
              </button>
              <button 
                onClick={() => setActiveRole('guru_umum')}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${activeRole === 'guru_umum' ? 'bg-white shadow-sm text-blue-600 ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Users className="w-4 h-4" />
                <span className="text-[8px] font-black uppercase">Guru Mapel</span>
              </button>
           </div>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-bold">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Pengguna</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username..."
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kata Sandi</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-[0.98] transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-6 h-6" />
                MASUK SEKARANG
              </>
            )}
          </button>
        </form>

        <div className="mt-10 grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black text-slate-400 uppercase text-center">Admin</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black text-slate-400 uppercase text-center text-balance">Guru Biro</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black text-slate-400 uppercase text-center text-balance">Guru Mapel</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-2 text-center">Informasi Akses</p>
            <p className="text-[10px] text-amber-700 leading-relaxed font-medium text-center">
              Login sesuai kredensial yang diberikan Admin.<br />
              <span className="font-bold">Admin Root: admin / admin</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
