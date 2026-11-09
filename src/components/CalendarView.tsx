import { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek,
  isToday,
  isSameMonth
} from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, Users, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Teacher, AttendanceRecord, AttendanceStatus } from '../hooks/useAttendance';

interface CalendarViewProps {
  students: Student[];
  teachers: Teacher[];
  records: AttendanceRecord[];
}

export default function CalendarView({ students, teachers, records }: CalendarViewProps) {
  const [activeType, setActiveType] = useState<'student' | 'teacher'>('student');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getDayRecords = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return records.filter(r => r.date === dateStr && r.type === activeType);
  };

  const selectedDayRecords = useMemo(() => {
    if (!selectedDay) return [];
    return getDayRecords(selectedDay);
  }, [selectedDay, records, activeType]);

  const stats = useMemo(() => {
    const dayRecords = selectedDay ? getDayRecords(selectedDay) : [];
    const total = activeType === 'student' ? students.length : teachers.length;
    return {
      H: dayRecords.filter(r => r.status === 'H').length,
      I: dayRecords.filter(r => r.status === 'I').length,
      S: dayRecords.filter(r => r.status === 'S').length,
      A: dayRecords.filter(r => r.status === 'A').length,
      present: dayRecords.filter(r => r.status === 'H').length,
      absent: total - dayRecords.filter(r => r.status === 'H').length,
      percentage: total > 0 ? Math.round((dayRecords.filter(r => r.status === 'H').length / total) * 100) : 0
    };
  }, [selectedDay, students, teachers, records, activeType]);

  const statusMap: Record<AttendanceStatus, { label: string; color: string; bg: string }> = {
    'H': { label: 'Hadir', color: 'text-emerald-600', bg: 'bg-emerald-500' },
    'I': { label: 'Izin', color: 'text-amber-600', bg: 'bg-amber-500' },
    'S': { label: 'Sakit', color: 'text-blue-600', bg: 'bg-blue-500' },
    'A': { label: 'Alpa', color: 'text-rose-600', bg: 'bg-rose-500' },
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            Kalender Presensi
          </h2>
          <p className="text-slate-500 text-sm font-medium">Monitoring kehadiran visual</p>
        </div>

        <div className="flex p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm w-fit">
          <button
            onClick={() => setActiveType('student')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeType === 'student' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <Users className="w-4 h-4" />
            Siswa
          </button>
          <button
            onClick={() => setActiveType('teacher')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeType === 'teacher' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <BookOpen className="w-4 h-4" />
            Guru
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-7 gap-6">
        {/* Calendar Core */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: id })}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-slate-50 rounded-xl transition text-slate-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-slate-50 rounded-xl transition text-slate-400"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'].map(day => (
              <div key={day} className="text-center text-[10px] font-black text-slate-300 uppercase py-2 tracking-widest">
                {day}
              </div>
            ))}
            {calendarDays.map((day, idx) => {
              const dayRecords = getDayRecords(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const hasData = dayRecords.length > 0;
              const total = activeType === 'student' ? students.length : teachers.length;
              const attendanceRate = total > 0 ? dayRecords.filter(r => r.status === 'H').length / total : 0;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={`
                    relative aspect-square flex flex-col items-center justify-center rounded-2xl transition-all duration-300 group
                    ${!isCurrentMonth ? 'opacity-20' : 'opacity-100'}
                    ${isSelected ? 'bg-slate-900 text-white shadow-xl scale-105 z-10' : 'hover:bg-slate-50 text-slate-600'}
                  `}
                >
                  <span className="text-sm font-bold">{format(day, 'd')}</span>
                  
                  {hasData && !isSelected && (
                    <div className="absolute bottom-2 flex gap-0.5">
                      <div 
                        className={`h-1 rounded-full transition-all ${attendanceRate > 0.8 ? 'w-3 bg-emerald-500' : attendanceRate > 0.5 ? 'w-2 bg-amber-500' : 'w-1 bg-rose-500'}`} 
                      />
                    </div>
                  )}

                  {isToday(day) && !isSelected && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeType}-${selectedDay?.toString()}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col gap-6"
            >
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Detail {activeType === 'student' ? 'Siswa' : 'Guru'}
                </h4>
                <p className="text-lg font-black text-slate-900">
                  {selectedDay ? format(selectedDay, 'EEEE, d MMMM', { locale: id }) : 'Pilih Tanggal'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tight mb-1">Hadir</p>
                  <p className="text-2xl font-black text-emerald-700 tabular-nums">{stats.H}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-tight mb-1">Izin</p>
                  <p className="text-2xl font-black text-amber-700 tabular-nums">{stats.I}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-tight mb-1">Sakit</p>
                  <p className="text-2xl font-black text-blue-700 tabular-nums">{stats.S}</p>
                </div>
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-tight mb-1">Alpa</p>
                  <p className="text-2xl font-black text-rose-700 tabular-nums">{stats.A}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Persentase Hadir</span>
                  <span className="text-xs font-black text-indigo-600">{stats.percentage}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.percentage}%` }}
                    className={`h-full ${activeType === 'student' ? 'bg-indigo-600' : 'bg-emerald-600'}`}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Daftar Status</h5>
                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedDayRecords.length === 0 ? (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <Info className="w-4 h-4 text-slate-300" />
                      <span className="text-xs font-medium text-slate-400 italic">Tidak ada data presensi</span>
                    </div>
                  ) : (
                    selectedDayRecords.map((record) => {
                      const target = activeType === 'student' 
                        ? students.find(s => s.id === record.targetId)
                        : teachers.find(t => t.id === record.targetId);
                      
                      return (
                        <div key={record.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${activeType === 'student' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {target?.name.charAt(0)}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-xs font-bold text-slate-800 truncate">{target?.name}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                {activeType === 'student' ? 'Kelas' : ''} {(target as any)?.grade || (target as any)?.subject}
                              </span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${statusMap[record.status as AttendanceStatus].bg} text-white`}>
                            {record.status}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
