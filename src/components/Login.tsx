import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLogin: (adminName: string) => void;
  onCancel: () => void;
  error?: string | null;
}

export function Login({ onLogin, onCancel, error }: LoginProps) {
  const [adminName, setAdminName] = useState('');

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Brand / Logo Area */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-6 rotate-3">
            <span className="text-white text-2xl font-black tracking-tighter">OP</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">Optima Insight</h1>
          <p className="text-neutral-500 text-center text-sm">Secure Admin Access</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden">
          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium text-center border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); if (adminName.trim()) onLogin(adminName.trim()); }} className="space-y-6 text-center">
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <p className="text-sm text-neutral-600 mb-4">
                  Secure access to the global employee database and master sheet upload portal.
                </p>
              </div>
              <div className="text-left">
                <label htmlFor="adminName" className="block text-sm font-semibold text-neutral-900 mb-2">
                  Admin Name
                </label>
                <input
                  type="text"
                  id="adminName"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={!adminName.trim()}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enter Admin Workspace
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <button 
          onClick={onCancel}
          className="mx-auto mt-6 flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Public Directory
        </button>

      </div>
    </div>
  );
}
