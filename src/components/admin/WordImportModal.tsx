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
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Import Soal dari Microsoft Word (.docx) & Teks
              </h3>
              <p className="text-xs text-slate-500">
                Otomatis mengenali pertanyaan, opsi A-E, serta bobot nilai (A:10, B:5, C:4, D:3, E:2)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Template Download Banner */}
        <div className="px-6 pt-4 bg-slate-50/50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-600 border-t border-x border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upload File .docx / .txt
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-white text-blue-600 border-t border-x border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Salin & Tempel (Paste Text)
            </button>
          </div>

          <button
            onClick={downloadTemplateFile}
            className="mb-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Download Format Template Word/Teks</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all text-center group">
                <Upload className="w-10 h-10 text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all mb-3" />
                <span className="font-semibold text-sm text-slate-800">
                  {selectedFileName ? selectedFileName : 'Pilih atau Drag & Drop File Word (.docx)'}
                </span>
                <span className="text-xs text-slate-500 mt-1">
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
                <span className="font-semibold text-slate-700">Tempel Teks Soal dari Word:</span>
                <button
                  onClick={handleParseText}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          {/* Formatting Rules Reminder */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Format Pengaturan Bobot Nilai Per Opsi:</span>
            </p>
            <p className="text-[11px] text-slate-600">
              Sertakan baris <code className="bg-white border border-slate-200 text-blue-700 px-1.5 py-0.5 rounded font-mono font-semibold">BOBOT: A=10, B=5, C=4, D=3, E=2</code> di bawah opsi soal, atau sistem akan otomatis menggunakan preset bobot bawaan ({`A:${defaultScores.A}, B:${defaultScores.B}, C:${defaultScores.C}, D:${defaultScores.D}, E:${defaultScores.E}`}).
            </p>
          </div>

          {/* Parse Errors if any */}
          {parseErrors.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
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
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>
                    Pratinjau Hasil Parsing ({parsedPreview.length} Soal Berhasil Dikenali)
                  </span>
                </h4>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {parsedPreview.map((q, idx) => (
                  <div key={q.id || idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="font-semibold text-slate-900 mb-1.5">
                      {idx + 1}. {q.text}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 mb-2">
                      {q.options.map((opt) => (
                        <div key={opt.key} className="truncate">
                          <strong className="text-slate-800">{opt.key}.</strong> {opt.text}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <span className="font-medium text-slate-500">Bobot Opsi:</span>
                      {Object.entries(q.optionScores).map(([k, val]) => (
                        <span
                          key={k}
                          className="bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono font-semibold text-blue-700"
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
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Batal
          </button>

          <button
            disabled={parsedPreview.length === 0}
            onClick={handleConfirmImport}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all ${
              parsedPreview.length > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
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
