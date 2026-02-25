/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Search, 
  ArrowRight, 
  Activity, 
  Lock, 
  Unlock, 
  AlertTriangle,
  CheckCircle2,
  Info,
  ExternalLink,
  History,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { analyzeUrlWithAI, type AnalysisResult } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AnalysisStep = 'IDLE' | 'PROCESSING' | 'EXTRACTION' | 'PATTERN_ANALYSIS' | 'PREDICTION' | 'COMPLETED';

export default function App() {
  const [url, setUrl] = useState('');
  const [step, setStep] = useState<AnalysisStep>('IDLE');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{url: string, status: string, score: number}[]>([]);

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url || !url.trim()) return;

    setError(null);
    setResult(null);
    
    setStep('PROCESSING');
    
    try {
      // Start AI Analysis immediately
      const analysisPromise = analyzeUrlWithAI(url);
      
      // Quickly cycle through steps for visual feedback without long delays
      setStep('EXTRACTION');
      await new Promise(r => setTimeout(r, 100));
      setStep('PATTERN_ANALYSIS');
      
      const analysis = await analysisPromise;
      
      setStep('PREDICTION');
      await new Promise(r => setTimeout(r, 100));
      
      setResult(analysis);
      setStep('COMPLETED');
      
      setHistory(prev => [{ url, status: analysis.status, score: analysis.score }, ...prev].slice(0, 5));
    } catch (err) {
      console.error(err);
      setError('Failed to analyze URL. Please check your connection and try again.');
      setStep('IDLE');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SAFE': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'SUSPICIOUS': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'MALICIOUS': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 lg:py-24">
        {/* Header */}
        <header className="mb-16 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-6"
          >
            <Zap size={14} className="fill-emerald-400" />
            INTELLIGENT URL ANALYSIS
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6"
          >
            Veri<span className="text-emerald-500">Web</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl leading-relaxed"
          >
            Evaluate suspicious links before you click. Our AI-driven engine detects phishing, 
            malware, and deceptive patterns in real-time.
          </motion.p>
        </header>

        {/* Search Section */}
        <section className="mb-12">
          <motion.form 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleCheck}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition duration-500" />
            <div className="relative flex items-center bg-[#151518] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="pl-6 text-slate-500">
                <Search size={24} />
              </div>
              <input 
                type="text" 
                placeholder="Paste suspicious link here (e.g., https://example.com)..."
                className="w-full bg-transparent border-none focus:ring-0 py-6 px-4 text-lg text-white placeholder:text-slate-600"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={step !== 'IDLE' && step !== 'COMPLETED'}
              />
              <button 
                type="submit"
                disabled={!url || (step !== 'IDLE' && step !== 'COMPLETED')}
                className="mr-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-black font-bold rounded-xl transition-all flex items-center gap-2 group/btn"
              >
                {step === 'IDLE' || step === 'COMPLETED' ? (
                  <>
                    Analyze <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <Activity size={18} className="animate-spin" />
                )}
              </button>
            </div>
          </motion.form>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="mt-4 text-red-400 text-sm flex items-center gap-2"
            >
              <AlertTriangle size={14} /> {error}
            </motion.p>
          )}
        </section>

        {/* Analysis Progress */}
        <AnimatePresence>
          {step !== 'IDLE' && step !== 'COMPLETED' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
            >
              {[
                { id: 'PROCESSING', label: 'URL Processing', icon: Activity },
                { id: 'EXTRACTION', label: 'Feature Extraction', icon: Lock },
                { id: 'PATTERN_ANALYSIS', label: 'Pattern Analysis', icon: Search },
                { id: 'PREDICTION', label: 'Risk Prediction', icon: Zap },
              ].map((s, i) => {
                const isActive = step === s.id;
                const isPast = ['PROCESSING', 'EXTRACTION', 'PATTERN_ANALYSIS', 'PREDICTION'].indexOf(step) > i;
                
                return (
                  <div 
                    key={s.id}
                    className={cn(
                      "p-4 rounded-xl border transition-all duration-500 flex flex-col gap-3",
                      isActive ? "bg-emerald-500/10 border-emerald-500/30" : 
                      isPast ? "bg-slate-800/50 border-emerald-500/20 opacity-60" : 
                      "bg-slate-900/20 border-white/5 opacity-40"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isActive ? "bg-emerald-500 text-black" : "bg-slate-800 text-slate-400"
                    )}>
                      <s.icon size={18} className={isActive ? "animate-pulse" : ""} />
                    </div>
                    <span className="text-sm font-medium">{s.label}</span>
                    {isActive && (
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="h-full w-1/2 bg-emerald-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {result && step === 'COMPLETED' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Main Score Card */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-[#151518] border border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    {result.status === 'SAFE' && <ShieldCheck size={120} />}
                    {result.status === 'SUSPICIOUS' && <ShieldAlert size={120} />}
                    {result.status === 'MALICIOUS' && <ShieldX size={120} />}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div>
                      <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold mb-4 uppercase tracking-wider",
                        getStatusColor(result.status)
                      )}>
                        {result.status === 'SAFE' && <ShieldCheck size={16} />}
                        {result.status === 'SUSPICIOUS' && <ShieldAlert size={16} />}
                        {result.status === 'MALICIOUS' && <ShieldX size={16} />}
                        {result.status}
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">Security Analysis</h2>
                      <p className="text-slate-400 font-mono text-sm break-all">{url}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="58"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-slate-800"
                          />
                          <motion.circle
                            cx="64"
                            cy="64"
                            r="58"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={364.4}
                            initial={{ strokeDashoffset: 364.4 }}
                            animate={{ strokeDashoffset: 364.4 - (364.4 * result.score) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={getScoreColor(result.score)}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={cn("text-4xl font-bold", getScoreColor(result.score))}>{result.score}</span>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Safety Score</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Info size={14} /> Analysis Summary
                      </h3>
                      <p className="text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                        {result.explanation}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <AlertTriangle size={14} /> Detected Threats
                        </h3>
                        <ul className="space-y-2">
                          {result.threats.map((threat, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                              {threat}
                            </li>
                          ))}
                          {result.threats.length === 0 && (
                            <li className="text-sm text-emerald-400 flex items-center gap-2">
                              <CheckCircle2 size={14} /> No immediate threats detected
                            </li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <ShieldCheck size={14} /> Recommendations
                        </h3>
                        <ul className="space-y-2">
                          {result.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="bg-[#151518] border border-white/10 rounded-3xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <History size={16} /> Recent Scans
                  </h3>
                  <div className="space-y-4">
                    {history.length > 0 ? history.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-white font-mono truncate">{item.url}</p>
                          <p className={cn("text-[10px] font-bold uppercase mt-1", getScoreColor(item.score))}>
                            {item.status} • {item.score}/100
                          </p>
                        </div>
                        <button 
                          onClick={() => { setUrl(item.url); handleCheck(); }}
                          className="ml-2 p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
                        >
                          <Search size={14} />
                        </button>
                      </div>
                    )) : (
                      <p className="text-xs text-slate-600 italic">No recent scans yet.</p>
                    )}
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6">
                  <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                    <Lock size={16} /> Pro Tip
                  </h3>
                  <p className="text-xs text-emerald-400/70 leading-relaxed">
                    Always check for HTTPS and verify the domain name carefully. 
                    Phishing sites often use "look-alike" domains like <span className="font-mono bg-emerald-500/20 px-1">googIe.com</span> instead of <span className="font-mono bg-emerald-500/20 px-1">google.com</span>.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Grid (Static) */}
        {!result && step === 'IDLE' && (
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
          >
            {[
              {
                title: "Real-time Analysis",
                desc: "Get instant results as our engine processes live URL data.",
                icon: Zap,
                color: "text-emerald-400"
              },
              {
                title: "Heuristic Engine",
                desc: "Advanced pattern matching for zero-day phishing detection.",
                icon: Activity,
                color: "text-blue-400"
              },
              {
                title: "Clear Results",
                desc: "No technical jargon. Just clear safety scores and advice.",
                icon: ShieldCheck,
                color: "text-purple-400"
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-[#151518] border border-white/5 hover:border-white/10 transition-colors group">
                <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", feature.color)}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.section>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 mt-24">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Lock size={16} />
            <span>VeriWeb Security Node v1.0.4</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Terms of Service</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm flex items-center gap-1">
              API Docs <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
