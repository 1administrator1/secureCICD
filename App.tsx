
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Shield, 
  Play, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  BarChart3, 
  Cloud, 
  Lock, 
  Zap,
  Activity,
  Code2,
  ChevronRight,
  RefreshCcw,
  Search
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { StepStatus, PipelineStep, ScanResult } from './types';
import { analyzePipelineSecurity } from './services/geminiService';

// --- Mock Data ---
const MOCK_STEPS: PipelineStep[] = [
  { id: '1', name: 'Lint & SAST', description: 'Static analysis of Python source code', status: StepStatus.IDLE, logs: [] },
  { id: '2', name: 'Dep Check', description: 'SCA scanning for vulnerable packages', status: StepStatus.IDLE, logs: [] },
  { id: '3', name: 'Cloud Audit', description: 'Validating Terraform/Cloud configs', status: StepStatus.IDLE, logs: [] },
  { id: '4', name: 'Build Image', description: 'Generating hardened container images', status: StepStatus.IDLE, logs: [] },
  { id: '5', name: 'Performance', description: 'Benchmarking deployment speed', status: StepStatus.IDLE, logs: [] },
  { id: '6', name: 'Deploy', description: 'Staging environment deployment', status: StepStatus.IDLE, logs: [] },
];

const PERFORMANCE_DATA = [
  { time: '10:00', latency: 120, security: 85 },
  { time: '11:00', latency: 140, security: 82 },
  { time: '12:00', latency: 110, security: 90 },
  { time: '13:00', latency: 95, security: 92 },
  { time: '14:00', latency: 130, security: 88 },
  { time: '15:00', latency: 105, security: 95 },
];

const SEVERITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#7f1d1d'
};

// --- Sub-components ---

const StatusBadge: React.FC<{ status: StepStatus }> = ({ status }) => {
  switch (status) {
    case StepStatus.SUCCESS:
      return <div className="flex items-center text-emerald-400 gap-1 text-sm"><CheckCircle2 size={14} /> Success</div>;
    case StepStatus.FAILED:
      return <div className="flex items-center text-rose-400 gap-1 text-sm"><XCircle size={14} /> Failed</div>;
    case StepStatus.RUNNING:
      return <div className="flex items-center text-blue-400 gap-1 text-sm"><RefreshCcw size={14} className="animate-spin" /> Running</div>;
    case StepStatus.WARNING:
      return <div className="flex items-center text-amber-400 gap-1 text-sm"><AlertTriangle size={14} /> Warning</div>;
    default:
      return <div className="flex items-center text-slate-500 gap-1 text-sm"><Activity size={14} /> Idle</div>;
  }
};

const Header = () => (
  <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
    <div className="flex items-center gap-3">
      <div className="bg-blue-600 p-2 rounded-lg">
        <Shield className="text-white" size={24} />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight">SecureFlow <span className="text-blue-500">AI</span></h1>
        <p className="text-xs text-slate-400">CI/CD Security & Automation Dashboard</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="hidden md:flex items-center bg-slate-800/50 rounded-full px-3 py-1 border border-slate-700">
        <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
        <span className="text-xs font-medium text-slate-300">Live Infrastructure: Active</span>
      </div>
      <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-medium">
        <Lock size={18} /> Hardened Portal
      </button>
    </div>
  </header>
);

export default function App() {
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(MOCK_STEPS);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(["[SYSTEM] Pipeline initialized. Awaiting trigger..."]);
  const [codeSnippet, setCodeSnippet] = useState(`import os
import boto3

def deploy_lambda():
    # Potential credential leak?
    client = boto3.client('s3', aws_access_key_id="AKIAEXAMPLE", aws_secret_access_key="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY")
    print("Deploying to S3 bucket...")`);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [terminalLogs]);

  const addLog = (msg: string) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const startPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalLogs(["[SYSTEM] Pipeline started manually."]);
    
    const steps = [...MOCK_STEPS].map(s => ({ ...s, status: StepStatus.IDLE }));
    setPipelineSteps(steps);

    for (let i = 0; i < steps.length; i++) {
      setActiveStepIndex(i);
      setPipelineSteps(prev => {
        const next = [...prev];
        next[i].status = StepStatus.RUNNING;
        return next;
      });
      addLog(`Starting step: ${steps[i].name}...`);
      
      // Simulate work
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      
      setPipelineSteps(prev => {
        const next = [...prev];
        next[i].status = StepStatus.SUCCESS;
        return next;
      });
      addLog(`${steps[i].name} completed successfully.`);
    }

    setIsRunning(false);
    setActiveStepIndex(-1);
    addLog("[SYSTEM] Pipeline deployment sequence completed.");
  };

  const runAIScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    addLog("[AI] Triggering SecureFlow AI scan of repository configurations...");
    try {
      const result = await analyzePipelineSecurity(codeSnippet);
      setScanResult(result);
      addLog(`[AI] Scan complete. Score: ${result.score}/100. Detected ${result.findings.length} findings.`);
    } catch (error) {
      addLog("[ERROR] AI scan failed. Check API key or connection.");
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* Left Column: Pipeline Execution */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Pipeline Visualizer */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Activity size={20} className="text-blue-500" />
                Pipeline Orchestrator
              </h2>
              <button 
                onClick={startPipeline}
                disabled={isRunning}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-lg ${
                  isRunning 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 active:scale-95'
                }`}
              >
                <Play size={18} />
                {isRunning ? 'Running...' : 'Execute Workflow'}
              </button>
            </div>

            <div className="relative flex justify-between">
              {/* Connector Lines */}
              <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-800 z-0"></div>
              
              {pipelineSteps.map((step, idx) => (
                <div key={step.id} className="relative z-10 flex flex-col items-center group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                    step.status === StepStatus.SUCCESS ? 'bg-emerald-500 border-emerald-900' :
                    step.status === StepStatus.RUNNING ? 'bg-blue-500 border-blue-900 animate-pulse' :
                    step.status === StepStatus.FAILED ? 'bg-rose-500 border-rose-900' :
                    'bg-slate-800 border-slate-700'
                  }`}>
                    {step.status === StepStatus.SUCCESS ? <CheckCircle2 size={18} /> : 
                     step.status === StepStatus.RUNNING ? <RefreshCcw size={18} className="animate-spin" /> :
                     <span className="text-sm font-bold">{idx + 1}</span>}
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">{step.name}</p>
                    <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <StatusBadge status={step.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Security Analysis Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Side */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Code2 size={16} /> Configuration Source
                </h3>
                <button 
                  onClick={runAIScan}
                  disabled={isScanning}
                  className="text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-1 rounded-md border border-blue-500/30 flex items-center gap-1 transition-colors"
                >
                  {isScanning ? <RefreshCcw size={12} className="animate-spin" /> : <Shield size={12} />}
                  Run AI Scan
                </button>
              </div>
              <textarea
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm text-blue-300 min-h-[250px] focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none shadow-inner"
              />
            </div>

            {/* AI Result Side */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl overflow-hidden flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Search size={16} /> AI Validation Insights
              </h3>
              
              {!scanResult && !isScanning && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center p-6 border-2 border-dashed border-slate-800 rounded-lg">
                  <Shield size={48} className="mb-4 opacity-20" />
                  <p className="text-sm">Submit your code or pipeline config to trigger a secure audit.</p>
                </div>
              )}

              {isScanning && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <Shield size={64} className="text-blue-500 animate-pulse" />
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-ping"></div>
                  </div>
                  <p className="text-sm text-slate-400 animate-pulse">Gemini 3 is analyzing your deployment security...</p>
                </div>
              )}

              {scanResult && (
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border-l-4 border-emerald-500">
                    <span className="text-xs font-bold text-slate-400">SECURITY SCORE</span>
                    <span className="text-2xl font-black text-emerald-400">{scanResult.score}%</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">"{scanResult.summary}"</p>
                  
                  <div className="space-y-3">
                    {scanResult.findings.map((f, i) => (
                      <div key={i} className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-xs font-bold text-slate-200">{f.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" 
                                style={{ backgroundColor: `${SEVERITY_COLORS[f.severity]}20`, color: SEVERITY_COLORS[f.severity] }}>
                            {f.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-2">{f.description}</p>
                        <div className="bg-slate-900 p-2 rounded text-[10px] text-emerald-400 border border-emerald-500/20">
                          <span className="font-bold">FIX:</span> {f.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-blue-900/10 rounded-lg border border-blue-800/20">
                    <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-2">Performance Suggestions</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {scanResult.performanceInsights.map((insight, i) => (
                        <li key={i} className="text-[11px] text-slate-400">{insight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Log Terminal */}
          <section className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-slate-400" />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Automation Logs</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
              </div>
            </div>
            <div className="p-4 h-[200px] overflow-y-auto font-mono text-xs text-slate-400 space-y-1 selection:bg-blue-500 selection:text-white">
              {terminalLogs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-slate-600 shrink-0">{log.split(']')[0]}]</span>
                  <span className={log.includes('[SYSTEM]') ? 'text-blue-400' : log.includes('[AI]') ? 'text-purple-400' : 'text-slate-300'}>
                    {log.split(']')[1]}
                  </span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </section>
        </div>

        {/* Right Column: Analytics & Stats */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center">
              <div className="bg-blue-500/10 p-2 rounded-lg mb-2 text-blue-500">
                <Zap size={20} />
              </div>
              <span className="text-2xl font-bold">1.2s</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Avg Latency</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center">
              <div className="bg-emerald-500/10 p-2 rounded-lg mb-2 text-emerald-500">
                <CheckCircle2 size={20} />
              </div>
              <span className="text-2xl font-bold">99.9%</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Success Rate</span>
            </div>
          </div>

          {/* Performance Chart */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <BarChart3 size={16} /> Performance Trends
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PERFORMANCE_DATA}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSecurity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '10px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="latency" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorLatency)" 
                    strokeWidth={2}
                    name="Latency (ms)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="security" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorSecurity)" 
                    strokeWidth={2}
                    name="Security Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Infrastructure Map */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Cloud size={80} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 relative z-10">
              <Cloud size={16} /> Multi-Cloud Health
            </h3>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-600/10 flex items-center justify-center text-blue-500">
                    <Cloud size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">AWS us-east-1</p>
                    <p className="text-[10px] text-slate-500">12 Instances • Secure</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] text-emerald-500 font-bold uppercase">Healthy</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-orange-600/10 flex items-center justify-center text-orange-500">
                    <Activity size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">GCP europe-west</p>
                    <p className="text-[10px] text-slate-500">4 Functions • Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                  <span className="text-[10px] text-amber-500 font-bold uppercase">Syncing</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-cyan-600/10 flex items-center justify-center text-cyan-500">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">Azure east-us</p>
                    <p className="text-[10px] text-slate-500">AKS Cluster • Hardened</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] text-emerald-500 font-bold uppercase">Stable</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase mb-2">
                <span>Hardening Progress</span>
                <span>84%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full w-[84%] transition-all duration-1000"></div>
              </div>
            </div>
          </section>

        </div>
      </main>

      <footer className="bg-slate-900/50 border-t border-slate-800 p-6 text-center text-slate-500">
        <div className="flex flex-col items-center gap-2 max-w-lg mx-auto">
          <p className="text-xs">
            Powered by <strong>Gemini 3</strong> • Advanced Python Security Validations
          </p>
          <div className="flex gap-4 mt-2">
            <span className="text-[10px] border border-slate-800 px-2 py-1 rounded bg-slate-950 hover:text-slate-300 cursor-pointer transition-colors">Documentation</span>
            <span className="text-[10px] border border-slate-800 px-2 py-1 rounded bg-slate-950 hover:text-slate-300 cursor-pointer transition-colors">API Status</span>
            <span className="text-[10px] border border-slate-800 px-2 py-1 rounded bg-slate-950 hover:text-slate-300 cursor-pointer transition-colors">Security Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
