import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAttendanceContext } from '../context/AttendanceContext';
import { BookText, Plus, Search, Calendar, GraduationCap, X, Trash2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function TeachingJournalView() {
  const { user } = useAuth();
  const { journals, addJournal, deleteJournal } = useAttendanceContext();
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [studentName, setStudentName] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    addJournal({
      teacherId: user.id,
      teacherName: user.name,
      studentName,
      date: new Date().toISOString().split('T')[0],
      grade,
      subject,
      topic,
      notes,
    });

    setStudentName('');
    setGrade('');
    setTopic('');
    setNotes('');
    setIsAdding(false);
  };

  const filteredJournals = journals.filter(j => 
    j.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto pb-24">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BookText className="w-6 h-6 text-indigo-600" />
            Jurnal Kelas
          </h2>
          <p className="text-slate-500 text-sm font-medium">Catatan proses pembelajaran harian</p>
        </div>
        
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition shadow-lg font-bold text-sm ${
            isAdding ? 'bg-slate-100 text-slate-600' : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
          }`}
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{isAdding ? 'Tutup' : 'Isi Jurnal'}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Siswa</label>
              <input
                required
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Nama lengkap siswa..."
                className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition font-medium"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mata Pelajaran</label>
                <input
                  required
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Matematika"
                  className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kelas</label>
                <input
                  required
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Contoh: 9A"
                  className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Materi Pembelajaran</label>
              <input
                required
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Topik atau judul materi..."
                className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition font-medium"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Catatan / Kegiatan</label>
              <textarea
                required
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detail kegiatan belajar mengajar..."
                className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition font-medium resize-none"
              />
            </div>

            <button
              type="submit"
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-800 transition shadow-lg shadow-slate-100"
            >
              SIMPAN KE JURNAL
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari materi, mapel, atau guru..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-4 bg-white border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition font-medium"
        />
      </div>

      <div className="flex flex-col gap-4">
        {filteredJournals.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
            <BookText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Belum ada jurnal pengajaran</p>
          </div>
        ) : (
          filteredJournals.map((journal) => (
            <motion.div
              layout
              key={journal.id}
              className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col gap-4 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 leading-tight">
                      {format(new Date(journal.date), 'EEEE, d MMMM yyyy', { locale: id })}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                      <span className="text-indigo-600">Oleh {journal.teacherName}</span>
                      <span>•</span>
                      <span>Kelas {journal.grade}</span>
                    </div>
                  </div>
                </div>

                {(user?.id === journal.teacherId || user?.role === 'admin') && (
                  <button
                    onClick={() => {
                      if (confirm('Hapus catatan jurnal ini?')) deleteJournal(journal.id);
                    }}
                    className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{journal.subject}</span>
                  <span className={`ml-auto px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${
                    journal.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    journal.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {journal.status === 'approved' ? 'Disetujui' :
                     journal.status === 'rejected' ? 'Ditolak' :
                     'Menunggu'}
                  </span>
                </div>
                <h5 className="font-bold text-slate-900 mb-2">{journal.topic}</h5>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{journal.notes}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
