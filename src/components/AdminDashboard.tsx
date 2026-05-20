import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, Download, FileSpreadsheet, AlertCircle, CheckCircle2, LogOut, Users } from 'lucide-react';
import { EmployeeData } from '../types';

interface AdminDashboardProps {
  adminName: string;
  onLogout: () => void;
  onDataLoaded: (data: EmployeeData[]) => void;
  employees: EmployeeData[];
}

export function AdminDashboard({ adminName, onLogout, onDataLoaded, employees }: AdminDashboardProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const expectedHeaders = [
    'Employee_ID', 'First_Name', 'Last_Name', 'Email', 'Department',
    'Q1_Score', 'Q2_Score', 'Q3_Score', 'Q4_Score', 'YTD_Sales', 'Leaves_Taken',
    'Technical_Skill', 'Leadership_Skill', 'Communication_Skill'
  ];

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
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];
        
        if (data.length === 0) {
          setError('The uploaded file is empty.');
          return;
        }

        // Basic validation
        const firstRow = data[0];
        const missingHeaders = expectedHeaders.filter(h => !(h in firstRow));
        
        if (missingHeaders.length > 0) {
          console.warn('Missing expected headers:', missingHeaders);
          // We won't strictly error out to be flexible, but we could.
        }

        if (!data.every(row => row.Employee_ID)) {
          setError('Validation error: All rows must include an Employee_ID.');
          return;
        }

        onDataLoaded(data);
        setSuccess(`Successfully uploaded and parsed ${data.length} employee records.`);
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
        Employee_ID: 'EMP-001',
        First_Name: 'Jane',
        Last_Name: 'Doe',
        Email: 'jane@co.com',
        Department: 'Sales',
        Q1_Score: 95,
        Q2_Score: 92,
        Q3_Score: 90,
        Q4_Score: 96,
        YTD_Sales: 120000,
        Leaves_Taken: 4,
        Technical_Skill: 80,
        Leadership_Skill: 95,
        Communication_Skill: 90
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
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
                Ensure your dataset follows the structural schema for accurate dashboard generation. Employee_ID is the primary key.
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
                  <span className="text-neutral-400">Total Records</span>
                  <span className="text-2xl font-bold">{employees.length}</span>
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
            <h3 className="text-lg font-bold mb-4">Ingested Records Preview ({Math.min(5, employees.length)} of {employees.length})</h3>
            <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-medium">
                    <tr>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Department</th>
                      <th className="px-6 py-3">Avg Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {employees.slice(0, 5).map((emp, i) => {
                      const avg = Math.round(((emp.Q1_Score || 0) + (emp.Q2_Score || 0) + (emp.Q3_Score || 0) + (emp.Q4_Score || 0)) / 4) || 'N/A';
                      return (
                        <tr key={i} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-6 py-3 font-medium text-neutral-900">{emp.Employee_ID}</td>
                          <td className="px-6 py-3">{emp.First_Name} {emp.Last_Name}</td>
                          <td className="px-6 py-3 text-neutral-500">{emp.Email}</td>
                          <td className="px-6 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800">
                              {emp.Department}
                            </span>
                          </td>
                          <td className="px-6 py-3 font-mono">{avg}</td>
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
