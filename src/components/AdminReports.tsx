import { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  Printer, 
  FileSpreadsheet,
  ChevronUp,
  ChevronDown,
  Info,
  MoreVertical,
  Eye,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  Save,
  Clock,
  User as UserIcon,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Teacher, AttendanceRecord, TeachingJournal, AttendanceStatus } from '../hooks/useAttendance';
import { useAttendanceContext } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

interface AdminReportsProps {
  students: Student[];
  teachers: Teacher[];
  records: AttendanceRecord[];
  journals: TeachingJournal[];
  onDeleteRecord: (id: string) => void;
}

type SortField = 'date' | 'name' | 'grade' | 'status' | 'subject' | 'teacher';
type SortOrder = 'asc' | 'desc';

export default function AdminReports({ students, teachers, records, journals, onDeleteRecord }: AdminReportsProps) {
  const { updateRecord } = useAttendanceContext();
  const { allUsers } = useAuth();
  
  // Filter States
  const [filterGrades, setFilterGrades] = useState<string[]>([]);
  const [isGradeFilterOpen, setIsGradeFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterTeacher, setFilterTeacher] = useState('Semua Guru');
  const [searchName, setSearchName] = useState('');
  
  // Sorting States
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Modal States
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('H');
  const [editNotes, setEditNotes] = useState('');
  const [success, setSuccess] = useState('');

  // Guru Biro list from users
  const guruBiroList = useMemo(() => {
    return allUsers.filter(u => u.role === 'guru_biro');
  }, [allUsers]);

  // Grades list (Remove 'Semua Kelas' from base list as it's handled by empty array)
  const grades = useMemo(() => [
    '7A', '7B', '7C', '7D', '7E', '7F', '7G', 
    '8A', '8B', '8C', '8D', '8E', '8F', '8G', 
    '9A', '9B', '9C', '9D', '9E', '9F', '9G'
  ], []);

  // Combined Data for Table
  const tableData = useMemo(() => {
    return records
      .filter(r => r.type === 'student')
      .map(record => {
        const student = students.find(s => s.id === record.targetId);
        const journal = journals.find(j => 
          j.date === record.date && 
          (j.grade === student?.grade || j.studentName === student?.name)
        );
        
        return {
          id: record.id,
          date: record.date,
          timestamp: record.timestamp,
          studentName: student?.name || 'Siswa Dihapus',
          grade: student?.grade || '-',
          status: record.status,
          notes: record.notes,
          subject: journal?.subject || '-',
          teacher: journal?.teacherName || record.markedByName,
          markedBy: record.markedBy,
          topic: record.notes || journal?.topic || '-'
        };
      });
  }, [records, students, journals]);

  // Filtered Data
  const filteredData = useMemo(() => {
    return tableData.filter(item => {
      const matchGrade = filterGrades.length === 0 || filterGrades.includes(item.grade);
      const matchStatus = filterStatus === 'Semua Status' || item.status === (filterStatus === 'Hadir' ? 'H' : filterStatus === 'Izin' ? 'I' : filterStatus === 'Sakit' ? 'S' : 'A');
      const matchTeacher = filterTeacher === 'Semua Guru' || item.markedBy === filterTeacher;
      const matchSearch = item.studentName.toLowerCase().includes(searchName.toLowerCase());
      
      let matchDate = true;
      if (startDate && endDate) {
        const itemDate = parseISO(item.date);
        matchDate = isWithinInterval(itemDate, {
          start: startOfDay(parseISO(startDate)),
          end: endOfDay(parseISO(endDate))
        });
      }

      return matchGrade && matchStatus && matchTeacher && matchSearch && matchDate;
    });
  }, [tableData, filterGrades, filterStatus, filterTeacher, searchName, startDate, endDate]);

  // Summary Logic based on filtered data
  const summary = useMemo(() => {
    const counts = { H: 0, I: 0, S: 0, A: 0 };
    filteredData.forEach(item => {
      counts[item.status]++;
    });
    return counts;
  }, [filteredData]);

  // Sorted Data
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let valA: any = a[sortField === 'name' ? 'studentName' : sortField];
      let valB: any = b[sortField === 'name' ? 'studentName' : sortField];

      if (sortField === 'date') {
        valA = a.timestamp;
        valB = b.timestamp;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'H': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-lg uppercase">Hadir</span>;
      case 'I': return <span className="px-2.5 py-1 bg-amber-100 text-amber-600 text-[10px] font-black rounded-lg uppercase">Izin</span>;
      case 'S': return <span className="px-2.5 py-1 bg-blue-100 text-blue-600 text-[10px] font-black rounded-lg uppercase">Sakit</span>;
      case 'A': return <span className="px-2.5 py-1 bg-rose-100 text-rose-600 text-[10px] font-black rounded-lg uppercase">Alpa</span>;
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <MoreVertical className="w-3 h-3 text-slate-300 ml-1 opacity-40 group-hover:opacity-100" />;
    return sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-indigo-600 ml-1" /> : <ChevronDown className="w-3 h-3 text-indigo-600 ml-1" />;
  };

  const handleOpenDetail = (item: any) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setSelectedItem(item);
    setEditStatus(item.status);
    setEditNotes(item.notes || '');
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedItem) return;
    updateRecord(selectedItem.id, {
      status: editStatus,
      notes: editNotes
    });
    setSuccess('Data absensi berhasil diperbarui!');
    setIsEditOpen(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-20 right-6 z-50 bg-emerald-600 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 font-bold">
            <CheckCircle2 className="w-6 h-6" /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metric / Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'TOTAL HADIR', count: summary.H, color: 'border-l-blue-500', text: 'text-blue-600' },
          { label: 'TOTAL IZIN', count: summary.I, color: 'border-l-amber-500', text: 'text-amber-600' },
          { label: 'TOTAL SAKIT', count: summary.S, color: 'border-l-orange-500', text: 'text-orange-500' },
          { label: 'TOTAL ALPA', count: summary.A, color: 'border-l-rose-500', text: 'text-rose-600' },
        ].map((card, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl border border-slate-200 border-l-4 ${card.color} shadow-sm hover:shadow-md transition-shadow`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{card.label}</p>
            <p className={`text-4xl font-black ${card.text}`}>{card.count}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Kelas</label>
            <button 
              onClick={() => setIsGradeFilterOpen(!isGradeFilterOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none hover:border-indigo-500 transition-colors"
            >
              <span className="truncate">
                {filterGrades.length === 0 ? 'Semua Kelas' : `${filterGrades.length} Kelas Terpilih`}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isGradeFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isGradeFilterOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsGradeFilterOpen(false)} 
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto p-2"
                  >
                    <button 
                      onClick={() => { setFilterGrades([]); setIsGradeFilterOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition ${filterGrades.length === 0 ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-400'}`}
                    >
                      Semua Kelas
                    </button>
                    <div className="h-px bg-slate-100 my-2" />
                    <div className="grid grid-cols-2 gap-1">
                      {grades.map(g => {
                        const isSelected = filterGrades.includes(g);
                        return (
                          <button
                            key={g}
                            onClick={() => {
                              setFilterGrades(prev => 
                                isSelected ? prev.filter(pg => pg !== g) : [...prev, g]
                              );
                            }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${isSelected ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                              {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Mulai</label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Sampai</label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Absen</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors appearance-none"
            >
              {['Semua Status', 'Hadir', 'Izin', 'Sakit', 'Alpa'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Guru</label>
            <select 
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors appearance-none"
            >
              <option value="Semua Guru">Semua Guru Biro</option>
              {guruBiroList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cari Nama Siswa</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text"
                placeholder="Ketik nama..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition shadow-lg shadow-slate-200">
            <Search className="w-4 h-4" />
            Tampilkan
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-black text-slate-900">Tabel Laporan Absensi</h3>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-100 transition border border-blue-100">
              <Printer className="w-4 h-4" />
              Cetak
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-100 transition border border-emerald-100">
              <FileSpreadsheet className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th onClick={() => handleSort('date')} className="group cursor-pointer px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100/50 transition">
                  <div className="flex items-center">TANGGAL <SortIcon field="date" /></div>
                </th>
                <th onClick={() => handleSort('name')} className="group cursor-pointer px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100/50 transition">
                  <div className="flex items-center">NAMA SISWA <SortIcon field="name" /></div>
                </th>
                <th onClick={() => handleSort('grade')} className="group cursor-pointer px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100/50 transition">
                  <div className="flex items-center">KELAS <SortIcon field="grade" /></div>
                </th>
                <th onClick={() => handleSort('status')} className="group cursor-pointer px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100/50 transition">
                  <div className="flex items-center">STATUS <SortIcon field="status" /></div>
                </th>
                <th onClick={() => handleSort('subject')} className="group cursor-pointer px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100/50 transition">
                  <div className="flex items-center">MATERI <SortIcon field="subject" /></div>
                </th>
                <th onClick={() => handleSort('teacher')} className="group cursor-pointer px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100/50 transition">
                  <div className="flex items-center">GURU <SortIcon field="teacher" /></div>
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedData.length > 0 ? (
                sortedData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {format(new Date(item.timestamp), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900 uppercase">
                      {item.studentName}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500 uppercase">
                      {item.grade}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {item.subject}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      {item.teacher}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenDetail(item)}
                          className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" 
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" 
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mb-2">
                        <Info className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                        Tidak ada data absensi ditemukan pada filter ini.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                      <Eye className="w-7 h-7 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">Detail Absensi</h3>
                      <p className="text-slate-500 text-sm font-medium">Informasi terperinci catatan kehadiran</p>
                    </div>
                  </div>
                  <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Siswa</p>
                    <p className="font-bold text-slate-900 uppercase">{selectedItem.studentName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kelas</p>
                    <p className="font-bold text-slate-900">Kelas {selectedItem.grade}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Input</p>
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      {format(new Date(selectedItem.timestamp), 'dd MMMM yyyy, HH.mm')}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                    {getStatusBadge(selectedItem.status)}
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedItem.subject}</span>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Materi / Catatan</p>
                     <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                        "{selectedItem.topic}"
                     </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Perekap</p>
                    <p className="text-sm font-bold text-slate-900">{selectedItem.teacher}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                      <Edit2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">Ubah Data Absensi</h3>
                      <p className="text-slate-500 text-sm font-medium">Lakukan perbaikan data kehadiran</p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status Kehadiran</label>
                    <div className="grid grid-cols-4 gap-3">
                      {(['H', 'I', 'S', 'A'] as AttendanceStatus[]).map((st) => {
                        const labels = { H: 'Hadir', I: 'Izin', S: 'Sakit', A: 'Alpa' };
                        const isActive = editStatus === st;
                        const colors = {
                          H: 'bg-emerald-500 shadow-emerald-100',
                          I: 'bg-amber-500 shadow-amber-100',
                          S: 'bg-blue-500 shadow-blue-100',
                          A: 'bg-rose-500 shadow-rose-100'
                        };
                        return (
                          <button
                            key={st}
                            onClick={() => setEditStatus(st)}
                            className={`py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                              isActive ? `${colors[st]} text-white shadow-lg` : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            {labels[st]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Catatan / Materi</label>
                    <textarea
                      rows={4}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Tuliskan catatan perbaikan atau materi..."
                      className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-[24px] outline-none focus:bg-white focus:border-emerald-500 transition font-medium text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    onClick={() => setIsEditOpen(false)}
                    className="px-6 py-3 text-slate-400 font-bold hover:text-slate-600 transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                  >
                    <Save className="w-4 h-4" />
                    SIMPAN PERUBAHAN
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
