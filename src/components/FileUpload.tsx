import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { Upload, FileType, AlertCircle, CheckCircle2, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploadProps {
  type: 'student' | 'teacher';
  onImported: (data: any[]) => void;
}

export default function FileUpload({ type, onImported }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setIsUploading(true);
    setStatus(null);

    try {
      const fileName = file.name.toLowerCase();
      let importedData: any[] = [];

      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet) as any[];
        
        importedData = jsonData.map(row => {
          if (type === 'student') {
            return {
              name: String(row.Nama || row.nama || row.Name || row.name || Object.values(row)[0] || '').trim(),
              grade: String(row.Kelas || row.kelas || row.Grade || row.grade || Object.values(row)[1] || '-').trim()
            };
          } else {
            return {
              name: String(row.Nama || row.nama || row.Name || row.name || Object.values(row)[0] || '').trim(),
              subject: String(row.Mapel || row.mapel || row.Subject || row.subject || Object.values(row)[1] || '-').trim()
            };
          }
        }).filter(s => s.name);

      } else if (fileName.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        
        importedData = text.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => {
            const parts = line.split(/[,;|]/);
            if (type === 'student') {
              return {
                name: parts[0]?.trim() || '',
                grade: parts[1]?.trim() || '-'
              };
            } else {
              return {
                name: parts[0]?.trim() || '',
                subject: parts[1]?.trim() || '-'
              };
            }
          })
          .filter(s => s.name);

      } else if (fileName.endsWith('.pdf')) {
        throw new Error('Ekstraksi PDF secara otomatis terbatas. Gunakan format Excel atau Word untuk akurasi terbaik.');
      } else {
        throw new Error('Format file tidak didukung. Gunakan Excel (.xlsx) atau Word (.docx).');
      }

      if (importedData.length === 0) {
        throw new Error(`Tidak ada data ${type === 'student' ? 'siswa' : 'guru'} yang ditemukan.`);
      }

      onImported(importedData);
      setStatus({ 
        type: 'success', 
        message: `Berhasil mengimpor ${importedData.length} ${type === 'student' ? 'siswa' : 'guru'}.` 
      });
      
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Gagal memproses file.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const downloadTemplate = () => {
    const headers = type === 'student' ? ['Nama', 'Kelas'] : ['Nama', 'Mapel'];
    const sampleData = type === 'student' 
      ? [{ Nama: 'Budi Santoso', Kelas: '9A' }, { Nama: 'Siti Aminah', Kelas: '8B' }]
      : [{ Nama: 'Ahmad Fauzi', Mapel: 'Matematika' }, { Nama: 'Dewi Sartika', Mapel: 'Bahasa Inggris' }];
    
    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    
    XLSX.writeFile(workbook, `template_impor_${type === 'student' ? 'siswa' : 'guru'}.xlsx`);
  };

  const label = type === 'student' ? 'Siswa' : 'Guru Mapel';
  const secondField = type === 'student' ? 'Kelas' : 'Mata Pelajaran';

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Upload className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Impor Massal {label}</h3>
            <p className="text-xs text-slate-500 font-medium">Unggah file daftar {label.toLowerCase()} sekaligus</p>
          </div>
        </div>

        <button
          onClick={downloadTemplate}
          className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-2"
        >
          <FileType className="w-4 h-4" />
          UNDUH TEMPLATE
        </button>
      </div>

      <label className="relative group cursor-pointer">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".xlsx,.xls,.csv,.docx"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <div className={`
          border-2 border-dashed rounded-[24px] p-8 flex flex-col items-center justify-center gap-3 transition-all
          ${isUploading ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-200 group-hover:bg-indigo-50/50 group-hover:border-indigo-300'}
        `}>
          {isUploading ? (
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          ) : (
            <Upload className="w-10 h-10 text-slate-300 group-hover:text-indigo-400 transition-colors" />
          )}
          <div className="text-center">
            <p className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
              {isUploading ? 'Memproses File...' : 'Pilih File untuk Diunggah'}
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
              .xlsx, .docx (Max 5MB)
            </p>
          </div>
        </div>
      </label>

      <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0" />
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">Panduan Format</span>
          <p className="text-xs text-indigo-700 leading-relaxed">
            Excel: Kolom 1 <span className="font-bold">"Nama"</span>, Kolom 2 <span className="font-bold">"{type === 'student' ? 'Kelas' : 'Mapel'}"</span>.<br />
            Word: Satu {label.toLowerCase()} per baris (Nama, {secondField}).
          </p>
        </div>
      </div>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-2xl flex items-center gap-3 border ${
              status.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                : 'bg-rose-50 border-rose-100 text-rose-700'
            }`}
          >
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-bold">{status.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
