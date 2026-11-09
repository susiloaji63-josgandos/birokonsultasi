import { useState, useMemo } from 'react';
import { 
  BookOpen, 
  UserCheck, 
  Calendar, 
  Shield, 
  LayoutDashboard, 
  RefreshCw, 
  Send, 
  Book, 
  GraduationCap,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useAttendanceContext } from '../context/AttendanceContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function GuruUmumDashboard() {
  const { user, allUsers } = useAuth();
  const { students, teachers, journals, addJournal, addStudent } = useAttendanceContext();
  
  const [selectedSubject, setSelectedSubject] = useState('-- Pilih Mata Pelajaran --');
  const [teacherName, setTeacherName] = useState(user?.name || '');
  const [selectedTreatment, setSelectedTreatment] = useState('-- Pilih Treatment --');
  const [selectedGrade, setSelectedGrade] = useState('-- Pilih Kelas --');
  const [selectedStudent, setSelectedStudent] = useState('-- Pilih Siswa --');
  const [selectedGuruBiroId, setSelectedGuruBiroId] = useState('-- Pilih Guru Biro --');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRekomendasiModal, setShowRekomendasiModal] = useState(false);

  // Rekomendasi Siswa Baru State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('-- Pilih Kelas --');
  const [newStudentObstacle, setNewStudentObstacle] = useState('');

  const teacherProfile = useMemo(() => {
    return teachers.find(t => t.id === user?.teacherId);
  }, [teachers, user]);

  const guruBiroUsers = useMemo(() => {
    return allUsers.filter(u => u.role === 'guru_biro');
  }, [allUsers]);

  const selectedGuruBiroProfile = useMemo(() => {
    if (selectedGuruBiroId === '-- Pilih Guru Biro --') return null;
    const bureauUser = guruBiroUsers.find(u => u.id === selectedGuruBiroId);
    if (!bureauUser) return null;
    return teachers.find(t => t.id === bureauUser.teacherId || t.name === bureauUser.name);
  }, [selectedGuruBiroId, guruBiroUsers, teachers]);

  const grades = useMemo(() => {
    const baseGrades = ['7A', '7B', '7C', '7D', '7E', '8A', '8B', '8C', '8D', '8E', '9A', '9B', '9C', '9D', '9E'];
    const existingGrades = Array.from(new Set(students.map(s => s.grade)));
    return ['-- Pilih Kelas --', ...Array.from(new Set([...baseGrades, ...existingGrades]))].sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (selectedGrade === '-- Pilih Kelas --') return [];
    return students.filter(s => s.grade === selectedGrade);
  }, [students, selectedGrade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubject === '-- Pilih Mata Pelajaran --' || selectedGrade === '-- Pilih Kelas --' || !notes) {
      setError('Harap isi semua field yang wajib.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const bBiroInfo = selectedGuruBiroProfile ? ` [Biro: ${selectedGuruBiroProfile.name} - ${selectedGuruBiroProfile.subject}]` : '';

    addJournal({
      teacherId: user?.id || 'anon',
      teacherName: user?.name || 'Anon',
      studentName: selectedStudent !== '-- Pilih Siswa --' ? selectedStudent : undefined,
      date: new Date().toISOString().split('T')[0],
      grade: selectedGrade,
      subject: selectedSubject,
      topic: notes.substring(0, 50) + '...', // Topic as excerpt
      notes: notes,
      treatment: selectedTreatment !== '-- Pilih Treatment --' ? selectedTreatment : 'Biro Umum',
      bureauTeacherId: selectedGuruBiroId !== '-- Pilih Guru Biro --' ? selectedGuruBiroId : undefined
    });

    setSuccess('Data berhasil disimpan ke database!');
    setNotes('');
    setSelectedStudent('-- Pilih Siswa --');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddRekomendasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || newStudentGrade === '-- Pilih Kelas --') {
      setError('Harap isi nama dan kelas siswa baru.');
      return;
    }

    addStudent(newStudentName, newStudentGrade, newStudentObstacle, user?.name);
    
    setSuccess(`Siswa ${newStudentName} berhasil direkomendasikan!`);
    setNewStudentName('');
    setNewStudentGrade('-- Pilih Kelas --');
    setNewStudentObstacle('');
    setShowRekomendasiModal(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const teacherJournals = useMemo(() => {
    return journals
      .filter(j => j.teacherId === user?.id)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [journals, user]);

  return (
    <div className="space-y-8 pb-24 relative">
      {/* Hero Section */}
      <div className="bg-[#064E3B] text-white p-10 rounded-[40px] relative overflow-hidden shadow-2xl shadow-emerald-900/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-400/20 border border-emerald-400/30 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">
            <LayoutDashboard className="w-3 h-3" />
            Mode Pengajar Umum
          </div>
          <h2 className="text-4xl font-black mb-4">Selamat Datang, {user?.name}!</h2>
          <p className="text-emerald-100/70 font-medium leading-relaxed">
            Kelola dan input materi pembelajaran harian Anda beserta sasaran siswa ke dalam database sistem.
          </p>
          
          <button 
            onClick={() => setShowRekomendasiModal(true)}
            className="mt-6 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-lg shadow-emerald-950/20 group"
          >
            <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Rekomendasi Siswa Baru
          </button>
        </div>
        {/* Abstract Shapes */}
        <div className="absolute right-[-10%] top-[-20%] w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute right-[5%] bottom-[-10%] w-60 h-60 bg-emerald-400/10 rounded-full blur-2xl" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'MAPEL DIAMPU', value: teacherProfile?.subject || 'Umum', icon: Book, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'STATUS AKSES', value: 'Aktif', icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'TANGGAL HARI INI', value: format(new Date(), 'EEEE, d MMM yyyy', { locale: id }), icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'PERAN SISTEM', value: 'Guru Umum', icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
              <p className="text-lg font-black text-slate-900 leading-tight">{card.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Input Form Section */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Input Materi Pembelajaran</h3>
            <p className="text-slate-500 text-xs font-medium">Masukkan ringkasan materi atau modul yang akan disimpan ke database `guru_umum`</p>
          </div>
        </div>

        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-sm font-bold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" /> {success}
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-3">
              <AlertCircle className="w-5 h-5" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mata Pelajaran</label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition font-medium text-sm"
              >
                <option disabled>-- Pilih Mata Pelajaran --</option>
                {teacherProfile?.subject && <option value={teacherProfile.subject}>{teacherProfile.subject}</option>}
                <option value="Bahasa Inggris">Bahasa Inggris</option>
                <option value="IPA">IPA</option>
                <option value="Matematika">Matematika</option>
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                <option value="PAI">PAI</option>
                <option value="PPKN">PPKN</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pilih Guru Biro</label>
              <select 
                value={selectedGuruBiroId} 
                onChange={(e) => setSelectedGuruBiroId(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition font-medium text-sm"
              >
                <option disabled>-- Pilih Guru Biro --</option>
                <option value="-- Pilih Guru Biro --">Tidak Ada / Umum</option>
                {guruBiroUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mapel Biro (Otomatis)</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  readOnly
                  value={selectedGuruBiroProfile?.subject || '-'} 
                  className="w-full pl-11 pr-5 py-3.5 bg-slate-100 border border-transparent rounded-2xl outline-none font-black text-emerald-600 text-sm"
                  placeholder="Mapel biro..."
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Treatment</label>
              <select 
                value={selectedTreatment} 
                onChange={(e) => setSelectedTreatment(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition font-medium text-sm"
              >
                <option disabled>-- Pilih Treatment --</option>
                <option value="Biro Umum">Biro Umum</option>
                <option value="Biro TKA">Biro TKA</option>
                <option value="Olimpiade">Olimpiade</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pilih Kelas Siswa</label>
              <select 
                value={selectedGrade} 
                onChange={(e) => { setSelectedGrade(e.target.value); setSelectedStudent('-- Pilih Siswa --'); }}
                className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition font-medium text-sm"
              >
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pilih Nama Siswa</label>
              <select 
                disabled={selectedGrade === '-- Pilih Kelas --'}
                value={selectedStudent} 
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition font-medium text-sm disabled:opacity-50"
              >
                <option disabled>-- Pilih Nama Siswa --</option>
                <option value="-- Pilih Siswa --">Semua Siswa</option>
                {filteredStudents.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hambatan Belajar / Isi Materi</label>
            <textarea 
              rows={4} 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tuliskan materi pelajaran, modul, atau catatan aktivitas di sini..."
              className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-emerald-500 transition font-medium text-sm resize-none"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              className="flex items-center gap-3 bg-[#059669] text-white px-10 py-4 rounded-[20px] font-black hover:bg-[#047857] transition shadow-xl shadow-emerald-100"
            >
              <Send className="w-5 h-5" />
              Simpan Ke Database
            </button>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Daftar Materi Tersimpan</h3>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Input</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mata Pelajaran</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guru & Mapel</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Siswa & Kelas</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Isi Materi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {teacherJournals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-300 font-black uppercase text-xs tracking-[0.2em]">Belum ada data materi</td>
                </tr>
              ) : (
                teacherJournals.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-8 py-4 text-xs font-bold text-slate-400">
                      {format(new Date(j.timestamp), 'dd MMM yyyy, HH.mm')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-600 font-black uppercase text-xs">{j.subject}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900">{j.teacherName}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase text-slate-900">{j.studentName || 'SEMUA SISWA'}</span>
                        <span className="text-[10px] font-bold text-slate-400 tracking-tighter">(Kelas {j.grade})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded uppercase">
                        {j.treatment || 'Biro Umum'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-xs font-medium text-slate-500 max-w-xs truncate">
                      {j.notes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rekomendasi Modal */}
      <AnimatePresence>
        {showRekomendasiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowRekomendasiModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <PlusCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Rekomendasi Siswa Baru</h3>
                  </div>
                  <button onClick={() => setShowRekomendasiModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleAddRekomendasi} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Siswa Baru</label>
                    <input 
                      type="text" 
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="Masukkan nama lengkap siswa..."
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition font-medium text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pilih Kelas</label>
                    <select 
                      value={newStudentGrade}
                      onChange={(e) => setNewStudentGrade(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition font-medium text-sm"
                    >
                      {grades.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hambatan Belajar (Opsional)</label>
                    <textarea 
                      rows={3} 
                      value={newStudentObstacle}
                      onChange={(e) => setNewStudentObstacle(e.target.value)}
                      placeholder="Apa hambatan yang dialami siswa ini?"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition font-medium text-sm resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#059669] text-white py-4 rounded-2xl font-black hover:bg-[#047857] transition shadow-lg shadow-emerald-100 mt-4 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Kirim Rekomendasi
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
