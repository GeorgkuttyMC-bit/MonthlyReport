import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { ArrowLeft, User, Building2, TrendingUp, Calendar, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { EmployeeData } from '../types';

interface EmployeeDashboardProps {
  employee: EmployeeData;
  onBack: () => void;
  lastUpdated: string;
}

export function EmployeeDashboard({ employee, onBack, lastUpdated }: EmployeeDashboardProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingInsight(true);
      setInsightError(null);
      try {
        const res = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch insights');
        setInsight(data.insight);
      } catch (err: any) {
        setInsightError(err.message);
      } finally {
        setLoadingInsight(false);
      }
    };
    fetchInsight();
  }, [employee]);
  
  // Calculate Avg Score
  const scores = [employee.Q1_Score, employee.Q2_Score, employee.Q3_Score, employee.Q4_Score].filter(n => typeof n === 'number' && !isNaN(n));
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  // Format Performance Data
  const performanceData = [
    { name: 'Q1', score: employee.Q1_Score || 0 },
    { name: 'Q2', score: employee.Q2_Score || 0 },
    { name: 'Q3', score: employee.Q3_Score || 0 },
    { name: 'Q4', score: employee.Q4_Score || 0 },
  ];

  // Format Skills Data
  const skillsData = [
    { subject: 'Technical', A: employee.Technical_Skill || 0, fullMark: 100 },
    { subject: 'Leadership', A: employee.Leadership_Skill || 0, fullMark: 100 },
    { subject: 'Communication', A: employee.Communication_Skill || 0, fullMark: 100 },
    { subject: 'Problem Solving', A: Math.round(((employee.Technical_Skill || 0) + (employee.Leadership_Skill || 0)) / 2), fullMark: 100 },
    { subject: 'Teamwork', A: Math.round(((employee.Communication_Skill || 0) + (employee.Leadership_Skill || 0)) / 2), fullMark: 100 },
  ];

  // Mock Tasks / Projects based heavily on the user's role to feel realistic
  const determineProjects = (dept: string) => {
    if (dept.toLowerCase().includes('sales')) {
      return [
        { name: 'Q3 Enterprise Outreach', status: 'In Progress', due: 'Oct 15', feedback: 'Great momentum' },
        { name: 'Client Retention Plan', status: 'Completed', due: 'Sep 01', feedback: 'Exceeded goals' },
      ];
    }
    if (dept.toLowerCase().includes('engin')) {
      return [
        { name: 'API V2 Migration', status: 'In Progress', due: 'Nov 01', feedback: 'On track, good test coverage' },
        { name: 'Database Optimization', status: 'Pending Review', due: 'Oct 20', feedback: 'Awaiting QA' },
      ];
    }
    return [
      { name: 'Cross-functional Sync', status: 'In Progress', due: 'Oct 30', feedback: 'Needs more documentation' },
      { name: 'Quarterly OKRs Review', status: 'Completed', due: 'Sep 15', feedback: 'Well aligned' },
    ];
  };

  const tasks = determineProjects(employee.Department || '');

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 font-sans">
      
      {/* HEADER */}
      <header className="bg-white border-b border-neutral-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 h-8 w-8 rounded-lg flex items-center justify-center shadow-inner">
            <span className="text-white font-bold text-sm tracking-wider">OP</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">Optima Insight</span>
        </div>
        
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
          <h1 className="text-sm font-medium text-neutral-500">
            Welcome back, <span className="text-neutral-900 font-semibold">{employee.Name}</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-600 pr-4 border-r border-neutral-200">
            <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200">
              <User className="h-4 w-4 text-neutral-600" />
            </div>
            <span className="font-medium">{employee.Email}</span>
          </div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-neutral-600 hover:text-indigo-600 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* OVERVIEW WIDGETS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Building2 className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-500 font-medium mb-1">Current Role</p>
            <h2 className="text-xl font-bold truncate" title={employee.Department}>{employee.Department || 'Unassigned'}</h2>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">Top 10%</span>
            </div>
            <p className="text-sm text-neutral-500 font-medium mb-1">Performance Score</p>
            <h2 className="text-xl font-bold flex items-baseline gap-1">
              {avgScore} <span className="text-sm font-normal text-neutral-400">/ 100</span>
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-500 font-medium mb-1">Leaves Taken</p>
            <h2 className="text-xl font-bold">{employee.Leaves_Taken || 0} <span className="text-sm font-normal text-neutral-400">Days</span></h2>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-neutral-100 rounded-lg">
                <Clock className="h-5 w-5 text-neutral-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-neutral-500 font-medium mb-1">Last Synced</p>
              <h2 className="text-sm font-bold truncate">{lastUpdated}</h2>
            </div>
          </div>

        </section>

        {/* AI INSIGHTS */}
        <section className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-indigo-900">AI Performance Summary</h3>
          </div>
          {loadingInsight ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-3 py-1">
                <div className="h-2 bg-indigo-200 rounded"></div>
                <div className="h-2 bg-indigo-200 rounded w-5/6"></div>
              </div>
            </div>
          ) : insightError ? (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              {insightError}. Ensure your Gemini API Key is configured in the AI Studio Settings.
            </p>
          ) : (
            <p className="text-sm text-indigo-800 leading-relaxed font-medium">
              {insight || 'No insights generated.'}
            </p>
          )}
        </section>

        {/* VISUALIZATIONS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold">Quarterly Trajectory</h3>
              <p className="text-sm text-neutral-500">Your performance mapped across the fiscal year.</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 13}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 13}} domain={[0, 100]} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{r: 5, strokeWidth: 2, fill: '#fff'}} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
            <div className="mb-2">
              <h3 className="text-lg font-bold">Skill Competency Matrix</h3>
              <p className="text-sm text-neutral-500">Multi-dimensional assessment profile.</p>
            </div>
            <div className="h-[320px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsData}>
                  <PolarGrid stroke="#e5e5e5" />
                  <PolarAngleAxis dataKey="subject" tick={{fill: '#52525b', fontSize: 12, fontWeight: 500}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Employee" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </section>

        {/* DETAILS TABLE */}
        <section>
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-neutral-200 flex justify-between items-center bg-neutral-50/50">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Current Initiatives</h3>
                <p className="text-sm text-neutral-500">Active tasks and management feedback.</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-500 bg-white border-b border-neutral-200 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-8 py-4">Task Name</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Due Date</th>
                    <th className="px-8 py-4">Manager Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {tasks.map((task, i) => (
                    <tr key={i} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-8 py-4 font-medium text-neutral-900 flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-500">
                          {i + 1}
                        </div>
                        {task.name}
                      </td>
                      <td className="px-8 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                          ${task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 
                            'bg-amber-100 text-amber-700'}`}>
                          {task.status === 'Completed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : 
                           task.status === 'In Progress' ? <TrendingUp className="h-3.5 w-3.5" /> : 
                           <AlertCircle className="h-3.5 w-3.5" />}
                          {task.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-neutral-600 font-mono text-xs">{task.due}</td>
                      <td className="px-8 py-4 text-neutral-600 italic">"{task.feedback}"</td>
                    </tr>
                  ))}
                  {/* Extracted direct action items if they exist on the record */}
                  {employee.Action_Items && (
                    <tr className="bg-indigo-50/30">
                       <td className="px-8 py-4 font-medium text-indigo-900 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-indigo-500 ml-3"></div>
                        Direct Action Item
                      </td>
                      <td className="px-8 py-4" colSpan={3}>
                        <span className="text-neutral-700">{employee.Action_Items}</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
