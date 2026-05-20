import React, { useState } from 'react';
import { OwnerData } from '../types';
import { Search, ShieldCheck, User, Building2, TrendingUp, Users } from 'lucide-react';

interface PublicDirectoryProps {
  employees: OwnerData[];
  onSelectEmployee: (emp: OwnerData) => void;
  onAdminLogin: () => void;
}

export function PublicDirectory({ employees, onSelectEmployee, onAdminLogin }: PublicDirectoryProps) {
  const [search, setSearch] = useState('');

  const filtered = employees.filter(emp => {
    const term = search.toLowerCase();
    const name = `${emp.Owner || ''}`.toLowerCase();
    return name.includes(term);
  });

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 font-sans">
      <header className="bg-white border-b border-neutral-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 h-8 w-8 rounded-lg flex items-center justify-center shadow-inner">
            <span className="text-white font-bold text-sm tracking-wider">OP</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">Optima Insight</span>
        </div>
        
        <button 
          onClick={onAdminLogin}
          className="flex items-center gap-2 text-sm text-neutral-600 hover:text-indigo-600 font-medium transition-colors"
        >
          <ShieldCheck className="h-4 w-4" />
          Admin Access
        </button>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <Users className="h-8 w-8 text-indigo-600" />
              Owner Directory
            </h1>
            <p className="text-neutral-500">Public overview of project dashboards organized by Owner.</p>
          </div>
          
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input 
              type="text"
              placeholder="Search by owner name..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-20 bg-white border border-neutral-200 rounded-2xl shadow-sm">
            <User className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-1">No Data Available</h3>
            <p className="text-neutral-500">Admin needs to upload the master data sheet.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-neutral-500">No owners match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((emp, idx) => {
              return (
                <div 
                  key={idx}
                  onClick={() => onSelectEmployee(emp)}
                  className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 transition-colors">
                      <span className="text-indigo-600 font-bold group-hover:text-white transition-colors">
                        {(emp.Owner?.[0] || 'O')}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full truncate max-w-[120px]">
                      Records: {emp.Rows.length}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-neutral-900 line-clamp-1 mb-1" title={emp.Owner}>
                    {emp.Owner}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">Projects</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-neutral-500 mb-0.5">Summary</p>
                      <p className="font-bold text-neutral-900 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        View Performance
                      </p>
                    </div>
                    <div className="text-indigo-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      View Dash &rarr;
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

