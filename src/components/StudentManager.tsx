import { useState } from 'react';
import { UserPlus, Users, Trash2, Search, GraduationCap, FileUp, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from '../hooks/useAttendance';
import { useAuth } from '../context/AuthContext';
import FileUpload from './FileUpload';

interface StudentManagerProps {
  students: Student[];
  onAdd: (name: string, grade: string, obstacle?: string, addedBy?: string) => void;
  onAddBulk: (data: { name: string; grade: string }[]) => void;
  onDelete: (id: string) => void;
}

export default function StudentManager({ students, onAdd, onAddBulk, onDelete }: StudentManagerProps) {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'list' | 'add' | 'import'>('list');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [obstacle, setObstacle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (name.trim() && grade.trim()) {
      onAdd(name, grade, obstacle, user?.name);
      setSuccess(`Data ${name} berhasil ditambahkan!`);
      setName('');
      setGrade('');
      setObstacle('');
      setActiveView('list');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const processDelete = (id: string, studentName: string) => {
    try {
      onDelete(id);
      setSuccess(`Data ${studentName} berhasil dihapus.`);
      setDeletingId(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal menghapus data. Silakan coba lagi.');
      setDeletingId(null);
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto pb-24">
      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-3 border border-rose-100 shadow-sm animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-sm font-bold flex items-center gap-3 border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          {success}
        </div>
      )}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Data Siswa
          </h2>
          <p className="text-slate-500 text-sm font-medium">Manajemen daftar murid</p>
        </div>
        
        <div className="flex gap-2">
          {activeView === 'list' ? (
            <>
              {user?.role === 'admin' && (
                <button
                  onClick={() => setActiveView('import')}
                  className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-2xl hover:bg-emerald-100 transition font-bold text-sm"
                >
                  <FileUp className="w-5 h-5" />
                  Impor
                </button>
              )}
              <button
                onClick={() => setActiveView('add')}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 font-bold text-sm"
              >
                <UserPlus className="w-5 h-5" />
                Tambah
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveView('list')}
              className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-3 rounded-2xl hover:bg-slate-200 transition font-bold text-sm"
            >
              <X className="w-5 h-5" />
              Tutup
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'add' && (
          <motion.form
            key="add-form"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col gap-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Lengkap</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kendala Belajar (Opsional)</label>
              <textarea
                rows={3}
                value={obstacle}
                onChange={(e) => setObstacle(e.target.value)}
                placeholder="Deskripsikan kesulitan belajar siswa..."
                className="w-full px-5 py-3 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-600 transition font-medium resize-none"
              />
            </div>

            <button
              type="submit"
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-800 transition shadow-lg shadow-slate-100"
            >
              SIMPAN DATA SISWA
            </button>
          </motion.form>
        )}

        {activeView === 'import' && (
          <motion.div
            key="import-view"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            <FileUpload 
              type="student"
              onImported={(data: { name: string; grade: string }[]) => {
                onAddBulk(data);
                setTimeout(() => setActiveView('list'), 1500);
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama atau kelas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-4 bg-white border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition font-medium"
        />
      </div>

      <div className="grid gap-3">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
            <GraduationCap className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">Belum ada murid terdaftar</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <motion.div
              layout
              key={student.id}
              className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl border border-indigo-100">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg leading-tight">{student.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1 font-bold">
                    <span className="px-2 py-0.5 bg-slate-50 rounded-lg text-indigo-600 border border-indigo-50">Kelas {student.grade}</span>
                    {student.addedBy && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600">Oleh {student.addedBy}</span>
                      </>
                    )}
                  </div>
                  {student.learningObstacle && (
                    <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-100 italic">
                      " {student.learningObstacle} "
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                {deletingId === student.id ? (
                  <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                    <button
                      onClick={() => processDelete(student.id, student.name)}
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
                    onClick={() => setDeletingId(student.id)}
                    className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                    title="Hapus"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
