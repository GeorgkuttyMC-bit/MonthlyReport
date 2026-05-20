import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { ArrowLeft, Building2, TrendingUp, Clock, Sparkles, FolderKanban, Briefcase, Activity, Filter, ArrowUpDown, ArrowDown, ArrowUp, AlertCircle } from 'lucide-react';
import { OwnerData } from '../types';

interface EmployeeDashboardProps {
  employee: OwnerData;
  onBack: () => void;
  lastUpdated: string;
}

export function EmployeeDashboard({ employee, onBack, lastUpdated }: EmployeeDashboardProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [textFilter, setTextFilter] = useState('');
  const [metricFilters, setMetricFilters] = useState<Record<string, { min: string, max: string }>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [scatterMetricX, setScatterMetricX] = useState<string>('');
  const [scatterMetricY, setScatterMetricY] = useState<string>('');

  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingInsight(true);
      setInsightError(null);
      try {
        // Send only necessary data to avoid payload too large errors
        const payload = {
          Owner: employee.Owner,
          Rows: employee.Rows.slice(0, 5),
          TotalRows: employee.Rows.length
        };

        const res = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee: payload })
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
    if (employee) fetchInsight();
  }, [employee]);
  
  const rows = employee?.Rows || [];
  
  // Find numeric columns dynamically for charting
  const numericKeys = new Set<string>();
  rows.forEach(r => {
    Object.keys(r).forEach(k => {
      if (typeof r[k] === 'number' && k !== 'Owner' && k !== 'Project Name') {
        numericKeys.add(k);
      }
    });
  });
  
  const metrics = Array.from(numericKeys).slice(0, 4); // Take up to 4 numeric metrics for charting
  
  useEffect(() => {
    if (metrics.length > 0) {
      if (!scatterMetricX) setScatterMetricX(metrics[0]);
      if (!scatterMetricY) setScatterMetricY(metrics.length > 1 ? metrics[1] : metrics[0]);
    }
  }, [metrics.join(','), scatterMetricX, scatterMetricY]);

  // Group by Project Name to calculate values
  const projectStats = rows.reduce((acc, row) => {
     const proj = row['Project Name'] || 'Unknown Project';
     if (!acc[proj]) {
       acc[proj] = { name: proj };
       metrics.forEach(m => acc[proj][m] = 0);
     }
     metrics.forEach(m => {
       const val = parseFloat(row[m] as any);
       if (!isNaN(val)) {
         acc[proj][m] += val;
       }
     });
     return acc;
  }, {} as Record<string, any>);
  
  const chartData = Object.values(projectStats);

  // For Pie Chart - Aggregate the first metric across all projects to show project contribution
  const pieData = chartData.map((d: any) => ({
    name: String(d.name),
    value: Math.max(0, metrics.length > 0 && typeof d[metrics[0]] === 'number' ? d[metrics[0]] : 1)
  })).filter(d => d.value > 0);

  // Define colors for the charts
  const COLORS = ['#4f46e5', '#38bdf8', '#fbbf24', '#34d399', '#ec4899', '#8b5cf6'];

  // Apply filters for the table
  let filteredRows = rows.filter(row => {
    // Project Name filter
    if (textFilter && !(row['Project Name'] || '').toLowerCase().includes(textFilter.toLowerCase())) {
      return false;
    }
    
    // Metrics filters
    for (const m of metrics) {
      if (metricFilters[m]) {
        const val = row[m];
        const min = parseFloat(metricFilters[m].min);
        const max = parseFloat(metricFilters[m].max);
        
        if (!isNaN(min) && (val == null || val < min)) return false;
        if (!isNaN(max) && (val == null || val > max)) return false;
      }
    }
    
    return true;
  });

  if (sortConfig !== null) {
    filteredRows.sort((a, b) => {
      const { key, direction } = sortConfig;
      
      let valA = a[key];
      let valB = b[key];

      if (typeof valA === 'string' && typeof valB === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA === valB) return 0;
      
      // Handle null/undefined values by pushing them to the end
      if (valA == null) return direction === 'asc' ? 1 : -1;
      if (valB == null) return direction === 'asc' ? -1 : 1;

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 font-sans pb-12">
      
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
            Overview for <span className="text-neutral-900 font-semibold">{employee?.Owner}</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-neutral-600 hover:text-indigo-600 font-medium transition-colors border border-neutral-200 px-4 py-2 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 shadow-sm hover:shadow"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Main Menu
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* OVERVIEW WIDGETS */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <FolderKanban className="h-24 w-24 text-indigo-600" />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <FolderKanban className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-500 font-medium mb-1 relative z-10">Total Records</p>
            <h2 className="text-3xl font-bold tracking-tight relative z-10">{rows.length}</h2>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Building2 className="h-24 w-24 text-blue-600" />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-500 font-medium mb-1 relative z-10">Unique Projects</p>
            <h2 className="text-3xl font-bold tracking-tight relative z-10">
              {Object.keys(projectStats).length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="h-24 w-24 text-emerald-600" />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-500 font-medium mb-1 relative z-10">Tracked Metrics</p>
            <h2 className="text-3xl font-bold tracking-tight flex items-baseline gap-1 relative z-10">
              {metrics.length} <span className="text-sm font-normal text-neutral-400">Columns</span>
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2 bg-neutral-100 rounded-lg">
                <Clock className="h-5 w-5 text-neutral-600" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-sm text-neutral-500 font-medium mb-1">Last Synced</p>
              <h2 className="text-sm font-bold truncate text-neutral-900">{lastUpdated}</h2>
            </div>
          </div>

        </section>

        {/* AI INSIGHTS */}
        <section className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-white rounded-2xl border border-indigo-100 p-8 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32 text-indigo-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-indigo-900">AI Performance Summary</h3>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white shadow-sm">
              {loadingInsight ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-2 bg-indigo-200/50 rounded w-3/4"></div>
                    <div className="h-2 bg-indigo-200/50 rounded w-5/6"></div>
                    <div className="h-2 bg-indigo-200/50 rounded w-4/6"></div>
                  </div>
                </div>
              ) : insightError ? (
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">
                    {insightError}. Ensure your Gemini API Key is configured in the AI Studio Settings.
                  </p>
                </div>
              ) : (
                <p className="text-base text-indigo-900/80 leading-relaxed font-medium">
                  {insight || 'No insights generated. Try reloading the dashboard or checking your API configuration.'}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* VISUALIZATIONS */}
        {metrics.length > 0 && chartData.length > 0 && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Primary Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm flex flex-col">
              <div className="mb-6 flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-bold">Metrics by Project</h3>
                  <p className="text-sm text-neutral-500">Aggregated performance values mapped across projects.</p>
                </div>
              </div>
              <div className="flex-1 min-h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#6b7280', fontSize: 12}} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#6b7280', fontSize: 12}} 
                      dx={-10}
                    />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ fontWeight: '600' }}
                      cursor={{fill: '#f3f4f6'}}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    {metrics.map((metric, idx) => (
                      <Bar 
                        key={metric} 
                        dataKey={metric} 
                        fill={COLORS[idx % COLORS.length]} 
                        radius={[4, 4, 0, 0]} 
                        maxBarSize={50} 
                        animationDuration={1500}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Project Distribution Pie Chart */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col">
              <div className="mb-2">
                <h3 className="text-base font-bold">Project Distribution</h3>
                <p className="text-xs text-neutral-500">Based on {metrics[0]}</p>
              </div>
              <div className="flex-1 min-h-[220px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                  <span className="text-3xl font-bold text-neutral-800">{pieData.length}</span>
                  <span className="text-xs text-neutral-500 uppercase tracking-widest mt-1">Total</span>
                </div>
              </div>
            </div>

            {/* Scatter Plot Chart */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col">
              <div className="mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-base font-bold">Metrics Relationship</h3>
                  <p className="text-xs text-neutral-500">Scatter plot comparison</p>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={scatterMetricX}
                    onChange={(e) => setScatterMetricX(e.target.value)}
                    className="text-xs border border-neutral-200 rounded px-2 py-1 outline-none focus:border-indigo-500 bg-gray-50"
                  >
                    {metrics.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <span className="text-xs text-neutral-400">vs</span>
                  <select 
                    value={scatterMetricY}
                    onChange={(e) => setScatterMetricY(e.target.value)}
                    className="text-xs border border-neutral-200 rounded px-2 py-1 outline-none focus:border-indigo-500 bg-gray-50"
                  >
                    {metrics.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex-1 min-h-[220px]">
                {scatterMetricX && scatterMetricY ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        type="number" 
                        dataKey={scatterMetricX} 
                        name={scatterMetricX} 
                        tick={{fontSize: 12, fill: '#6b7280'}} 
                        axisLine={false} 
                        tickLine={false}
                      />
                      <YAxis 
                        type="number" 
                        dataKey={scatterMetricY} 
                        name={scatterMetricY} 
                        tick={{fontSize: 12, fill: '#6b7280'}} 
                        axisLine={false} 
                        tickLine={false}
                      />
                      <ZAxis type="category" dataKey="name" name="Project" />
                      <RechartsTooltip 
                        cursor={{strokeDasharray: '3 3'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontWeight: '600' }}
                      />
                      <Scatter name="Projects" data={chartData} fill="#4f46e5" />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-neutral-400">
                    Not enough numeric metrics.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* DETAILS TABLE */}
        <section>

          {/* FILTERS */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-neutral-900">Filter Table Records</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Project Name Filter */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Project Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-shadow"
                  placeholder="Contains text..."
                  value={textFilter}
                  onChange={e => setTextFilter(e.target.value)}
                />
              </div>

              {/* Metric Filters */}
              {metrics.map(m => (
                <div key={m}>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5" title={m}>
                    <span className="truncate block">{m} (Range)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-shadow"
                      placeholder="Min"
                      value={metricFilters[m]?.min || ''}
                      onChange={e => setMetricFilters(prev => ({ ...prev, [m]: { ...prev[m], min: e.target.value } }))}
                    />
                    <span className="text-neutral-400">-</span>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-shadow"
                      placeholder="Max"
                      value={metricFilters[m]?.max || ''}
                      onChange={e => setMetricFilters(prev => ({ ...prev, [m]: { ...prev[m], max: e.target.value } }))}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-neutral-200 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Project Master List</h3>
                <p className="text-sm text-neutral-500">Detailed line items from the dataset.</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-500 bg-gray-50/80 border-b border-neutral-200 uppercase tracking-wider font-semibold">
                  <tr>
                    <th 
                      className="px-8 py-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                      onClick={() => handleSort('Project Name')}
                    >
                      <div className="flex items-center gap-2">
                        Project Name
                        {sortConfig?.key === 'Project Name' ? (
                          sortConfig.direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-indigo-600" /> : <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-neutral-300 group-hover:text-neutral-500" />
                        )}
                      </div>
                    </th>
                    {metrics.map(m => (
                      <th 
                        key={m} 
                        className="px-8 py-4 whitespace-nowrap text-right cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                        onClick={() => handleSort(m)}
                      >
                        <div className="flex items-center justify-end gap-2">
                          {sortConfig?.key === m ? (
                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-indigo-600" /> : <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 text-neutral-300 group-hover:text-neutral-500" />
                          )}
                          {m}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {filteredRows.length > 0 ? filteredRows.map((row, i) => (
                    <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-8 py-4 font-medium text-neutral-900 border-r border-neutral-50 max-w-[300px] truncate group-hover:text-indigo-900">
                        {row['Project Name'] || 'N/A'}
                      </td>
                      {metrics.map((m, idx) => (
                        <td key={m} className={`px-8 py-4 text-right font-mono ${idx === 0 ? 'text-indigo-600 font-semibold' : 'text-neutral-600'}`}>
                          {row[m] != null ? row[m].toLocaleString() : '-'}
                        </td>
                      ))}
                    </tr>
                  )) : (
                    <tr>
                      <td className="px-8 py-8 text-center text-neutral-500" colSpan={metrics.length + 1}>
                        <FolderKanban className="h-8 w-8 mx-auto text-neutral-300 mb-2" />
                        No records match your filters.
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


