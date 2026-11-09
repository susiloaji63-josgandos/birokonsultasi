/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useAttendance } from './hooks/useAttendance';
import LoginPage from './components/LoginPage';
import ChangePasswordPage from './components/ChangePasswordPage';
import ManualAttendance from './components/ManualAttendance';
import StudentManager from './components/StudentManager';
import AttendanceReport from './components/AttendanceReport';
import CalendarView from './components/CalendarView';
import TeachingJournalView from './components/TeachingJournal';
import AdminReports from './components/AdminReports';
import UserManager from './components/UserManager';
import ApprovalManager from './components/ApprovalManager';
import Navigation from './components/Navigation';
import GuruUmumDashboard from './components/GuruUmumDashboard';
import { AttendanceProvider, useAttendanceContext } from './context/AttendanceContext';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, LogOut, ShieldCheck, User as UserIcon, Briefcase, Users, Monitor } from 'lucide-react';

function AppContent() {
  const { user, logout, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isGuruMapel = user?.role === 'guru_umum';
  const [activeTab, setActiveTab] = useState(isAdmin ? 'analysis' : 'scan');
  
  const { 
    students, 
    teachers, 
    records, 
    journals,
    addStudent, 
    addStudentsBulk, 
    deleteStudent,
    updateJournalStatus,
    deleteJournal,
    logAttendance, 
    removeAttendance,
    deleteRecord
  } = useAttendanceContext();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (user?.needsPasswordChange) {
    return <ChangePasswordPage />;
  }

  const teacherProfile = teachers.find(t => t.id === user?.teacherId);

  const getRoleIcon = () => {
    switch(user?.role) {
      case 'admin': return <ShieldCheck className="w-4 h-4" />;
      case 'guru_biro': return <Briefcase className="w-4 h-4" />;
      case 'guru_umum': return <Users className="w-4 h-4" />;
      default: return <UserIcon className="w-4 h-4" />;
    }
  };

  const getRoleColor = () => {
    switch(user?.role) {
      case 'admin': return 'bg-indigo-600';
      case 'guru_biro': return 'bg-emerald-600';
      case 'guru_umum': return 'bg-blue-600';
      default: return 'bg-slate-400';
    }
  };

  const renderContent = () => {
    const isGuruBiro = user?.role === 'guru_biro';

    switch (activeTab) {
      case 'scan':
        if (isAdmin) return <AccessDenied />;
        if (isGuruMapel) return <GuruUmumDashboard />;
        return (
          <ManualAttendance 
            students={students} 
            teachers={teachers}
            records={records} 
            journals={journals}
            onLog={logAttendance} 
            onRemove={removeAttendance} 
          />
        );
      case 'jurnal':
        if (isAdmin) return <AccessDenied />;
        return <TeachingJournalView />;
      case 'calendar':
        if (isAdmin) return <AccessDenied />;
        return <CalendarView students={students} teachers={teachers} records={records} />;
      case 'report':
        if (!isAdmin && !isGuruBiro && !isGuruMapel) return <AccessDenied />;
        return <AttendanceReport students={students} teachers={teachers} records={records} journals={journals} onDeleteRecord={deleteRecord} />;
      case 'analysis':
        if (!isAdmin) return <AccessDenied />;
        return (
          <AdminReports 
            students={students} 
            teachers={teachers} 
            records={records} 
            journals={journals} 
            onDeleteRecord={deleteRecord}
          />
        );
      case 'approval':
        if (!isAdmin) return <AccessDenied />;
        return (
          <ApprovalManager 
            journals={journals} 
            onUpdateStatus={updateJournalStatus} 
            onDeleteJournal={deleteJournal}
          />
        );
      case 'students':
        if (!isAdmin && !isGuruBiro && !isGuruMapel) return <AccessDenied />;
        return (
          <StudentManager 
            students={students} 
            onAdd={addStudent} 
            onAddBulk={addStudentsBulk}
            onDelete={deleteStudent} 
          />
        );

      case 'users':
        if (!isAdmin) return <AccessDenied />;
        return <UserManager />;
      default:
        return null;
    }
  };

  if (isGuruMapel) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 pb-24">
        {/* Guru Mapel Specific Header */}
        <header className="bg-[#043427] border-b border-emerald-900/30 sticky top-0 z-40">
          <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                <Monitor className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-white font-black text-xl leading-none">Portal Guru Umum</h1>
                <p className="text-emerald-500/60 text-[10px] font-bold uppercase tracking-widest mt-1">SMP Muhammadiyah 2 Surabaya</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-white font-black text-sm leading-none">{user?.name}</p>
                <p className="text-emerald-500 font-bold text-[10px] uppercase tracking-wider mt-1">{teacherProfile?.subject || 'Bahasa Inggris'}</p>
              </div>
              <button 
                onClick={logout}
                className="bg-[#EF4444] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition flex items-center gap-2 shadow-lg shadow-rose-900/20"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} role={user?.role || 'guru_umum'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-24">
      {/* Header */}
      <header className={`sticky top-0 z-30 border-b ${isAdmin ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white/80 backdrop-blur-md border-slate-200'}`}>
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isAdmin ? 'bg-slate-800' : 'bg-indigo-600 shadow-indigo-100'}`}>
              <GraduationCap className={`w-6 h-6 ${isAdmin ? 'text-indigo-400' : 'text-white'}`} />
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-xl font-black tracking-tight uppercase leading-none ${isAdmin ? 'text-white' : 'text-slate-900'}`}>
                {user?.role === 'admin' ? 'Dashboard Admin' : 
                 user?.role === 'guru_biro' ? 'Dashboard Guru Biro' : 
                 'Dashboard Guru Mapel'}
              </h1>
              <p className={`text-[7px] font-bold tracking-widest uppercase mt-0.5 ${isAdmin ? 'text-slate-500' : 'text-slate-400'}`}>BIRO KONSULTASI MATA PELAJARAN</p>
            </div>
          </div>

          {/* Admin Navigation Toggles */}
          {isAdmin && (
            <div className="hidden md:flex items-center bg-slate-800/50 p-1 rounded-2xl border border-slate-700/50">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'analysis' 
                    ? 'bg-slate-700 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Laporan Absensi
              </button>
              <button
                onClick={() => setActiveTab('approval')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'approval' 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Menu Persetujuan
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'users' 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Manajemen Akses
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'students' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Manajemen Siswa
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-3 py-1.5 pl-1.5 pr-4 rounded-full border ${isAdmin ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getRoleColor()}`}>
                {getRoleIcon()}
              </div>
              <div className="flex flex-col overflow-hidden max-w-[120px]">
                <span className={`text-[10px] font-black leading-none uppercase truncate ${isAdmin ? 'text-white' : 'text-slate-900'}`}>{user?.name}</span>
                <span className={`text-[7px] font-bold uppercase tracking-tighter mt-0.5 ${isAdmin ? 'text-slate-500' : 'text-slate-400'}`}>
                  {user?.role === 'guru_umum' ? 'GURU MAPEL' : user?.role.replace('_', ' ')}
                </span>
              </div>
            </div>
            <button 
              onClick={logout}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition font-bold text-xs ${
                isAdmin 
                  ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-400/10' 
                  : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
              }`}
              title="Keluar"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`mx-auto ${isAdmin ? 'max-w-[1400px]' : 'max-w-5xl'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isAdmin && <Navigation activeTab={activeTab} onTabChange={setActiveTab} role={user?.role || 'guru_umum'} />}
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-6 border border-rose-100">
        <ShieldCheck className="w-10 h-10 text-rose-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Akses Terbatas</h2>
      <p className="text-slate-500 max-w-xs leading-relaxed">
        Halaman ini tidak tersedia untuk tingkat akses Anda.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AttendanceProvider>
        <AppContent />
      </AttendanceProvider>
    </AuthProvider>
  );
}
