import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, Download, FileSpreadsheet, AlertCircle, CheckCircle2, LogOut, Users, Activity, Trash2 } from 'lucide-react';
import { OwnerData } from '../types';

interface AdminDashboardProps {
  adminName: string;
  onLogout: () => void;
  onDataLoaded: (data: OwnerData[]) => void;
  employees: OwnerData[];
  onViewEmployee: (emp: OwnerData) => void;
  onClearData: () => void;
}

export function AdminDashboard({ adminName, onLogout, onDataLoaded, employees, onViewEmployee, onClearData }: AdminDashboardProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    setSuccess(null);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        const targetSheetName = "Monthly KPI Report - Data List";
        const wsname = wb.SheetNames.includes(targetSheetName) ? targetSheetName : wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        let data = XLSX.utils.sheet_to_json(ws) as any[];
        
        if (data.length === 0) {
          setError(`The sheet "${wsname}" is empty.`);
          return;
        }

        // Clean up keys (sometimes excel has whitespace padding)
        data = data.map(row => {
          const newRow: any = {};
          for (const key in row) {
            newRow[key.trim()] = row[key];
          }
          return newRow;
        });

        if (!data.some(row => row.Owner)) {
          setError('Validation error: All rows must include an "Owner" column.');
          return;
        }

        const validRows = data.filter(row => row.Owner);
        
        const grouped = validRows.reduce((acc, row) => {
          const owner = row.Owner;
          if (!acc[owner]) {
            acc[owner] = { Owner: owner, Rows: [] };
          }
          acc[owner].Rows.push(row);
          return acc;
        }, {} as Record<string, OwnerData>);

        const finalData = Object.values(grouped) as OwnerData[];

        onDataLoaded(finalData);
        setSuccess(`Successfully uploaded and parsed ${validRows.length} records across ${finalData.length} unique owners.`);
      } catch (err) {
        console.error(err);
        setError('Error parsing the file. Please ensure it is a valid Excel or CSV file.');
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        Owner: 'Jane Doe',
        'Project Name': 'Website Redesign',
        Metrics1: 95,
        Metrics2: 92,
      },
      {
        Owner: 'Jane Doe',
        'Project Name': 'Mobile App Launch',
        Metrics1: 88,
        Metrics2: 120,
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly KPI Report - Data List');
    XLSX.writeFile(wb, 'Employee_Dashboard_Template.xlsx');
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600">
          <FileSpreadsheet className="h-6 w-6" />
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">DataHub Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-sm font-medium text-neutral-600 pr-4 border-r border-neutral-200">
             Welcome, {adminName}
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-10 px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Data Ingestion</h2>
          <p className="text-neutral-500">Upload the master Excel or CSV file to update employee dashboards.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div 
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors
                ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-neutral-300 bg-white hover:bg-neutral-50'}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <UploadCloud className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Click or drag file to this area to upload</h3>
              <p className="text-sm text-neutral-500 mb-6">Support for a single or bulk upload. Strict xlsx or csv format.</p>
              
              <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium cursor-pointer transition-colors shadow-sm">
                Browse Files
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
             <div className="bg-white border text-sm border-neutral-200 rounded-xl p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
                <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                Template Guidelines
              </h3>
              <p className="text-neutral-500 mb-5 leading-relaxed">
                Ensure your dataset has a sheet named "Monthly KPI Report - Data List". The primary key for grouping is "Owner". Values will be calculated according to "Project Name".
              </p>
              <button 
                onClick={downloadTemplate}
                className="w-full flex items-center justify-center gap-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-medium py-2 rounded-lg transition-colors"
                title="Download expected format template"
              >
                <Download className="h-4 w-4" />
                Download Template
              </button>
            </div>

            <div className="bg-neutral-900 border text-sm rounded-xl p-6 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Users className="h-24 w-24" />
              </div>
              <h3 className="font-semibold mb-1 text-base relative z-10">System Status</h3>
              <p className="text-neutral-400 mb-6 relative z-10">Database overview</p>
              
              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex justify-between items-end border-b border-neutral-700 pb-3">
                  <span className="text-neutral-400">Total Owners</span>
                  <span className="text-2xl font-bold">{employees.length}</span>
                </div>
                <div className="flex justify-between items-end border-b border-neutral-700 pb-3">
                  <span className="text-neutral-400">Total Projects</span>
                  <span className="text-2xl font-bold">{employees.reduce((acc, emp) => acc + emp.Rows.length, 0)}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-neutral-400">Last Synced</span>
                  <span className="text-sm font-medium">Just now</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {employees.length > 0 && (
          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Ingested Records Preview ({Math.min(5, employees.length)} of {employees.length})</h3>
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete all uploaded data?")) {
                    onClearData();
                    setSuccess(null);
                  }
                }}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
                Delete All Data
              </button>
            </div>
            <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-medium">
                    <tr>
                      <th className="px-6 py-3">Owner</th>
                      <th className="px-6 py-3">Total Project Records</th>
                      <th className="px-6 py-3">Sample Project</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {employees.slice(0, 5).map((emp, i) => {
                      return (
                        <tr key={i} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-6 py-3 font-medium text-neutral-900">{emp.Owner}</td>
                          <td className="px-6 py-3 text-neutral-500">{emp.Rows.length}</td>
                          <td className="px-6 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
                              {emp.Rows[0]?.['Project Name'] || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <button
                              onClick={() => onViewEmployee(emp)}
                              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 hover:text-indigo-800 transition-colors"
                            >
                              <Activity className="h-3.5 w-3.5" />
                              View Dashboard
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

