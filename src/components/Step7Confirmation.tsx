import React from 'react';
import { CheckCircle2, ExternalLink, RotateCcw, FolderGit2, FileSpreadsheet, ShieldCheck } from 'lucide-react';

interface Step7ConfirmationProps {
  isSubmitting: boolean;
  error: string | null;
  driveFolderUrl: string | null;
  spreadsheetUrl?: string | null;
  onRetry: () => void;
  onNewScreening: () => void;
}

export const Step7Confirmation: React.FC<Step7ConfirmationProps> = ({
  isSubmitting,
  error,
  driveFolderUrl,
  spreadsheetUrl,
  onRetry,
  onNewScreening
}) => {
  if (isSubmitting) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="bg-white rounded-3xl border border-teal-100 shadow-2xl p-12">
          <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce shadow-inner">
            <FolderGit2 className="w-10 h-10 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Uploading Screening Record</h2>
          <p className="text-slate-600 text-base mb-8">
            Please wait while we create your secure Google Drive folder, upload your facial scan images, and append your record to Google Sheets...
          </p>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className="bg-teal-600 h-full rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Submission Failed</h2>
          <p className="text-rose-700 text-sm mb-8 leading-relaxed bg-rose-50 p-4 rounded-2xl border border-rose-200">
            {error}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onRetry}
              className="w-full h-16 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 text-base"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Retry Submission</span>
            </button>
            <button
              onClick={onNewScreening}
              className="w-full h-16 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all active:scale-95 text-base"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl border border-teal-100 shadow-2xl p-8 md:p-12 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Screening Submitted Successfully!
        </h2>
        <p className="text-slate-600 text-base mb-8 max-w-xl mx-auto">
          Your screening information, multi-angle facial photos, and consent have been securely submitted to your organization's Google Sheet and Google Drive.
        </p>

        {/* Integration Links Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-10 text-left space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Google Sheets Record</h4>
                <p className="text-xs text-slate-500">Appended to "Atreya Facial Screening Records"</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">Saved ✓</span>
              {spreadsheetUrl && (
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  <span>Open Sheet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Google Drive Folder</h4>
                <p className="text-xs text-slate-500">Contains front.jpg, left.jpg, right.jpg</p>
              </div>
            </div>
            {driveFolderUrl && (
              <a
                href={driveFolderUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                <span>Open Folder</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Done / New Screening Button */}
        <button
          onClick={onNewScreening}
          className="w-full h-20 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xl rounded-2xl shadow-xl shadow-teal-600/30 flex items-center justify-center gap-3 transition-all active:scale-[0.99]"
        >
          <RotateCcw className="w-6 h-6" />
          <span>Done / Start New Screening</span>
        </button>
      </div>
    </div>
  );
};
