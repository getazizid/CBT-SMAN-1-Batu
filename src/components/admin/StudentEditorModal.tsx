import React, { useState, useEffect } from 'react';
import { X, User, Hash, Lock, GraduationCap, CheckCircle2 } from 'lucide-react';
import { RegisteredStudent } from '../../types';

interface StudentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: RegisteredStudent | null;
  onSaveStudent: (student: RegisteredStudent) => void;
}

const CLASS_OPTIONS = [
  'X-1', 'X-2', 'X-3', 'X-4', 'X-5', 'X-6', 'X-7', 'X-8',
  'XI MIPA 1', 'XI MIPA 2', 'XI MIPA 3', 'XI MIPA 4', 'XI IPS 1', 'XI IPS 2', 'XI IPS 3',
  'XII MIPA 1', 'XII MIPA 2', 'XII MIPA 3', 'XII MIPA 4', 'XII IPS 1', 'XII IPS 2', 'XII IPS 3'
];

export const StudentEditorModal: React.FC<StudentEditorModalProps> = ({
  isOpen,
  onClose,
  student,
  onSaveStudent,
}) => {
  const [nisn, setNisn] = useState('');
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('XII MIPA 1');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (student) {
      setNisn(student.nisn);
      setName(student.name);
      setStudentClass(student.studentClass || 'XII MIPA 1');
      setPassword(student.password || '');
      setGender(student.gender || 'L');
      setIsActive(student.isActive ?? true);
      setNotes(student.notes || '');
    } else {
      setNisn('');
      setName('');
      setStudentClass('XII MIPA 1');
      setPassword('');
      setGender('L');
      setIsActive(true);
      setNotes('');
    }
    setErrorMsg('');
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisn.trim()) {
      setErrorMsg('NISN / Nomor Peserta wajib diisi.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Nama Lengkap Siswa wajib diisi.');
      return;
    }

    const saved: RegisteredStudent = {
      id: student?.id || `std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nisn: nisn.trim(),
      name: name.trim(),
      studentClass,
      password: password.trim() || undefined,
      gender,
      isActive,
      notes: notes.trim(),
      createdAt: student?.createdAt || new Date().toISOString(),
    };

    onSaveStudent(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {student ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Peserta terverifikasi untuk login ujian CBT SMAN 1 Batu
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* NISN */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NISN / Username Siswa <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Contoh: 0061829101"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Password / PIN */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password / PIN Akun <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Bebas / PIN khusus"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Siswa <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Contoh: Muhammad Bintang Pratama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Class / Rombel */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelas / Rombel
              </label>
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              >
                {CLASS_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenis Kelamin
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Siswa <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Peserta Ujian Khusus / Sesi 1"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Is Active Status */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800">Status Akun Aktif</span>
                <p className="text-[11px] text-slate-500">
                  Hanya siswa berstatus aktif yang diizinkan masuk dan mengerjakan ujian.
                </p>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Data Siswa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
