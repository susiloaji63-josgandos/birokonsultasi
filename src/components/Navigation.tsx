import { 
  ClipboardCheck, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  CalendarDays, 
  BookOpen, 
  BookText,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '../context/AuthContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: UserRole;
}

export default function Navigation({ activeTab, onTabChange, role }: NavigationProps) {
  const isAdmin = role === 'admin';
  const isGuruBiro = role === 'guru_biro';
  
  const allTabs = [
    { id: 'scan', label: 'Dashboard', icon: ClipboardCheck, show: role !== 'admin' },
    { id: 'jurnal', label: 'Jurnal', icon: BookText, show: false },
    { id: 'calendar', label: 'Kalender', icon: CalendarDays, show: false },
    { id: 'report', label: 'Laporan', icon: BarChart3, show: false },
    { id: 'students', label: 'Daftar Murid', icon: Users, show: false },
  ];

  const visibleTabs = allTabs.filter(t => t.show);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-slate-200 pb-safe">
      <div className={`max-w-screen-xl mx-auto grid h-20`} style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }}>
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center gap-1 relative overflow-hidden group"
            >
              <div className={`
                p-2 rounded-2xl transition-all duration-300
                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 group-hover:text-slate-600'}
              `}>
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100 group-active:scale-95'}`} />
              </div>
              <span className={`text-[8px] font-black tracking-widest uppercase text-center px-1 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
