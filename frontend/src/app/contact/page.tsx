// src/app/contact/page.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Award, MessageSquare, Send, CheckCircle2, PhoneCall, Sparkles,
  ChevronRight, Calendar, UserCheck
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackgroundMesh from '@/components/landing/BackgroundMesh';

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeChannel, setActiveChannel] = useState('demo');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    role: 'Teacher',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const contactChannels = [
    {
      id: 'demo',
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Schedule a Demo',
      desc: 'Book a 1-on-1 walkthrough session with an onboarding expert.',
      info: 'demos@classpilot.io',
      color: 'text-purple-500 bg-purple-50 border-purple-100'
    },
    {
      id: 'support',
      icon: <Mail className="w-5 h-5" />,
      title: 'Support Helpdesk',
      desc: 'Got billing questions, login issues, or require assistance?',
      info: 'support@classpilot.io',
      color: 'text-blue-500 bg-blue-50 border-blue-100'
    },
    {
      id: 'partner',
      icon: <Award className="w-5 h-5" />,
      title: 'School Partnerships',
      desc: 'Pilot ClassPilot across your school district or campus network.',
      info: 'partnerships@classpilot.io',
      color: 'text-[#10375C] bg-slate-50 border-slate-200'
    }
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
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#10375C]/20 bg-[#10375C]/5 text-[#10375C] text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Reach Out
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight"
            >
              Get in Touch
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 text-sm md:text-base max-w-xl mx-auto mt-4 leading-relaxed font-medium"
            >
              Have questions about features, pricing plans, or pilot setups? Contact our support and partnership teams directly.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left side: Inquiry Form */}
            <div className="lg:col-span-7 rounded-3xl bg-white/70 backdrop-blur-md border border-slate-200/80 p-8 shadow-lg relative overflow-hidden min-h-[440px] flex flex-col justify-between">
              
              <AnimatePresence mode="wait">
                {formSubmitted ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-14 flex flex-col items-center gap-4 my-auto"
                  >
                    <div className="p-4 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm flex-shrink-0 animate-bounce">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Message Received!</h2>
                    <p className="text-slate-500 text-xs md:text-sm max-w-sm leading-relaxed font-medium">
                      Thank you for contacting ClassPilot. Our partnership support team will review your details and follow up within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    onSubmit={handleSubmit} 
                    className="flex flex-col gap-5 flex-1"
                  >
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-[#10375C]" /> Submit Inquiry
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase font-bold tracking-wider text-slate-450">Name</label>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required 
                          placeholder="Your full name"
                          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#10375C] shadow-sm transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase font-bold tracking-wider text-slate-450">Email Address</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required 
                          placeholder="you@school.edu"
                          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#10375C] shadow-sm transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase font-bold tracking-wider text-slate-450">School / District</label>
                        <input 
                          type="text" 
                          name="school"
                          value={formData.school}
                          onChange={handleInputChange}
                          required 
                          placeholder="School name"
                          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#10375C] shadow-sm transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase font-bold tracking-wider text-slate-450">Your Role</label>
                        <select 
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#10375C] shadow-sm transition-all cursor-pointer font-bold"
                        >
                          <option>Teacher</option>
                          <option>Administrator</option>
                          <option>Principal / Director</option>
                          <option>Parent</option>
                          <option>Student</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-slate-450">Inquiry Message</label>
                      <textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required 
                        rows={5}
                        placeholder="Describe your school's needs or the support you require..."
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#10375C] shadow-sm transition-all resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="mt-2 w-full py-3 rounded-2xl text-xs font-bold bg-[#10375C] hover:bg-[#0d2f4f] text-white shadow-md shadow-[#10375C]/20 hover:shadow-[#10375C]/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Submit Details</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Right side: Core Channels */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="flex flex-col gap-2 mb-2">
                <h3 className="text-lg font-bold text-slate-900">Direct Contact Hub</h3>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">
                  Select a contact target category to focus communication channels dynamically.
                </p>
              </div>

              {contactChannels.map((channel) => {
                const isActive = activeChannel === channel.id;
                
                return (
                  <div 
                    key={channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                    className={`p-5 rounded-2xl border flex items-start gap-4 shadow-sm cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-white border-[#10375C] shadow-md shadow-[#10375C]/5' 
                        : 'bg-white/50 hover:bg-white border-slate-200'
                    }`}
                  >
                    <div className={`p-3 rounded-xl border flex-shrink-0 shadow-sm transition-transform ${channel.color} ${
                      isActive ? 'scale-110' : ''
                    }`}>
                      {channel.icon}
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-slate-900">{channel.title}</h4>
                        {isActive && <ChevronRight className="w-4 h-4 text-[#10375C]" />}
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed font-medium">{channel.desc}</p>
                      
                      {isActive && (
                        <motion.span 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-xs font-bold text-[#10375C] mt-2 block select-all cursor-pointer border-t border-slate-100 pt-2 flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5" /> {channel.info}
                        </motion.span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
