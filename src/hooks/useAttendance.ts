import { useState, useEffect } from 'react';

export interface Student {
  id: string;
  name: string;
  grade: string;
  createdAt: number;
  learningObstacle?: string;
  addedBy?: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string; // Mata Pelajaran
  createdAt: number;
}

export type AttendanceStatus = 'H' | 'I' | 'S' | 'A'; // Hadir, Izin, Sakit, Alpa

export interface AttendanceRecord {
  id: string;
  targetId: string; // studentId or teacherId
  type: 'student' | 'teacher';
  status: AttendanceStatus;
  notes?: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  markedBy: string; // User ID who marked this
  markedByName: string; // Cache name for easier filtering
}

export interface TeachingJournal {
  id: string;
  teacherId: string;
  teacherName: string;
  studentName?: string;
  date: string;
  grade: string;
  subject: string;
  topic: string;
  notes: string;
  treatment?: string;
  bureauTeacherId?: string; // ID of the Guru Biro selected by Guru Umum
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export function useAttendance() {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('hadirin_students');
    return saved ? JSON.parse(saved) : [];
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('hadirin_teachers');
    return saved ? JSON.parse(saved) : [];
  });

  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('hadirin_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [journals, setJournals] = useState<TeachingJournal[]>(() => {
    const saved = localStorage.getItem('hadirin_journals');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('hadirin_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('hadirin_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('hadirin_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('hadirin_journals', JSON.stringify(journals));
  }, [journals]);

  // Student Actions
  const addStudent = (name: string, grade: string, learningObstacle?: string, addedBy?: string) => {
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name,
      grade,
      createdAt: Date.now(),
      learningObstacle,
      addedBy
    };
    setStudents((prev) => [...prev, newStudent]);
    return newStudent;
  };

  const addStudentsBulk = (data: { name: string; grade: string }[]) => {
    const newStudents: Student[] = data.map(item => ({
      id: crypto.randomUUID(),
      name: item.name,
      grade: item.grade,
      createdAt: Date.now(),
    }));
    setStudents((prev) => [...prev, ...newStudents]);
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setRecords((prev) => prev.filter((r) => !(r.targetId === id && r.type === 'student')));
  };

  // Teacher Actions
  const addTeacher = (name: string, subject: string) => {
    const newTeacher: Teacher = {
      id: crypto.randomUUID(),
      name,
      subject,
      createdAt: Date.now(),
    };
    setTeachers((prev) => [...prev, newTeacher]);
    return newTeacher;
  };

  const addTeachersBulk = (data: { name: string; subject: string }[]) => {
    const newTeachers: Teacher[] = data.map(item => ({
      id: crypto.randomUUID(),
      name: item.name,
      subject: item.subject,
      createdAt: Date.now(),
    }));
    setTeachers((prev) => [...prev, ...newTeachers]);
  };

  const deleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    setRecords((prev) => prev.filter((r) => !(r.targetId === id && r.type === 'teacher')));
  };

  // Journal Actions
  const addJournal = (journalData: Omit<TeachingJournal, 'id' | 'timestamp' | 'status'>) => {
    const newJournal: TeachingJournal = {
      ...journalData,
      id: crypto.randomUUID(),
      status: 'pending',
      timestamp: Date.now()
    };
    setJournals(prev => [newJournal, ...prev]);
  };

  const updateJournalStatus = (id: string, status: 'approved' | 'rejected') => {
    setJournals(prev => prev.map(j => j.id === id ? { ...j, status } : j));
  };

  const deleteJournal = (id: string) => {
    setJournals(prev => prev.filter(j => j.id !== id));
  };

  // Common Attendance Actions
  const logAttendance = (targetId: string, userId: string, userName: string, type: 'student' | 'teacher', status: AttendanceStatus = 'H', notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    const newRecord: AttendanceRecord = {
      id: crypto.randomUUID(),
      targetId,
      type,
      status,
      notes,
      timestamp: Date.now(),
      date: today,
      markedBy: userId,
      markedByName: userName,
    };

    setRecords((prev) => {
      const filtered = prev.filter(r => !(r.targetId === targetId && r.type === type && r.date === today));
      return [...filtered, newRecord];
    });

    return { success: true, message: `Berhasil mencatat!` };
  };

  const logAttendanceBulk = (data: { targetId: string; status: AttendanceStatus; notes?: string }[], userId: string, userName: string, type: 'student' | 'teacher') => {
    const today = new Date().toISOString().split('T')[0];
    const targetIds = data.map(d => d.targetId);

    const newRecords: AttendanceRecord[] = data.map(d => ({
      id: crypto.randomUUID(),
      targetId: d.targetId,
      type,
      status: d.status,
      notes: d.notes,
      timestamp: Date.now(),
      date: today,
      markedBy: userId,
      markedByName: userName,
    }));

    setRecords((prev) => {
      const filtered = prev.filter(r => !(targetIds.includes(r.targetId) && r.type === type && r.date === today));
      return [...filtered, ...newRecords];
    });

    return { success: true, message: `Berhasil menyimpan ${data.length} data!` };
  };

  const removeAttendance = (targetId: string, type: 'student' | 'teacher') => {
    const today = new Date().toISOString().split('T')[0];
    setRecords((prev) => prev.filter(r => !(r.targetId === targetId && r.type === type && r.date === today)));
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRecord = (id: string, updates: Partial<AttendanceRecord>) => {
    setRecords((prev) => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    return { success: true, message: 'Data berhasil diperbarui!' };
  };

  return {
    students,
    teachers,
    records,
    journals,
    addStudent,
    addStudentsBulk,
    deleteStudent,
    addTeacher,
    addTeachersBulk,
    deleteTeacher,
    addJournal,
    updateJournalStatus,
    deleteJournal,
    logAttendance,
    logAttendanceBulk,
    removeAttendance,
    deleteRecord,
    updateRecord,
  };
}
