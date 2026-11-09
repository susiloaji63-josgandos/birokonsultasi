import React, { useState } from 'react';
import { TeachingJournal } from '../hooks/useAttendance';
import { Check, X, Trash2, RotateCcw, Calendar, BookOpen, User, GraduationCap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ApprovalManagerProps {
  journals: TeachingJournal[];
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void;
  onDeleteJournal: (id: string) => void;
}

export default function ApprovalManager({ journals, onUpdateStatus, onDeleteJournal }: ApprovalManagerProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-3 py-1 bg-emerald-100/50 text-emerald-600 text-[10px] font-black rounded-full uppercase">
            Disetujui
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-amber-100/50 text-amber-600 text-[10px] font-black rounded-full uppercase">
            Ditolak
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase">
            Menunggu
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Section Header & Action */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Persetujuan Materi Guru Umum</h2>
          <p className="text-slate-500 text-sm mt-1">
            Tinjau dan konfirmasi materi pembelajaran yang diajukan oleh Guru Umum sebelum ditayangkan
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-all font-bold text-sm"
        >
          <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mata Pelajaran</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guru Mapel</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Siswa & Kelas</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis Materi</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Isi Materi</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi Persetujuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {journals.length > 0 ? (
                  journals.map((journal) => (
                    <motion.tr
                      key={journal.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-500">
                            {format(new Date(journal.timestamp), 'dd MMM yyyy', { locale: id })}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {format(new Date(journal.timestamp), 'HH.mm')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-emerald-500 uppercase">{journal.subject || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-slate-900">{journal.teacherName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 uppercase">
                            {journal.studentName || 'SISWA UMUM'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            (Kelas {journal.grade})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-blue-500 uppercase tracking-tighter">BIRO UMUM</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500 font-medium">{journal.topic}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {getStatusBadge(journal.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onUpdateStatus(journal.id, 'approved')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                              journal.status === 'approved' 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                : 'bg-emerald-500 text-white hover:bg-emerald-600'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            SETUJUI
                          </button>
                          <button
                            onClick={() => onUpdateStatus(journal.id, 'rejected')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                              journal.status === 'rejected' 
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                                : 'bg-amber-500 text-white hover:bg-amber-600'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            TOLAK
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Hapus data persetujuan ini?')) onDeleteJournal(journal.id);
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mb-2">
                          <Info className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                          Tidak ada data persetujuan ditemukan
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
