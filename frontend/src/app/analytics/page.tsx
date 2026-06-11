// src/app/analytics/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BarChart3, Star, Phone, FileSpreadsheet, CheckCircle2, ArrowRight, Sparkles,
  Award, TrendingUp, Calendar, Users
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackgroundMesh from '@/components/landing/BackgroundMesh';

export default function AnalyticsPage() {
  const router = useRouter();

  // Interactive state
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const competencyMatrix = [
    { name: 'Aarav Mehta', bonding: 'Mastered', forces: 'Needs Work', algebra: 'Mastered' },
    { name: 'Vihaan Sharma', bonding: 'Mastered', forces: 'Mastered', algebra: 'Needs Work' },
    { name: 'Kabir Singh', bonding: 'Remediation', forces: 'Needs Work', algebra: 'Mastered' },
    { name: 'Ananya Iyer', bonding: 'Mastered', forces: 'Mastered', algebra: 'Mastered' }
  ];

  return (
    <div className="min-h-screen bg-[#EEF2F8] text-slate-800 selection:bg-[#10375C]/20 selection:text-[#10375C] font-sans overflow-x-hidden relative flex flex-col justify-between">
      
      {/* Background elements */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#EAF0F8] via-[#EEF2F8] to-[#E6ECF5]" />
      <div className="fixed top-[-25%] left-[-15%] w-[65vw] h-[65vw] rounded-full bg-[#10375C]/[0.065] blur-[130px] pointer-events-none z-0" />
      <div className="fixed top-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-300/[0.07] blur-[110px] pointer-events-none z-0" />
      <div className="fixed bottom-[-15%] left-[15%] w-[70vw] h-[45vw] rounded-full bg-slate-300/[0.05] blur-[150px] pointer-events-none z-0" />
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 85% 80% at 50% 50%, transparent 35%, #EAF0F8 100%)' }} />
      <BackgroundMesh />

      <Navbar />

      {/* Main Content */}
      <main className="flex-1 w-full pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#10375C]/20 bg-[#10375C]/5 text-[#10375C] text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> Analytics Engine
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight"
            >
              Class Diagnostic Analytics
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 text-sm md:text-base max-w-xl mx-auto mt-4 leading-relaxed font-medium"
            >
              Discover how our competency mappings, engagement statistics, class dashboards, and PDF report cards help school districts monitor syllabus mastery.
            </motion.p>
          </div>

          <div className="flex flex-col gap-24">

            {/* ANALYTICS 1: Class Overview & Trend Charts */}
            <div id="class-overview" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text Area */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm">
                    <BarChart3 className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Class Overview Dashboard</h2>
                    <p className="text-emerald-600 text-xs font-semibold mt-0.5">Real-time cohort completion trends & stats</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Class Overview synthesizes student activity into structured data. Track assignment completion rates, score distributions, and time spent on topics, giving educators a real-time dashboard of cohort progress.
                </p>

                <ul className="flex flex-col gap-2 mt-2">
                  {[
                    'Instant assignment submission trackers',
                    'Interactive score distribution trend lines',
                    'Cohort-wide milestone check alerts'
                  ].map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-xs font-medium">
                  <span className="text-[#10375C] font-black uppercase text-[10px] tracking-wider block mb-1">Primary Use Case</span>
                  Checking homework health. Educators review weekly completion graphs to make sure students follow syllabus progress guidelines.
                </div>
              </div>

              {/* Visual Representation Area: Performance Trend Line Chart */}
              <div className="lg:col-span-6 bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-lg relative min-h-[340px] flex flex-col justify-between overflow-hidden">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Class Performance Trend</span>
                  <span className="text-[10px] font-bold bg-emerald-50 border border-emerald-100 text-emerald-600 px-2 py-0.5 rounded flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Average +4.2%
                  </span>
                </div>

                {/* SVG trend chart */}
                <div className="flex-1 flex flex-col justify-center gap-4 relative z-10">
                  <div className="h-32 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="analyticsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10375C" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="#10375C" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="15" x2="200" y2="15" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3,3" />
                      <line x1="0" y1="35" x2="200" y2="35" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3,3" />
                      <line x1="0" y1="55" x2="200" y2="55" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3,3" />
                      <path d="M 0,50 C 40,40 60,45 85,25 C 110,5 140,20 170,10 L 200,5 L 200,60 L 0,60 Z" fill="url(#analyticsAreaGrad)" />
                      <motion.path 
                        d="M 0,50 C 40,40 60,45 85,25 C 110,5 140,20 170,10 L 200,5" 
                        fill="none" 
                        stroke="#10375C" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: 'easeOut' }}
                      />
                      <circle cx="85" cy="25" r="3" fill="#10375C" />
                      <circle cx="170" cy="10" r="3" fill="#10375C" />
                      <circle cx="200" cy="5" r="3" fill="#10375C" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[8px] uppercase tracking-wider text-slate-450 font-bold px-1 mt-1">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ANALYTICS 2: Competency Mapping */}
            <div id="competency-mapping" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Visual Representation Area (Left for alternate balance): Competency Matrix */}
              <div className="lg:col-span-6 bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-lg relative min-h-[340px] flex flex-col justify-between overflow-hidden order-last lg:order-first">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Class Mastery Matrix</span>
                  <span className="text-[10px] font-bold bg-[#10375C]/5 border border-[#10375C]/15 text-[#10375C] px-2 py-0.5 rounded">NCERT Nodes</span>
                </div>

                {/* Grid matrix table */}
                <div className="flex-1 flex flex-col justify-center relative z-10">
                  <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm text-[9px]">
                    <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200 py-2.5 px-3 font-bold text-slate-700 uppercase tracking-wider text-[8px]">
                      <span>Student</span>
                      <span>Chemicals</span>
                      <span>Dynamics</span>
                      <span>Algebra</span>
                    </div>
                    
                    <div className="flex flex-col">
                      {competencyMatrix.map((row, idx) => (
                        <div key={idx} className="grid grid-cols-4 border-b border-slate-100 last:border-b-0 py-2.5 px-3 items-center text-slate-800 font-semibold">
                          <span className="truncate pr-1">{row.name}</span>
                          <div>
                            <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold ${
                              row.bonding === 'Mastered' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>{row.bonding}</span>
                          </div>
                          <div>
                            <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold ${
                              row.forces === 'Mastered' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                            }`}>{row.forces}</span>
                          </div>
                          <div>
                            <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold ${
                              row.algebra === 'Mastered' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                            }`}>{row.algebra}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Area */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-yellow-50 border border-yellow-100 text-yellow-500 shadow-sm">
                    <Star className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Competency Mapping Node</h2>
                    <p className="text-yellow-600 text-xs font-semibold mt-0.5">Granular subject competency & skill metrics tracking</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Competency Mapping breaks subjects into modular skills. As students complete assignments, the engine updates their skill masteries, highlighting which concepts are fully locked in and where gaps persist.
                </p>

                <ul className="flex flex-col gap-2 mt-2">
                  {[
                    'Granular skill-threshold node logs',
                    'Automatic Board guidelines mapping rules',
                    'Competency remediation pathways creation'
                  ].map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-xs font-medium">
                  <span className="text-[#10375C] font-black uppercase text-[10px] tracking-wider block mb-1">Primary Use Case</span>
                  Individual diagnostic reports. Discover that Aarav requires Redox help before board tests, setting up custom homework nodes.
                </div>
              </div>
            </div>

            {/* ANALYTICS 3: Engagement Stats */}
            <div id="engagement-stats" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text Area */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-500 shadow-sm">
                    <Phone className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Study Engagement Logs</h2>
                    <p className="text-blue-500 text-xs font-semibold mt-0.5">Track active practice cycles and query counts</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Engagement Stats trace active study habits, detailing when and how students practice. Analyze active hours, tutor query frequency, and question review cycles to identify habits that drive success.
                </p>

                <ul className="flex flex-col gap-2 mt-2">
                  {[
                    'Daily active-hour logging trends',
                    'Interactive quiz attempts metrics tracking',
                    'Tutor sessions query counts'
                  ].map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-xs font-medium">
                  <span className="text-[#10375C] font-black uppercase text-[10px] tracking-wider block mb-1">Primary Use Case</span>
                  Parent check-ins. Review pupil study schedules and active tutor hours to suggest reinforcement tips at home.
                </div>
              </div>

              {/* Visual Representation Area: Engagement Bar Chart */}
              <div className="lg:col-span-6 bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-lg relative min-h-[340px] flex flex-col justify-between overflow-hidden">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Weekly Active Practice Hours</span>
                  <span className="text-[10px] font-bold bg-blue-50 border border-blue-100 text-blue-600 px-2 py-0.5 rounded">Weekly Cycles</span>
                </div>

                {/* SVG bar chart */}
                <div className="flex-1 flex flex-col justify-center gap-4 relative z-10 px-2">
                  <div className="h-28 w-full flex items-end justify-between gap-3 border-b border-slate-200 pb-1">
                    {[
                      { day: 'Mon', hrs: '2.5h', ht: '55%', active: false },
                      { day: 'Tue', hrs: '4.2h', ht: '85%', active: true },
                      { day: 'Wed', hrs: '1.8h', ht: '38%', active: false },
                      { day: 'Thu', hrs: '3.0h', ht: '65%', active: false },
                      { day: 'Fri', hrs: '2.1h', ht: '46%', active: false }
                    ].map((bar, idx) => (
                      <div 
                        key={idx} 
                        className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group"
                        onMouseEnter={() => setHoveredMetric(bar.day)}
                        onMouseLeave={() => setHoveredMetric(null)}
                      >
                        <div className="relative w-full flex justify-center">
                          {hoveredMetric === bar.day && (
                            <span className="absolute -top-7 text-[8px] bg-slate-950 text-white font-bold px-1.5 py-0.5 rounded shadow-md pointer-events-none z-10 whitespace-nowrap">
                              {bar.hrs}
                            </span>
                          )}
                          <div 
                            style={{ height: bar.ht }} 
                            className={`w-full rounded-t-lg transition-all duration-300 ${
                              bar.active 
                                ? 'bg-[#10375C]' 
                                : 'bg-slate-200 hover:bg-[#10375C]/60'
                            }`} 
                          />
                        </div>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ANALYTICS 4: Parent Reports */}
            <div id="parent-reports" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Visual Representation Area: Report Document (Left for balance) */}
              <div className="lg:col-span-6 bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-lg relative min-h-[340px] flex flex-col justify-between overflow-hidden order-last lg:order-first">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">PDF Report Card Template</span>
                  <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-650 px-2 py-0.5 rounded flex items-center gap-1">
                    <FileSpreadsheet className="w-2.5 h-2.5" /> Printable
                  </span>
                </div>

                {/* Report sheet representation */}
                <div className="flex-1 flex items-center justify-center relative z-10">
                  <div className="w-[200px] h-[220px] bg-white border border-slate-250 rounded-2xl shadow-xl p-3 flex flex-col justify-between font-sans">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Users className="w-3 h-3 text-slate-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-extrabold text-slate-900">Competency Report Card</span>
                        <span className="text-[5px] text-slate-450 font-semibold mt-0.5">Student Profile: Aarav Mehta</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 my-2 text-[6.5px] text-slate-650 font-semibold leading-relaxed">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-1">
                        <span>Core Chapter Mastery:</span>
                        <span className="text-emerald-600 font-bold">88% (Excellent)</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-50 pb-1">
                        <span>Assigned Worksheet Counts:</span>
                        <span className="text-slate-800 font-bold">12 Compositions</span>
                      </div>
                      <p className="text-[5.5px] leading-relaxed text-slate-400 font-medium italic mt-1">
                        "Teacher Note: Aarav demonstrates solid comprehension of basic equations but requires reinforcement in dynamics calculations."
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-[6px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Generated via classPlus</span>
                      <span className="text-[#10375C] font-black">2026 Metrics</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Area */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-500 shadow-sm">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Automated Parent Reports</h2>
                    <p className="text-indigo-500 text-xs font-semibold mt-0.5">Printable diagnostic summaries designed for families</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Parent Reports compile student achievements, current strengths, and specific learning gaps into simple, qualitative sheets. Print or email reports to foster clear alignment between schools and homes.
                </p>

                <ul className="flex flex-col gap-2 mt-2">
                  {[
                    'Parent-friendly visual mastery charts',
                    'Qualitative performance summaries',
                    'Downloadable PDF sheets for PTM sessions'
                  ].map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-xs font-medium">
                  <span className="text-[#10375C] font-black uppercase text-[10px] tracking-wider block mb-1">Primary Use Case</span>
                  Parent-Teacher Meetings. Print formatted reports mapping students' strengths and areas needing focus before term finals.
                </div>
              </div>
            </div>

          </div>

          {/* CTA Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-28 text-center bg-[#10375C] rounded-3xl p-8 md:p-14 text-white shadow-xl shadow-[#10375C]/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#10375C] via-[#0d2f4f] to-[#10375C]" />
            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center gap-4">
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Unlock Deep Diagnostic Data</h2>
              <p className="text-slate-350 text-xs md:text-sm leading-relaxed">
                Connect classroom performance directly to curriculum milestones and parent feedback loops.
              </p>
              <button
                onClick={() => router.push('/sign-up')}
                className="mt-4 px-6 py-3 rounded-full text-xs font-bold bg-white text-[#10375C] hover:bg-slate-50 shadow-md flex items-center gap-2 active:scale-95 transition-all"
              >
                <span>Access Analytics Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
