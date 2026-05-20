import React, { useState, useEffect } from 'react';
import { EmployeeData } from './types';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { PublicDirectory } from './components/PublicDirectory';

type ViewState = 'DIRECTORY' | 'EMPLOYEE_DASH' | 'ADMIN_LOGIN' | 'ADMIN_DASH';

export default function App() {
  const [view, setView] = useState<ViewState>('DIRECTORY');
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [currentUser, setCurrentUser] = useState<EmployeeData | null>(null);
  const [adminName, setAdminName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('Never');

  // Load from local storage on mount (acting as our database)
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('companyData');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setEmployees(parsed.data || []);
        setLastUpdated(parsed.lastUpdated || 'Never');
      }
    } catch (e) {
      console.error("Could not parse local data", e);
    }
  }, []);

  const handleAdminLogin = (name: string) => {
    setAdminName(name);
    setView('ADMIN_DASH');
  };

  const handleAdminLogout = () => {
    setAdminName('');
    setView('DIRECTORY');
  };

  const handleDataLoaded = (data: EmployeeData[]) => {
    setEmployees(data);
    const now = new Date().toLocaleString();
    setLastUpdated(now);
    localStorage.setItem('companyData', JSON.stringify({ data, lastUpdated: now }));
  };

  if (view === 'ADMIN_LOGIN') {
    return <Login onLogin={handleAdminLogin} onCancel={() => setView('DIRECTORY')} error={error} />;
  }

  if (view === 'ADMIN_DASH') {
    return <AdminDashboard adminName={adminName} employees={employees} onDataLoaded={handleDataLoaded} onLogout={handleAdminLogout} />;
  }

  if (view === 'EMPLOYEE_DASH' && currentUser) {
    return <EmployeeDashboard employee={currentUser} lastUpdated={lastUpdated} onBack={() => setView('DIRECTORY')} />;
  }

  return (
    <PublicDirectory 
      employees={employees} 
      onSelectEmployee={(emp) => {
        setCurrentUser(emp);
        setView('EMPLOYEE_DASH');
      }} 
      onAdminLogin={() => setView('ADMIN_LOGIN')}
    />
  );
}
