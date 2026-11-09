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
  const [customSubject, setCustomSubject] = useState('');
  const [selectedMapelBiro, setSelectedMapelBiro] = useState('-- Pilih Mapel Biro --');
  const [selectedGuruBiroId, setSelectedGuruBiroId] = useState('-- Pilih Guru Biro --');
  const [selectedTreatment, setSelectedTreatment] = useState('-- Pilih Treatment --');
  const [selectedGrade, setSelectedGrade] = useState('-- Pilih Kelas --');
  const [selectedStudent, setSelectedStudent] = useState('-- Pilih Siswa --');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRekomendasiModal, setShowRekomendasiModal] = useState(false);

  // Rekomendasi Siswa Baru State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('-- Pilih Kelas --');
  const [newStudentObstacle, setNewStudentObstacle] = useState('');

  const MAPEL_BIRO_OPTIONS = [
    'BIG 789',
    'IPA 78',
    'IPA 9',
    'MTK 9',
    'MTK 78',
    'BIN 789'
  ];

  const teacherProfile = useMemo(() => {
    return teachers.find(t => t.id === user?.teacherId);
  }, [teachers, user]);

  const guruBiroUsers = useMemo(() => {
    return allUsers.filter(u => u.role === 'guru_biro');
  }, [allUsers]);

  // Find matching Guru Biro when Mapel Biro is selected
  const findMatchingGuruBiro = (mapelBiroVal: string) => {
    if (!mapelBiroVal || mapelBiroVal === '-- Pilih Mapel Biro --') return null;

    const target = mapelBiroVal.toLowerCase().trim(); // e.g. "big 789", "ipa 78", "ipa 9", "mtk 9", "mtk 89", "bin 789"
    const prefix = target.split(' ')[0]; // "big", "ipa", "mtk", "bin"
    const gradePart = target.split(' ')[1] || ''; // "789", "78", "9", "89"

    // 1. Exact match on teacher.subject (case-insensitive)
    const exact = guruBiroUsers.find(u => {
      const prof = teachers.find(t => t.id === u.teacherId || t.name.toLowerCase() === u.name.toLowerCase());
      return prof && prof.subject.toLowerCase().trim() === target;
    });
    if (exact) return exact;

    // 2. Match with gradePart (e.g. teacher.subject contains "ipa" and "78")
    if (gradePart) {
      const withGrade = guruBiroUsers.find(u => {
        const prof = teachers.find(t => t.id === u.teacherId || t.name.toLowerCase() === u.name.toLowerCase());
        if (!prof) return false;
        const s = prof.subject.toLowerCase();
        const hasPrefix = s.includes(prefix) || 
          (prefix === 'big' && s.includes('inggris')) || 
          (prefix === 'mtk' && s.includes('mat')) || 
          (prefix === 'bin' && s.includes('indonesia'));
        return hasPrefix && s.includes(gradePart);
      });
      if (withGrade) return withGrade;
    }

    // 3. Match on subject prefix / keyword (e.g. 'IPA' matches teacher with subject 'IPA')
    const withPrefix = guruBiroUsers.find(u => {
      const prof = teachers.find(t => t.id === u.teacherId || t.name.toLowerCase() === u.name.toLowerCase());
      if (!prof) return false;
      const s = prof.subject.toLowerCase();
      if (prefix === 'big') return s.includes('big') || s.includes('inggris');
      if (prefix === 'ipa') return s.includes('ipa') || s.includes('alam');
      if (prefix === 'mtk') return s.includes('mtk') || s.includes('matematika');
      if (prefix === 'bin') return s.includes('bin') || s.includes('indonesia');
      return s.includes(prefix);
    });
    if (withPrefix) return withPrefix;

    return null;
  };

  const handleMapelBiroChange = (mapelBiroValue: string) => {
    setSelectedMapelBiro(mapelBiroValue);

    if (mapelBiroValue === '-- Pilih Mapel Biro --') {
      setSelectedGuruBiroId('-- Pilih Guru Biro --');
      return;
    }

    // Automatically fill / select the corresponding Guru Biro
    const matchedUser = findMatchingGuruBiro(mapelBiroValue);
    if (matchedUser) {
      setSelectedGuruBiroId(matchedUser.id);
    } else {
      setSelectedGuruBiroId('-- Pilih Guru Biro --');
    }
  };

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
    const finalSubject = selectedSubject === 'Lainnya (Isi Manual)' 
      ? customSubject.trim() 
      : selectedSubject;

    if (!finalSubject || finalSubject === '-- Pilih Mata Pelajaran --') {
      setError('Harap pilih atau isi Mata Pelajaran.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (selectedGrade === '-- Pilih Kelas --' || !notes.trim()) {
      setError('Harap isi Kelas dan Catatan Hambatan/Materi.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    addJournal({
      teacherId: user?.id || 'anon',
      teacherName: user?.name || 'Anon',
      studentName: selectedStudent !== '-- Pilih Siswa --' ? selectedStudent : undefined,
      date: new Date().toISOString().split('T')[0],
      grade: selectedGrade,
      subject: finalSubject,
      topic: notes.substring(0, 50) + '...', // Topic as excerpt
      notes: notes,
      treatment: selectedTreatment !== '-- Pilih Treatment --' ? selectedTreatment : 'Biro Umum',
      bureauTeacherId: selectedGuruBiroId !== '-- Pilih Guru Biro --' ? selectedGuruBiroId : undefined,
      mapelBiro: selectedMapelBiro !== '-- Pilih Mapel Biro --' ? selectedMapelBiro : undefined
    });

    setSuccess('Data materi pembelajaran berhasil disimpan ke database!');
    setNotes('');
    setCustomSubject('');
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
          {/* Row 1: Mata Pelajaran, Mapel Biro, and Pilih Guru Biro (Otomatis) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Mata Pelajaran: BIG, IPA, MTK, BIN, Lainnya (isi manual) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                Mata Pelajaran
              </label>
              <select 
                value={selectedSubject} 
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  if (e.target.value !== 'Lainnya (Isi Manual)') {
                    setCustomSubject('');
                  }
                }}
                className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition font-bold text-sm text-slate-800"
              >
                <option disabled>-- Pilih Mata Pelajaran --</option>
                <option value="BIG">BIG</option>
                <option value="IPA">IPA</option>
                <option value="MTK">MTK</option>
                <option value="BIN">BIN</option>
                <option value="Lainnya (Isi Manual)">Lainnya (Isi Manual)</option>
              </select>

              {selectedSubject === 'Lainnya (Isi Manual)' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-1.5"
                >
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Ketik nama mata pelajaran manual..."
                    className="w-full px-5 py-3.5 bg-white border-2 border-emerald-500 rounded-2xl outline-none focus:border-emerald-600 transition font-bold text-sm text-slate-800 shadow-sm"
                    autoFocus
                  />
                </motion.div>
              )}
            </div>
            
            {/* 2. Mapel Biro: BIG 789, IPA 78, IPA 9, MTK 9, MTK 78, BIN 789 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                Mapel Biro
              </label>
              <select 
                value={selectedMapelBiro} 
                onChange={(e) => handleMapelBiroChange(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition font-bold text-sm text-emerald-700"
              >
                <option disabled>-- Pilih Mapel Biro --</option>
                {MAPEL_BIRO_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 font-bold px-1">
                Pilih mapel biro dulu, guru biro muncul otomatis
              </p>
            </div>

            {/* 3. Pilih Guru Biro (Diisi Otomatis) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Pilih Guru Biro
                </label>
                {selectedGuruBiroId !== '-- Pilih Guru Biro --' && (
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase border border-emerald-100 animate-in fade-in">
                    Otomatis Terisi
                  </span>
                )}
              </div>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  value={selectedGuruBiroId} 
                  onChange={(e) => setSelectedGuruBiroId(e.target.value)}
                  className={`w-full pl-11 pr-5 py-3.5 rounded-2xl outline-none transition font-bold text-sm ${
                    selectedMapelBiro === '-- Pilih Mapel Biro --' 
                      ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                      : 'bg-emerald-50/60 border border-emerald-200 text-emerald-900 focus:bg-white focus:border-emerald-500'
                  }`}
                >
                  <option disabled>-- Pilih Guru Biro --</option>
                  {selectedMapelBiro === '-- Pilih Mapel Biro --' && (
                    <option value="-- Pilih Guru Biro --">-- Pilih Mapel Biro Terlebih Dahulu --</option>
                  )}
                  {guruBiroUsers.map(u => {
                    const prof = teachers.find(t => t.id === u.teacherId || t.name === u.name);
                    return (
                      <option key={u.id} value={u.id}>
                        {u.name} {prof?.subject ? `(${prof.subject})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedGuruBiroProfile && (
                <div className="flex items-center gap-2 px-1 text-emerald-700 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Guru: {selectedGuruBiroProfile.name} • Mapel: {selectedGuruBiroProfile.subject}</span>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Treatment, Kelas, Siswa */}
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

          {/* Row 3: Catatan / Hambatan Belajar */}
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
                      <div className="flex flex-col gap-0.5">
                        <span className="text-emerald-600 font-black uppercase text-xs">{j.subject}</span>
                        {j.mapelBiro && (
                          <span className="text-[10px] font-bold text-slate-400 tracking-tighter">Biro: {j.mapelBiro}</span>
                        )}
                      </div>
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
