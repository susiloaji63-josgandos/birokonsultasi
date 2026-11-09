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
  mapelBiro?: string; // Mapel Biro selected e.g. BIG 789, IPA 78, etc.
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export const DEFAULT_TEACHERS: Teacher[] = [
  { id: 't-sarah', name: 'Sarah Amelia, S.Pd.', subject: 'BIG 789', createdAt: 1700000000000 },
  { id: 't-widya', name: 'Widya, S.Pd.', subject: 'IPA 78', createdAt: 1700000000000 },
  { id: 't-joko', name: 'Joko Susanto, S.Pd.', subject: 'IPA 9', createdAt: 1700000000000 },
  { id: 't-mega', name: 'Mega Rahmawati, S.Pd.', subject: 'MTK 89', createdAt: 1700000000000 },
  { id: 't-rini', name: 'Rini Astuti, M.Pd.', subject: 'MTK 9', createdAt: 1700000000000 },
  { id: 't-charir', name: 'Charir Maulana, S.Pd.', subject: 'BIN 789', createdAt: 1700000000000 },
  { id: 't-angga', name: 'Pak Angga', subject: 'BIG', createdAt: 1700000000000 },
];

export const DEFAULT_STUDENTS: Student[] = [
  { id: 's-1', name: 'FILZA FAYRE FABIANTO', grade: '8E', createdAt: 1700000000000 },
  { id: 's-2', name: 'ELANG PRATAMA PUTRA SANTOSO', grade: '8D', createdAt: 1700000000000 },
  { id: 's-3', name: 'IZZ MURSYID AL GHIFARI', grade: '8C', createdAt: 1700000000000 },
  { id: 's-4', name: 'ABDILLAH HAMIZAN ALWI', grade: '7A', createdAt: 1700000000000 },
  { id: 's-5', name: 'ACHMAD NARENDRA ADITYA PUTRA', grade: '7A', createdAt: 1700000000000 },
  { id: 's-6', name: 'ADAM ADNAN NABAWI', grade: '7A', createdAt: 1700000000000 },
  { id: 's-7', name: 'ALDRICH TEGAR DEWANGGA', grade: '7A', createdAt: 1700000000000 },
  { id: 's-8', name: 'ALLAN FAHREZA BAHTIAR', grade: '7A', createdAt: 1700000000000 },
  { id: 's-9', name: 'ARSHAKA ASYIQAH WAHYU VERENDRA', grade: '7B', createdAt: 1700000000000 },
  { id: 's-10', name: 'BAYU ISA PUTRA PRASETYA', grade: '7B', createdAt: 1700000000000 },
  { id: 's-11', name: 'CHAESAR DIMAS ANGGA PRADITYA KURNIAWAN', grade: '8A', createdAt: 1700000000000 },
  { id: 's-12', name: 'DAFFA ARRIFAT PUTRA LAKSONO', grade: '9A', createdAt: 1700000000000 },
  { id: 's-13', name: 'EGA RADITYA PRATAMA', grade: '9B', createdAt: 1700000000000 },
  { id: 's-14', name: 'FAHRI SYARIFUDDIN ATHAR', grade: '9C', createdAt: 1700000000000 },
];

export function useAttendance() {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('hadirin_students');
    if (!saved) return DEFAULT_STUDENTS;
    try {
      const parsed: Student[] = JSON.parse(saved);
      if (parsed.length === 0) return DEFAULT_STUDENTS;
      return parsed;
    } catch {
      return DEFAULT_STUDENTS;
    }
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('hadirin_teachers');
    if (!saved) return DEFAULT_TEACHERS;
    try {
      const parsed: Teacher[] = JSON.parse(saved);
      const merged = [...parsed];
      DEFAULT_TEACHERS.forEach(def => {
        if (!merged.some(m => m.id === def.id || m.name.toLowerCase() === def.name.toLowerCase())) {
          merged.push(def);
        }
      });
      return merged;
    } catch {
      return DEFAULT_TEACHERS;
    }
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
