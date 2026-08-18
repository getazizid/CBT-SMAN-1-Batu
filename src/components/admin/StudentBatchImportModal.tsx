import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { RegisteredStudent } from '../../types';

interface StudentBatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportStudents: (students: RegisteredStudent[]) => void;
}

export const StudentBatchImportModal: React.FC<StudentBatchImportModalProps> = ({
  isOpen,
  onClose,
  onImportStudents,
}) => {
  const [inputText, setInputText] = useState(
    `0061829110, Budi Santoso, XII MIPA 1, 110\n0061829111, Citra Lestari, XII MIPA 2, 111\n0061829112, Doni Setiawan, XII IPS 1, 112`
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [parsedPreview, setParsedPreview] = useState<RegisteredStudent[]>([]);

  if (!isOpen) return null;

  const handleParse = (textToParse: string) => {
    setErrorMsg('');
    const lines = textToParse
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsed: RegisteredStudent[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Format support: Tab-separated or Comma-separated or Semicolon
      const parts = line.includes('\t')
        ? line.split('\t')
        : line.includes(';')
        ? line.split(';')
        : line.split(',');

      const cleanParts = parts.map((p) => p.trim());
      if (cleanParts.length < 2) continue;

      const nisn = cleanParts[0];
      const name = cleanParts[1];
      const studentClass = cleanParts[2] || 'XII MIPA 1';
      const password = cleanParts[3] || undefined;

      if (nisn && name) {
        parsed.push({
          id: `std-batch-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
          nisn,
          name,
          studentClass,
          password,
          isActive: true,
          gender: 'L',
          createdAt: new Date().toISOString(),
        });
      }
    }

    setParsedPreview(parsed);
    return parsed;
  };

  const handleImport = () => {
    const students = handleParse(inputText);
    if (students.length === 0) {
      setErrorMsg('Tidak ada baris siswa yang valid. Pastikan format: NISN, Nama Siswa, Kelas');
      return;
    }

    onImportStudents(students);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Import Data Siswa Sekaligus (Batch)
              </h3>
              <p className="text-xs text-slate-500">
                Salin & tempel daftar siswa dari Excel / Spreadsheet / CSV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Guidelines Banner */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-1.5 text-slate-700">
            <p className="font-bold text-blue-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Petunjuk Format Import Cepat:</span>
            </p>
            <p className="text-[11px] leading-relaxed">
              Format per baris: <code className="bg-white px-1.5 py-0.5 rounded border font-mono">NISN, Nama Siswa, Kelas, Password (Opsional)</code>
            </p>
            <p className="text-[11px] text-slate-500">
              Anda juga bisa langsung menyalin beberapa kolom dari tabel Microsoft Excel (NISN | Nama Siswa | Kelas | Password) lalu tempelkan di bawah.
            </p>
          </div>

          {/* Textarea */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tempelkan Teks / Baris Siswa:
            </label>
            <textarea
              rows={7}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                handleParse(e.target.value);
              }}
              placeholder={`0061829110, Budi Santoso, XII MIPA 1, 110\n0061829111, Citra Lestari, XII MIPA 2, 111`}
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Quick Preview Table */}
          {parsedPreview.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">
                  Pratinjau Data ({parsedPreview.length} Siswa Terdeteksi):
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">NISN</th>
                      <th className="py-2 px-3">Nama Siswa</th>
                      <th className="py-2 px-3">Kelas</th>
                      <th className="py-2 px-3">Password / PIN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedPreview.slice(0, 10).map((p, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 px-3 font-mono font-bold text-slate-700">{p.nisn}</td>
                        <td className="py-1.5 px-3 font-medium text-slate-900">{p.name}</td>
                        <td className="py-1.5 px-3 text-slate-600">{p.studentClass}</td>
                        <td className="py-1.5 px-3 font-mono text-slate-500">{p.password || '-'}</td>
                      </tr>
                    ))}
                    {parsedPreview.length > 10 && (
                      <tr>
                        <td colSpan={4} className="py-1 px-3 text-center text-slate-400 italic">
                          ...dan {parsedPreview.length - 10} siswa lainnya
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Tambahkan {parsedPreview.length} Siswa ke Sistem</span>
          </button>
        </div>
      </div>
    </div>
  );
};
