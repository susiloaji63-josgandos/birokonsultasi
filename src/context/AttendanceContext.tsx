import React, { createContext, useContext } from 'react';
import { useAttendance, Student, Teacher, AttendanceRecord, TeachingJournal, AttendanceStatus } from '../hooks/useAttendance';

interface AttendanceContextType {
  students: Student[];
  teachers: Teacher[];
  records: AttendanceRecord[];
  journals: TeachingJournal[];
  addStudent: (name: string, grade: string, learningObstacle?: string, addedBy?: string) => Student;
  addStudentsBulk: (data: { name: string; grade: string }[]) => void;
  deleteStudent: (id: string) => void;
  addTeacher: (name: string, subject: string) => Teacher;
  addTeachersBulk: (data: { name: string; subject: string }[]) => void;
  deleteTeacher: (id: string) => void;
  addJournal: (journalData: Omit<TeachingJournal, 'id' | 'timestamp' | 'status'>) => void;
  updateJournalStatus: (id: string, status: 'approved' | 'rejected') => void;
  deleteJournal: (id: string) => void;
  logAttendance: (targetId: string, userId: string, userName: string, type: 'student' | 'teacher', status?: AttendanceStatus, notes?: string) => { success: boolean; message: string };
  logAttendanceBulk: (data: { targetId: string; status: AttendanceStatus; notes?: string }[], userId: string, userName: string, type: 'student' | 'teacher') => { success: boolean; message: string };
  removeAttendance: (targetId: string, type: 'student' | 'teacher') => void;
  deleteRecord: (id: string) => void;
  updateRecord: (id: string, updates: Partial<AttendanceRecord>) => { success: boolean; message: string };
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const attendance = useAttendance();

  return (
    <AttendanceContext.Provider value={attendance}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendanceContext() {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendanceContext must be used within an AttendanceProvider');
  }
  return context;
}
