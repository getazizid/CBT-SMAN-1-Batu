import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileCode,
  FileText,
  HelpCircle,
  Sparkles,
  Upload,
  X
} from 'lucide-react';
import { OptionScoreMap, Question } from '../../types';
import {
  downloadTemplateFile,
  parseQuestionsFromText,
  readDocxFile
} from '../../utils/wordParser';

interface WordImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportQuestions: (questions: Question[]) => void;
  defaultScores: OptionScoreMap;
  currentQuestionCount: number;
}

export const WordImportModal: React.FC<WordImportModalProps> = ({
  isOpen,
  onClose,
  onImportQuestions,
  defaultScores,
  currentQuestionCount,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parsedPreview, setParsedPreview] = useState<Question[]>([]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setIsProcessing(true);
    setParseErrors([]);

    try {
      let rawText = '';
      if (file.name.endsWith('.docx')) {
        rawText = await readDocxFile(file);
      } else {
        rawText = await file.text();
      }

      setPastedText(rawText);
      const result = parseQuestionsFromText(rawText, defaultScores);
      setParsedPreview(result.questions);
      setParseErrors(result.errors);
    } catch (err: any) {
      setParseErrors([err.message || 'Gagal membaca file docx.']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleParseText = () => {
    if (!pastedText.trim()) return;
    setIsProcessing(true);
    const result = parseQuestionsFromText(pastedText, defaultScores);
    setParsedPreview(result.questions);
    setParseErrors(result.errors);
    setIsProcessing(false);
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) return;
    onImportQuestions(parsedPreview);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200/90 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Import Soal dari Microsoft Word (.docx) & Teks
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Otomatis mengenali pertanyaan, opsi A-E, serta bobot nilai bertingkat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Template Download Banner */}
        <div className="px-6 pt-4 bg-slate-50/50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t border-x border-slate-200 dark:border-slate-700 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Upload File .docx / .txt
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t border-x border-slate-200 dark:border-slate-700 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Salin & Tempel (Paste Text)
            </button>
          </div>

          <button
            onClick={downloadTemplateFile}
            className="mb-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Download Format Template Word/Teks</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all text-center group">
                <Upload className="w-10 h-10 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all mb-3" />
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {selectedFileName ? selectedFileName : 'Pilih atau Drag & Drop File Word (.docx)'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Mendukung file dokumen Microsoft Word (.docx) atau teks (.txt) hingga 50 soal
                </span>
                <input
                  type="file"
                  accept=".docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Tempel Teks Soal dari Word:</span>
                <button
                  onClick={handleParseText}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Proses & Urai Soal</span>
                </button>
              </div>
              <textarea
                rows={8}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Tempelkan soal di sini... Contoh:
1. Apa arti integritas?
A. Kejujuran
B. Kebohongan
C. Keraguan
D. Ketakutan
E. Kelemahan
BOBOT: A=10, B=5, C=4, D=3, E=2"
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl p-3.5 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          )}

          {/* Formatting Rules Reminder */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Format Pengaturan Bobot Nilai Per Opsi:</span>
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Sertakan baris <code className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-mono font-semibold">BOBOT: A=10, B=5, C=4, D=3, E=2</code> di bawah opsi soal, atau sistem akan otomatis menggunakan preset bobot bawaan ({`A:${defaultScores.A}, B:${defaultScores.B}, C:${defaultScores.C}, D:${defaultScores.D}, E:${defaultScores.E}`}).
            </p>
          </div>

          {/* Parse Errors if any */}
          {parseErrors.length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-900 dark:text-amber-300 text-xs space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Catatan Hasil Parsing:</span>
              </p>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                {parseErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Live Parsed Preview List */}
          {parsedPreview.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    Pratinjau Hasil Parsing ({parsedPreview.length} Soal Berhasil Dikenali)
                  </span>
                </h4>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {parsedPreview.map((q, idx) => (
                  <div key={q.id || idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white mb-1.5">
                      {idx + 1}. {q.text}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 dark:text-slate-300 mb-2">
                      {q.options.map((opt) => (
                        <div key={opt.key} className="truncate">
                          <strong className="text-slate-800 dark:text-slate-200">{opt.key}.</strong> {opt.text}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <span className="font-medium text-slate-500 dark:text-slate-400">Bobot Opsi:</span>
                      {Object.entries(q.optionScores).map(([k, val]) => (
                        <span
                          key={k}
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded font-mono font-semibold text-blue-700 dark:text-blue-300"
                        >
                          {k} = {val}p
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            Batal
          </button>

          <button
            disabled={parsedPreview.length === 0}
            onClick={handleConfirmImport}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              parsedPreview.length > 0
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md cursor-pointer'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Terapkan {parsedPreview.length} Soal ke Ujian</span>
          </button>
        </div>
      </div>
    </div>
  );
};
