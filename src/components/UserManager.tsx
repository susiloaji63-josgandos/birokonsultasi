import { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { useAttendanceContext } from '../context/AttendanceContext';
import { UserPlus, ShieldCheck, User, Trash2, KeyRound, AlertCircle, RefreshCw, X, CheckCircle2, Briefcase, Users, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function UserManager() {
  const { allUsers, registerUser, deleteUser, resetPassword } = useAuth();
  const { addTeacher, deleteTeacher } = useAttendanceContext();
  const [isAdding, setIsAdding] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('');
  const [role, setRole] = useState<UserRole>('guru_biro');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetInfo, setResetInfo] = useState<{ name: string; password: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (allUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      setError('Username sudah digunakan');
      return;
    }

    let teacherId: string | undefined;
    if (role !== 'admin') {
      if (!subject) {
        setError('Mata Pelajaran harus diisi untuk Guru');
        return;
      }
      const newTeacher = addTeacher(name, subject);
      teacherId = newTeacher.id;
    }

    registerUser({
      username,
      name,
      password,
      role,
      teacherId
    });

    setSuccess('Akun berhasil didaftarkan!');
    setUsername('');
    setName('');
    setPassword('');
    setSubject('');
    setRole('guru_biro');
    setIsAdding(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleReset = (userId: string, userName: string) => {
    if (confirm(`Reset password untuk ${userName} ke nilai default (123456)?`)) {
      const newPwd = resetPassword(userId);
      setResetInfo({ name: userName, password: newPwd });
      setSuccess(`Password ${userName} berhasil direset ke default.`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const processDelete = (userId: string, userName: string, teacherId?: string) => {
    try {
      if (teacherId) {
        deleteTeacher(teacherId);
      }
      deleteUser(userId);
      setSuccess(`Akun ${userName} berhasil dihapus.`);
      setDeletingId(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal menghapus akun. Silakan coba lagi.');
      setDeletingId(null);
      setTimeout(() => setError(''), 3000);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch(role) {
      case 'admin':
        return { icon: ShieldCheck, color: 'bg-indigo-50 text-indigo-600 border-indigo-100', label: 'Admin' };
      case 'guru_biro':
        return { icon: Briefcase, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Guru Biro' };
      case 'guru_umum':
        return { icon: Users, color: 'bg-blue-50 text-blue-600 border-blue-100', label: 'Guru Mapel' };
      default:
        return { icon: User, color: 'bg-slate-50 text-slate-600 border-slate-100', label: 'Pengguna' };
    }
  };

  return (
      <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto pb-24">
        {error && !isAdding && (
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-3 border border-rose-100 shadow-sm animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && !isAdding && (
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-sm font-bold flex items-center gap-3 border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5" />
            {success}
          </div>
        )}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Kelola Akses
          </h2>
          <p className="text-slate-500 text-sm font-medium">Manajemen login dan profil Guru</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 font-bold"
        >
          <UserPlus className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Akun</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {resetInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-emerald-600 p-6 rounded-[32px] text-white shadow-xl flex flex-col gap-4 relative"
          >
            <button onClick={() => setResetInfo(null)} className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6" />
              <h4 className="font-black uppercase tracking-widest text-sm">Password Berhasil Direset</h4>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl">
              <p className="text-xs font-bold text-emerald-100 uppercase tracking-tighter mb-1">Password Baru {resetInfo.name}:</p>
              <p className="text-2xl font-black font-mono tracking-wider">{resetInfo.password}</p>
            </div>
            <p className="text-[10px] font-bold text-emerald-100 italic">* Harap berikan password ini ke pengguna.</p>
          </motion.div>
        )}

        {isAdding && (
          <motion.form
            key="add-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col gap-5"
          >
            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4" />
                {success}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tingkat Akses</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl font-bold transition-all border ${
                    role === 'admin' 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[8px] uppercase tracking-widest">Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('guru_biro')}
                  className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl font-bold transition-all border ${
                    role === 'guru_biro' 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span className="text-[8px] uppercase tracking-widest">Guru Biro</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('guru_umum')}
                  className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl font-bold transition-all border ${
                    role === 'guru_umum' 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="text-[8px] uppercase tracking-widest">Guru Mapel</span>
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Tampilan</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Pak Budi"
                  className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition font-medium text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Username</label>
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username login..."
                  className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition font-medium text-sm"
                />
              </div>
            </div>

            {role !== 'admin' && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <BookOpen className="w-3 h-3" />
                  Mata Pelajaran
                </label>
                <input
                  required
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={role === 'guru_biro' ? "Pilih atau ketik: BIG 789, IPA 78, IPA 9, MTK 9, MTK 89, BIN 789" : "Contoh: BIG, IPA, MTK, BIN..."}
                  className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition font-medium text-sm"
                />
                {role === 'guru_biro' && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['BIG 789', 'IPA 78', 'IPA 9', 'MTK 9', 'MTK 89', 'BIN 789'].map((mb) => (
                      <button
                        key={mb}
                        type="button"
                        onClick={() => setSubject(mb)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition ${
                          subject === mb 
                            ? 'bg-emerald-600 text-white border-emerald-600' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {mb}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password Sementara</label>
              <input
                required
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata sandi sementara..."
                className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition font-medium text-sm"
              />
            </div>

            <div className="flex gap-3 justify-end mt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-3 text-slate-400 font-bold hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-slate-800 transition"
              >
                DAFTARKAN PENGGUNA
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid gap-3">
        {allUsers.map((u) => {
          const badge = getRoleBadge(u.role);
          const RoleIcon = badge.icon;
          return (
            <div
              key={u.id}
              className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border ${badge.color}`}>
                  <RoleIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg leading-tight">{u.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-bold">
                    <span className="uppercase tracking-widest">{u.username}</span>
                    <span>•</span>
                    <span className="uppercase tracking-tighter">{badge.label}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleReset(u.id, u.name)}
                  className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                  title="Reset Password"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                {u.id !== 'admin-root' && (
                  <div className="flex items-center">
                    {deletingId === u.id ? (
                      <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                        <button
                          onClick={() => processDelete(u.id, u.name, u.teacherId)}
                          className="px-3 py-2 bg-rose-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-rose-700 transition shadow-lg shadow-rose-100"
                        >
                          Yakin?
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(u.id)}
                        className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
