import { useState, useEffect } from 'react';
import { 
  Search, 
  UserCheck, 
  UserMinus, 
  GraduationCap, 
  Calendar, 
  Users, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Save, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle,
  LayoutDashboard,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Teacher, AttendanceRecord, AttendanceStatus } from '../hooks/useAttendance';
import { useAuth } from '../context/AuthContext';
import { useAttendanceContext } from '../context/AttendanceContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ManualAttendanceProps {
  students: Student[];
  teachers: Teacher[];
  records: AttendanceRecord[];
  journals: any[];
  onLog: (targetId: string, userId: string, userName: string, type: 'student' | 'teacher', status: AttendanceStatus) => any;
  onRemove: (targetId: string, type: 'student' | 'teacher') => void;
}

export default function ManualAttendance({ students, teachers, records, journals, onLog, onRemove }: ManualAttendanceProps) {
  const { user } = useAuth();
  const { logAttendanceBulk } = useAttendanceContext();
  const [activeSubTab, setActiveSubTab] = useState<'presensi' | 'materi'>('presensi');
  const [selectedGrade, setSelectedGrade] = useState('Kelas 7A');
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tempAttendance, setTempAttendance] = useState<Record<string, { status: AttendanceStatus; topic: string }>>({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = format(currentTime, 'yyyy-MM-dd');
  const dateLabel = format(currentTime, 'EEEE, d MMMM yyyy', { locale: id });
  const timeLabel = format(currentTime, 'HH:mm');

  const grades = [
    'Kelas 7A', 'Kelas 7B', 'Kelas 7C', 'Kelas 7D', 'Kelas 7E', 'Kelas 7F', 'Kelas 7G', 
    'Kelas 8A', 'Kelas 8B', 'Kelas 8C', 'Kelas 8D', 'Kelas 8E', 'Kelas 8F', 'Kelas 8G', 
    'Kelas 9A', 'Kelas 9B', 'Kelas 9C', 'Kelas 9D', 'Kelas 9E', 'Kelas 9F', 'Kelas 9G'
  ];

  const filteredStudents = students.filter(s => {
    const matchesGrade = s.grade === selectedGrade.replace('Kelas ', '');
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  const handleTampilkan = () => {
    setIsLoaded(true);
    const initialTemp: Record<string, { status: AttendanceStatus; topic: string }> = {};
    filteredStudents.forEach(s => {
      const record = records.find(r => r.targetId === s.id && r.date === today && r.type === 'student');
      initialTemp[s.id] = {
        status: record?.status as AttendanceStatus || 'H',
        topic: record?.notes || ''
      };
    });
    setTempAttendance(initialTemp);
  };

  const updateStatus = (studentId: string, status: AttendanceStatus) => {
    setTempAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const updateTopic = (studentId: string, topic: string) => {
    setTempAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], topic }
    }));
  };

  const handleAllAbsent = () => {
    const newTemp = { ...tempAttendance };
    filteredStudents.forEach(s => {
      newTemp[s.id] = { ...newTemp[s.id], status: 'A' };
    });
    setTempAttendance(newTemp);
  };

  const handleSave = () => {
    const data = Object.entries(tempAttendance).map(([studentId, d]) => ({
      targetId: studentId,
      status: d.status,
      notes: d.topic
    }));

    logAttendanceBulk(data, user?.id || 'anon', user?.name || 'Anon', 'student');
    setSuccess('Data absensi berhasil disimpan ke database!');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (activeSubTab === 'materi') {
    const approvedJournals = journals.filter(j => 
      (j.teacherId === user?.id || j.bureauTeacherId === user?.id) && 
      j.status === 'approved'
    );

    return (
      <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-8">
        <div className="flex justify-center">
          <div className="bg-slate-100 p-1.5 rounded-3xl flex gap-1.5 shadow-inner">
            <button
              onClick={() => setActiveSubTab('presensi')}
              className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-slate-500 hover:text-slate-900"
            >
              Presensi Kelas
            </button>
            <button className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-white text-blue-600 shadow-xl shadow-blue-900/5 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Materi Terverifikasi
            </button>
          </div>
        </div>

        {approvedJournals.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-20 rounded-[48px] border border-slate-100 text-center flex flex-col items-center gap-6 shadow-sm"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center border border-slate-100 text-slate-200">
              <FileCheck className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Belum Ada Materi</h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto">Materi yang telah diajukan dan disetujui akan muncul di sini untuk acuan pembelajaran.</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approvedJournals.map((j, i) => (
              <motion.div 
                key={j.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[24px] flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase border border-emerald-100">
                        {j.treatment || 'Biro Umum'}
                      </span>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase border border-blue-100">
                        Kelas {j.grade}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{j.topic}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-900">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-black uppercase">{j.studentName || 'SEMUA SISWA'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(j.date), 'dd MMMM yyyy', { locale: id })}
                        <span className="mx-1">•</span>
                        Oleh: {j.teacherName}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-8">
      {/* Sub Header / Navigation */}
      <div className="flex justify-center">
        <div className="bg-slate-100 p-1.5 rounded-3xl flex gap-1.5 shadow-inner">
          <button className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-white text-blue-600 shadow-xl shadow-blue-900/5 flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Presensi Kelas
          </button>
          <button
            onClick={() => setActiveSubTab('materi')}
            className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-slate-500 hover:text-slate-900 flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Materi Terverifikasi
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Pilih Kelas</label>
              <div className="relative group">
                <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <select
                  value={selectedGrade}
                  onChange={(e) => { setSelectedGrade(e.target.value); setIsLoaded(false); }}
                  className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-blue-600 transition font-black text-slate-900 appearance-none"
                >
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 rotate-90 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Waktu Presensi</label>
              <div className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-[24px] group hover:border-blue-100 transition-colors">
                <div className="flex items-center gap-4 text-slate-900">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-black text-sm uppercase">{dateLabel}</span>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-black tabular-nums text-sm">{timeLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleTampilkan}
            className="group flex items-center gap-3 bg-blue-600 text-white px-12 py-5 rounded-[24px] hover:bg-blue-700 transition shadow-2xl shadow-blue-200 font-black uppercase text-sm tracking-widest whitespace-nowrap"
          >
            <Search className="w-5 h-5 group-hover:scale-125 transition-transform" />
            Tampilkan Siswa
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoaded ? (
          <motion.div 
            key="loaded"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Daftar Siswa {selectedGrade}</h3>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{filteredStudents.length} Siswa Terdaftar</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="text"
                    placeholder="Cari nama siswa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 pr-6 py-3.5 bg-slate-50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-blue-600 outline-none transition font-black text-xs w-full sm:w-64"
                  />
                </div>
                <button 
                  onClick={handleAllAbsent}
                  className="flex items-center gap-3 px-8 py-3.5 bg-white border-2 border-rose-100 text-rose-600 rounded-[20px] hover:bg-rose-50 hover:border-rose-200 transition font-black text-[10px] uppercase tracking-widest shadow-sm"
                >
                  <UserMinus className="w-4 h-4" />
                  Set Semua Tidak Hadir
                </button>
              </div>
            </div>

            {/* Student List */}
            <div className="space-y-4">
              {filteredStudents.map((student, i) => {
                const current = tempAttendance[student.id] || { status: 'H', topic: '' };
                return (
                  <motion.div 
                    key={student.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group p-6 bg-white border border-slate-100 rounded-[32px] hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-300 text-lg border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-200 transition-colors shrink-0 uppercase">
                        {student.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{student.name}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2 py-0.5 bg-slate-50 rounded border border-slate-100">ID: {student.id.split('-')[0]}</span>
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-2 py-0.5 bg-blue-50 rounded border border-blue-100">Grade {student.grade}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 flex-1 lg:max-w-3xl">
                      <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden w-full sm:w-auto shadow-sm">
                        {(['H', 'I', 'S', 'A'] as AttendanceStatus[]).map((st) => {
                          const labels = { H: 'Hadir', I: 'Izin', S: 'Sakit', A: 'Alpa' };
                          const isActive = current.status === st;
                          
                          return (
                            <button
                              key={st}
                              onClick={() => updateStatus(student.id, st)}
                              className={`
                                flex-1 sm:flex-none px-6 py-2.5 text-xs transition-all border-r last:border-r-0 border-slate-200
                                ${isActive 
                                  ? 'bg-blue-600 text-white font-semibold' 
                                  : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }
                              `}
                            >
                              {labels[st]}
                            </button>
                          );
                        })}
                      </div>

                      <div className="relative flex-1">
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                          type="text"
                          placeholder="TOPIK MATERI / CATATAN"
                          value={current.topic}
                          onChange={(e) => updateTopic(student.id, e.target.value)}
                          className="w-full pl-11 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition font-black text-[10px] uppercase tracking-[0.1em] text-slate-900 placeholder:text-slate-200"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer Action */}
            <div className="bg-[#0F172A] p-8 sm:p-10 rounded-[48px] shadow-2xl shadow-slate-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-black text-white">Validasi Akhir</h4>
                    <p className="text-slate-400 text-sm font-medium">Pastikan seluruh status dan topik materi telah diinput dengan benar sebelum sinkronisasi.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <AnimatePresence>
                    {success && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-emerald-500/10 text-emerald-400 px-6 py-4 rounded-2xl border border-emerald-500/20 text-sm font-black uppercase tracking-widest flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Tersimpan!
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <button
                    onClick={handleSave}
                    className="flex items-center justify-center gap-3 bg-blue-600 text-white px-12 py-5 rounded-[24px] hover:bg-blue-700 transition shadow-2xl shadow-blue-500/40 font-black uppercase text-sm tracking-[0.2em] w-full sm:w-auto"
                  >
                    <Save className="w-6 h-6" />
                    Simpan & Kirim
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-32 rounded-[64px] border border-slate-100 text-center flex flex-col items-center gap-8 shadow-sm"
          >
            <div className="w-32 h-32 bg-slate-50 rounded-[48px] flex items-center justify-center text-slate-100 border border-slate-50">
              <Users className="w-16 h-16" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-slate-900">Siap Untuk Absensi?</h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto text-lg leading-relaxed">Pilih kelas di atas untuk mulai melakukan pencatatan kehadiran dan materi hari ini.</p>
            </div>
            <div className="flex items-center gap-4 bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
              <Info className="w-5 h-5 text-blue-500" />
              <span className="text-blue-600 font-black text-[10px] uppercase tracking-widest">Sistem Ready • {currentTime.toLocaleTimeString()}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
