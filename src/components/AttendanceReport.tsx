import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileDown, 
  Calendar, 
  Search, 
  BarChart3, 
  Users, 
  BookOpen, 
  Filter, 
  UserCircle,
  GraduationCap,
  Trash2,
  BookText,
  Clock,
  ChevronDown,
  Printer,
  FileSpreadsheet,
  ArrowUpDown,
  Eye,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Student, Teacher, AttendanceRecord, AttendanceStatus, TeachingJournal } from '../hooks/useAttendance';
import { useAuth } from '../context/AuthContext';

interface AttendanceReportProps {
  students: Student[];
  teachers: Teacher[];
  records: AttendanceRecord[];
  journals: TeachingJournal[];
  onDeleteRecord: (id: string) => void;
}

export default function AttendanceReport({ students, teachers, records, journals, onDeleteRecord }: AttendanceReportProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isGuruBiro = user?.role === 'guru_biro';
  
  const [activeView, setActiveView] = useState<'summary' | 'detailed'>('summary');
  const [activeType, setActiveType] = useState<'student' | 'teacher'>(isAdmin ? 'teacher' : 'student');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('Semua');
  const [filterTeacher, setFilterTeacher] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'Semua'>('Semua');
  
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const statusMap: Record<AttendanceStatus, { label: string; color: string; bg: string; border: string }> = {
    'H': { label: 'Hadir', color: 'text-emerald-600', bg: 'bg-emerald-500', border: 'border-emerald-200' },
    'I': { label: 'Izin', color: 'text-amber-600', bg: 'bg-amber-500', border: 'border-amber-200' },
    'S': { label: 'Sakit', color: 'text-orange-600', bg: 'bg-orange-500', border: 'border-orange-200' },
    'A': { label: 'Alpa', color: 'text-rose-600', bg: 'bg-rose-500', border: 'border-rose-200' },
  };

  const grades = useMemo(() => {
    const baseGrades = ['7A', '7B', '7C', '7D', '7E', '7F', '7G', '8A', '8B', '8C', '8D', '8E', '8F', '8G', '9A', '9B', '9C', '9D', '9E', '9F', '9G'];
    const existingGrades = Array.from(new Set(students.map(s => s.grade)));
    return ['Semua', ...Array.from(new Set([...baseGrades, ...existingGrades]))].sort();
  }, [students]);
  
  const teacherNames = ['Semua', ...Array.from(new Set(records.map(r => r.markedByName).filter(Boolean)))].sort();

  // Filtered Summary Data
  const reportData = useMemo(() => {
    const targets = activeType === 'student' ? students : teachers;
    
    return targets
      .filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGrade = filterGrade === 'Semua' || (activeType === 'student' && (t as any).grade === filterGrade);
        return matchesSearch && matchesGrade;
      })
      .map(target => {
        const targetRecords = records.filter(r => {
          const matchesTarget = r.targetId === target.id && r.type === activeType;
          const matchesTeacher = filterTeacher === 'Semua' || r.markedByName === filterTeacher;
          const matchesStatus = filterStatus === 'Semua' || r.status === filterStatus;
          
          let matchesDate = true;
          try {
            const rDate = parseISO(r.date);
            matchesDate = isWithinInterval(rDate, {
              start: startOfDay(parseISO(startDate)),
              end: endOfDay(parseISO(endDate))
            });
          } catch (e) { matchesDate = false; }

          return matchesTarget && matchesTeacher && matchesDate && matchesStatus;
        });

        const stats = {
          H: targetRecords.filter(r => r.status === 'H').length,
          I: targetRecords.filter(r => r.status === 'I').length,
          S: targetRecords.filter(r => r.status === 'S').length,
          A: targetRecords.filter(r => r.status === 'A').length,
        };

        return {
          ...target,
          stats,
          total: targetRecords.length
        };
      })
      .filter(item => item.total > 0 || (searchTerm === '' && filterGrade === 'Semua'));
  }, [activeType, students, teachers, records, filterGrade, filterTeacher, searchTerm, startDate, endDate]);

  // Filtered Detailed Records (Transactions)
  const detailedRecords = useMemo(() => {
    return records
      .filter(r => {
        if (r.type !== activeType) return false;
        
        const target = activeType === 'student' 
          ? students.find(s => s.id === r.targetId)
          : teachers.find(t => t.id === r.targetId);
        
        if (!target) return false;

        const matchesSearch = target.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGrade = filterGrade === 'Semua' || (activeType === 'student' && (target as any).grade === filterGrade);
        const matchesTeacher = filterTeacher === 'Semua' || r.markedByName === filterTeacher;
        const matchesStatus = filterStatus === 'Semua' || r.status === filterStatus;
        
        let matchesDate = true;
        try {
          const rDate = parseISO(r.date);
          matchesDate = isWithinInterval(rDate, {
            start: startOfDay(parseISO(startDate)),
            end: endOfDay(parseISO(endDate))
          });
        } catch (e) { matchesDate = false; }

        return matchesSearch && matchesGrade && matchesTeacher && matchesDate && matchesStatus;
      })
      .map(r => {
        const target = activeType === 'student' 
          ? students.find(s => s.id === r.targetId)
          : teachers.find(t => t.id === r.targetId);
        
        const relatedJournal = journals.find(j => 
          j.date === r.date && 
          (activeType === 'student' ? j.grade === (target as any)?.grade : true)
        );

        return {
          ...r,
          targetName: target?.name || 'Unknown',
          targetGrade: (target as any)?.grade || (target as any)?.subject || '-',
          materi: r.notes || relatedJournal?.topic || '-',
        };
      })
      .sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aValue = (a as any)[sortConfig.key];
        const bValue = (b as any)[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [activeType, students, teachers, records, journals, filterGrade, filterTeacher, searchTerm, startDate, endDate, sortConfig]);

  const totals = useMemo(() => {
    return reportData.reduce((acc, curr) => ({
      H: acc.H + curr.stats.H,
      I: acc.I + curr.stats.I,
      S: acc.S + curr.stats.S,
      A: acc.A + curr.stats.A,
    }), { H: 0, I: 0, S: 0, A: 0 });
  }, [reportData]);

  const exportToExcel = () => {
    const label = activeType === 'student' ? 'Siswa' : 'Guru';
    const subLabel = activeType === 'student' ? 'Kelas' : 'Mapel';
    
    let headers: any[];
    let data: any[][];

    if (activeView === 'summary') {
      headers = [label, subLabel, 'Hadir (H)', 'Izin (I)', 'Sakit (S)', 'Alpa (A)', 'Total'];
      data = reportData.map(s => [
        s.name,
        (s as any).grade || (s as any).subject,
        s.stats.H,
        s.stats.I,
        s.stats.S,
        s.stats.A,
        s.total
      ]);
    } else {
      headers = ['No', 'Tanggal', label, subLabel, 'Status', 'Materi', 'Perekap'];
      data = detailedRecords.map((r, idx) => [
        idx + 1,
        r.date,
        r.targetName,
        r.targetGrade,
        statusMap[r.status as AttendanceStatus].label,
        r.materi,
        r.markedByName
      ]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet([
      [`Laporan Kehadiran ${label} (${activeView === 'summary' ? 'Ringkasan' : 'Detail'})`],
      [`Periode: ${startDate} s/d ${endDate}`],
      [],
      headers,
      ...data
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap');
    XLSX.writeFile(workbook, `Rekap_${label}_${activeView}_${startDate}_${endDate}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-full mx-auto pb-24 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Rekapitulasi
          </h2>
          <p className="text-slate-500 text-sm font-medium">Laporan kehadiran terperinci</p>
        </div>
        <button
          onClick={exportToExcel}
          className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 font-bold"
        >
          <FileDown className="w-5 h-5" />
          Download Excel
        </button>
      </div>

      {/* View & Type Selectors */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex p-1 bg-white rounded-2xl border border-slate-200 shadow-sm w-fit">
          <button
            onClick={() => setActiveView('summary')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeView === 'summary' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Ringkasan
          </button>
          <button
            onClick={() => setActiveView('detailed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeView === 'detailed' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Detail Per Siswa
          </button>
        </div>

        {!isAdmin && (
          <div className="flex p-1 bg-white rounded-2xl border border-slate-200 shadow-sm w-fit">
            <button
              onClick={() => { setActiveType('student'); setFilterGrade('Semua'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeType === 'student' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <Users className="w-4 h-4" />
              Siswa
            </button>
            <button
              onClick={() => { setActiveType('teacher'); setFilterGrade('Semua'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeType === 'teacher' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <BookOpen className="w-4 h-4" />
              Guru
            </button>
          </div>
        )}
      </div>

          {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['H', 'I', 'S', 'A'] as AttendanceStatus[]).map(st => (
          <div 
            key={st} 
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow"
          >
            {/* Accent Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusMap[st].bg}`} />
            
            <div className="flex flex-col">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">TOTAL {statusMap[st].label}</p>
              <p className={`text-4xl font-black ${statusMap[st].color} tabular-nums`}>{totals[st]}</p>
            </div>
            <div className={`p-3 rounded-xl ${statusMap[st].bg} bg-opacity-10 ${statusMap[st].color}`}>
               {st === 'H' && <Users className="w-6 h-6" />}
               {st === 'I' && <Clock className="w-6 h-6" />}
               {st === 'S' && <UserCircle className="w-6 h-6" />}
               {st === 'A' && <Filter className="w-6 h-6" />}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-[24px] border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
          {/* Dropdown Grade */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase px-1">Filter Kelas</label>
            <div className="relative">
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition font-bold text-slate-600 appearance-none text-sm"
              >
                {grades.map(g => <option key={g} value={g}>{g === 'Semua' ? 'Semua Kelas' : `Kelas ${g}`}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Range - Start */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase px-1 text-nowrap">Tanggal Mulai</label>
            <div className="relative">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition font-bold text-slate-600 text-sm"
              />
            </div>
          </div>

          {/* Date Range - End */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase px-1 text-nowrap">Tanggal Sampai</label>
            <div className="relative">
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition font-bold text-slate-600 text-sm"
              />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase px-1">Status Absen</label>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition font-bold text-slate-600 appearance-none text-sm"
              >
                <option value="Semua">Semua Status</option>
                <option value="H">Hadir</option>
                <option value="I">Izin</option>
                <option value="S">Sakit</option>
                <option value="A">Alpa</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Search Name */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase px-1">Cari Nama</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ketik nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition font-bold text-slate-600 text-sm"
              />
            </div>
          </div>

          {/* Tampilkan Button */}
          <div className="flex flex-col gap-2">
            <div className="hidden lg:block h-[20px]" /> {/* Spacer for alignment */}
            <button
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition font-bold shadow-lg shadow-slate-100 group"
            >
              <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Tampilkan
            </button>
          </div>
        </div>
        
        {/* Secondary Filter: Teacher/Admin context */}
        {(isAdmin || isGuruBiro) && (
          <div className="mt-4 pt-4 border-t border-slate-50 flex flex-wrap items-center gap-3">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Perekap:</span>
             <div className="flex flex-wrap gap-2">
               {teacherNames.map(t => (
                 <button
                   key={t}
                   onClick={() => setFilterTeacher(t)}
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${filterTeacher === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                 >
                   {t === 'Semua' ? 'Semua' : t}
                 </button>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* Tables */}
      <AnimatePresence mode="wait">
        {activeView === 'summary' ? (
          <motion.div 
            key="summary-table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-5 font-black text-slate-700 sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)] min-w-[200px]">
                      {activeType === 'student' ? 'Nama Siswa' : 'Nama Guru'}
                    </th>
                    <th className="px-6 py-5 font-black text-slate-700 text-center min-w-[100px]">
                      {activeType === 'student' ? 'Kelas' : 'Mapel'}
                    </th>
                    <th className="px-3 py-5 font-black text-emerald-600 text-center">H</th>
                    <th className="px-3 py-5 font-black text-amber-600 text-center">I</th>
                    <th className="px-3 py-5 font-black text-blue-600 text-center">S</th>
                    <th className="px-3 py-5 font-black text-rose-600 text-center">A</th>
                    <th className="px-6 py-5 font-black text-slate-700 text-center bg-slate-100/50">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center text-slate-300 font-bold italic">
                        <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        Data tidak ditemukan
                      </td>
                    </tr>
                  ) : (
                    reportData.map((target) => (
                      <tr key={target.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-bold text-slate-900 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">{target.name}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${activeType === 'student' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {(target as any).grade || (target as any).subject}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-center font-mono font-black text-emerald-600">{target.stats.H}</td>
                        <td className="px-3 py-4 text-center font-mono font-black text-amber-600">{target.stats.I}</td>
                        <td className="px-3 py-4 text-center font-mono font-black text-blue-600">{target.stats.S}</td>
                        <td className="px-3 py-4 text-center font-mono font-black text-rose-600">{target.stats.A}</td>
                        <td className="px-6 py-4 text-center font-mono font-black text-slate-900 bg-slate-50/50">{target.total}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="detailed-table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            {/* Table Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
               <h3 className="text-lg font-bold text-slate-800">Tabel Laporan Absensi</h3>
               <div className="flex items-center gap-3">
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition font-bold text-sm"
                  >
                    <Printer className="w-4 h-4" />
                    Cetak
                  </button>
                  <button 
                    onClick={exportToExcel}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition font-bold text-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export
                  </button>
               </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden print:shadow-none print:border-none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                         <button onClick={() => handleSort('date')} className="flex items-center gap-2 hover:text-slate-800 transition">
                            TANGGAL
                            <ArrowUpDown className="w-3 h-3" />
                         </button>
                      </th>
                      <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                         <button onClick={() => handleSort('targetName')} className="flex items-center gap-2 hover:text-slate-800 transition">
                            NAMA SISWA
                            <ArrowUpDown className="w-3 h-3" />
                         </button>
                      </th>
                      <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                         <button onClick={() => handleSort('targetGrade')} className="flex items-center gap-2 hover:text-slate-800 transition text-nowrap">
                            KELAS
                            <ArrowUpDown className="w-3 h-3" />
                         </button>
                      </th>
                      <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                         <button onClick={() => handleSort('status')} className="flex items-center gap-2 hover:text-slate-800 transition">
                            STATUS
                            <ArrowUpDown className="w-3 h-3" />
                         </button>
                      </th>
                      <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                         <button onClick={() => handleSort('materi')} className="flex items-center gap-2 hover:text-slate-800 transition">
                            MATERI
                            <ArrowUpDown className="w-3 h-3" />
                         </button>
                      </th>
                      <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                         <button onClick={() => handleSort('markedByName')} className="flex items-center gap-2 hover:text-slate-800 transition">
                            GURU
                            <ArrowUpDown className="w-3 h-3" />
                         </button>
                      </th>
                      <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-wider text-[11px] text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-medium">
                          Tidak ada data absensi ditemukan pada filter ini.
                        </td>
                      </tr>
                    ) : (
                      detailedRecords.map((r) => (
                        <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition group">
                          <td className="px-6 py-4 font-semibold text-slate-600 whitespace-nowrap">
                            {format(parseISO(r.date), 'dd/MM/yyyy')}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">{r.targetName}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-500 uppercase">
                              {r.targetGrade}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase ${statusMap[r.status as AttendanceStatus].bg} bg-opacity-10 ${statusMap[r.status as AttendanceStatus].color} border ${statusMap[r.status as AttendanceStatus].border}`}>
                              {statusMap[r.status as AttendanceStatus].label}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-500 line-clamp-1 italic">{r.materi}</span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-500">{r.markedByName}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Detail">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Edit">
                                <Pencil className="w-4 h-4" />
                              </button>
                              {isAdmin && (
                                <button 
                                  onClick={() => { if(confirm('Hapus record ini?')) onDeleteRecord(r.id); }}
                                  className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
