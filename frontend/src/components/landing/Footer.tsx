// src/components/landing/Footer.tsx
'use client';

import React from 'react';
import { Sparkles, MessageSquare, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Footer() {
  const router = useRouter();

  const productLinks = ['Features', 'AI Assistant', 'Assignments', 'Analytics', 'Pricing'];
  const companyLinks = ['About Us', 'Blog', 'Careers', 'Partners', 'Press Kit'];
  const supportLinks = ['Help Center', 'Tech Support', 'Safety Guide', 'Contact Us'];
  const legalLinks = ['Terms of Service', 'Privacy Policy', 'Data Protection', 'Security'];

  return (
    <footer className="w-full bg-white border-t border-slate-200 pt-20 pb-10 px-6 relative z-10 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-6 gap-10">
        
        {/* Brand Column (Span 2) */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <div 
            onClick={() => router.push('/')} 
            className="flex items-center gap-2 cursor-pointer group self-start"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/10">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-sans font-bold text-lg text-slate-900 group-hover:text-orange-500 transition-colors">
              VedAI
            </span>
          </div>
          <p className="text-slate-550 text-xs leading-relaxed max-w-sm">
            VedAI is an advanced, curriculum-aligned artificial intelligence assistant built to help teachers design assignments, auto-evaluate student works, and build intelligent learning paths.
          </p>
          
          {/* Social icons */}
          <div className="flex gap-4 mt-2">
            <a href="#" className="p-2 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
            <a href="#" className="p-2 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/></svg>
            </a>
            <a href="#" className="p-2 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="#" className="p-2 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all shadow-sm">
              <MessageSquare className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Links Column 1: Product */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Product</h4>
          <div className="flex flex-col gap-2">
            {productLinks.map((link) => (
              <a key={link} href="#" className="text-slate-500 hover:text-slate-950 text-xs transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>

        {/* Links Column 2: Company */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Company</h4>
          <div className="flex flex-col gap-2">
            {companyLinks.map((link) => (
              <a key={link} href="#" className="text-slate-500 hover:text-slate-950 text-xs transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>

        {/* Links Column 3: Support */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Support</h4>
          <div className="flex flex-col gap-2">
            {supportLinks.map((link) => (
              <a key={link} href="#" className="text-slate-500 hover:text-slate-950 text-xs transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>

        {/* Newsletter Signup (Span 1) */}
        <div className="flex flex-col gap-4 md:col-span-1">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Newsletter</h4>
          <p className="text-slate-500 text-xs leading-relaxed">
            Get the latest features and pedagogical resources.
          </p>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1.5 shadow-inner">
            <input 
              type="email" 
              placeholder="Your email" 
              className="bg-transparent border-0 outline-none text-xs text-slate-800 placeholder-slate-400 w-full px-2 py-1"
            />
            <button className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors shadow-sm shadow-orange-500/10">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Sub Footer */}
      <div className="max-w-6xl mx-auto border-t border-slate-100 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-[10px] text-slate-400">
          © {new Date().getFullYear()} VedAI Inc. All rights reserved. Designed for startup environments.
        </span>
        <div className="flex gap-4">
          {legalLinks.map((link) => (
            <a key={link} href="#" className="text-[10px] text-slate-400 hover:text-slate-700 transition-colors">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
