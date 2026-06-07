// src/app/pricing/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, ArrowRight, Sparkles, Tag, Laptop, ShieldCheck, Check, X 
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackgroundMesh from '@/components/landing/BackgroundMesh';

export default function PricingPage() {
  const router = useRouter();

  // Billing Cycle State
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const plans = [
    {
      id: 'free',
      icon: <Tag className="w-8 h-8 text-green-500" />,
      title: 'Free Explorer',
      tagline: 'Get started with core AI helper tools.',
      price: { monthly: '0', annual: '0' },
      period: 'forever',
      desc: 'Perfect for individual educators looking to test out automated worksheet generation and the basic concept explainer.',
      features: [
        '5 AI generated worksheets per month',
        'Basic multi-format composer templates',
        'Standard interactive student tutor chat',
        'PDF worksheet downloads with watermarks',
        'Standard email tech support response'
      ],
      cta: 'Sign Up Free',
      ctaRoute: '/sign-up',
      highlighted: false,
      color: 'border-slate-200 hover:border-slate-300'
    },
    {
      id: 'pro',
      icon: <Sparkles className="w-8 h-8 text-orange-500" />,
      title: 'Teacher Pro',
      tagline: 'Unlimited generation and advanced analytics.',
      price: { monthly: '19', annual: '15' },
      period: 'month',
      desc: 'Designed for active teachers seeking unlimited question generation, board exam preps, and full gap diagnostic mapping.',
      features: [
        'Unlimited AI worksheet generations',
        'CBSE and Board prep template formats',
        'Priority model speeds and high-cap tokens',
        'Full competency gap mapping dashboards',
        'PDF exports without watermarks',
        'Automated qualitative parent report sheets'
      ],
      cta: 'Start Pro Free Trial',
      ctaRoute: '/sign-up',
      highlighted: true,
      badge: 'Best Value',
      color: 'border-[#10375C] shadow-xl shadow-[#10375C]/10'
    },
    {
      id: 'school',
      icon: <Laptop className="w-8 h-8 text-blue-500" />,
      title: 'School License',
      tagline: 'Custom administrative systems for school districts.',
      price: { monthly: 'Custom', annual: 'Custom' },
      period: 'tailored pricing',
      desc: 'Engineered for schools and educational networks requiring full administrative visibility, shared template libraries, and custom integrations.',
      features: [
        'Shared group libraries for team teachers',
        'Central administrative analytics dashboard',
        'Single Sign-On (SSO) & school database syncs',
        'Custom template tuning and branding headers',
        'Dedicated account manager and training hours',
        'Priority SLA tech assistance support'
      ],
      cta: 'Contact Sales',
      ctaRoute: '/contact',
      highlighted: false,
      color: 'border-slate-200 hover:border-[#10375C]/30'
    }
  ];

  const comparisonFeatures = [
    { name: 'AI generated sheets', free: '5 / month', pro: 'Unlimited', school: 'Unlimited' },
    { name: 'Composite question layouts', free: 'Basic Templates', pro: 'All Formats', school: 'Custom Tuning' },
    { name: 'AI Tutor Chat logs', free: 'Standard', pro: 'Priority / High Token', school: 'Custom limits' },
    { name: 'CBSE / NCERT boards format', free: false, pro: true, school: true },
    { name: 'PDF export brand locks', free: 'Watermarked', pro: 'Branded', school: 'Custom headers' },
    { name: 'Central diagnostic charts', free: false, pro: true, school: true },
    { name: 'Shared libraries for teachers', free: false, pro: false, school: true },
    { name: 'District SSO & syncs', free: false, pro: false, school: true }
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
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#10375C]/20 bg-[#10375C]/5 text-[#10375C] text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Pricing Options
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight"
            >
              Simple, Transparent Pricing
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 text-sm md:text-base max-w-xl mx-auto mt-4 leading-relaxed font-medium"
            >
              Select the plan that fits your classroom or school district. Start with a free trial and upgrade anytime.
            </motion.p>
          </div>

          {/* Billing Cycle Toggle Switch */}
          <div className="flex justify-center items-center gap-3.5 mb-14">
            <span className={`text-xs font-bold transition-colors ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-450'}`}>Monthly Billing</span>
            <button 
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
              className="w-12 h-6.5 rounded-full bg-[#10375C] p-1 flex items-center transition-all cursor-pointer shadow-inner"
            >
              <motion.div 
                layout
                className="w-4.5 h-4.5 rounded-full bg-white shadow-sm"
                style={{
                  marginLeft: billingCycle === 'annual' ? 'auto' : '0px'
                }}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold transition-colors ${billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-450'}`}>Annual Billing</span>
              <span className="text-[8px] font-black text-white bg-emerald-500 border border-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce">
                Save 20%
              </span>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
            {plans.map((plan) => {
              const displayPrice = billingCycle === 'annual' ? plan.price.annual : plan.price.monthly;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`p-8 rounded-3xl bg-white/70 backdrop-blur-md border hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden group ${plan.color}`}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 right-0 left-0 h-1.5 bg-[#10375C]" />
                  )}
                  
                  {/* Header */}
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex-shrink-0">
                        {plan.icon}
                      </div>
                      {plan.badge && (
                        <span className="text-[9px] font-black text-white bg-[#10375C] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <div className="mt-2">
                      <h2 className="text-xl font-bold text-slate-900">{plan.title}</h2>
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed font-medium">{plan.tagline}</p>
                    </div>

                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="text-3xl md:text-4xl font-extrabold text-slate-900">
                        {displayPrice !== 'Custom' && '$'}{displayPrice}
                      </span>
                      <span className="text-slate-450 text-[10px] font-bold uppercase tracking-wider">
                        / {plan.period}
                      </span>
                    </div>

                    <p className="text-slate-600 text-xs mt-3 leading-relaxed border-t border-slate-100 pt-4">
                      {plan.desc}
                    </p>
                  </div>

                  {/* Features Checklist */}
                  <div className="mt-6 flex-1 flex flex-col gap-3">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Includes</h3>
                    <ul className="flex flex-col gap-2.5">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-slate-600 text-[11px] font-semibold leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => router.push(plan.ctaRoute)}
                    className={`mt-8 w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                      plan.highlighted
                        ? 'bg-[#10375C] hover:bg-[#0d2f4f] text-white shadow-md shadow-[#10375C]/20'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm'
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                </motion.div>
              );
            })}
          </div>

          {/* Features Comparison Matrix */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-md border border-slate-200 p-6 md:p-8 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-wider text-center md:text-left">Detailed Plan Matrix</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="border-b border-slate-250 py-3 text-[8px] uppercase tracking-wider text-slate-450 font-bold">
                    <th className="pb-3 pr-4">Features Capabilities</th>
                    <th className="pb-3 px-3">Free Explorer</th>
                    <th className="pb-3 px-3">Teacher Pro</th>
                    <th className="pb-3 px-3">School License</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                  {comparisonFeatures.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3.5 pr-4 text-slate-900">{row.name}</td>
                      <td className="py-3.5 px-3">
                        {typeof row.free === 'string' ? row.free : row.free ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-slate-300" />}
                      </td>
                      <td className="py-3.5 px-3">
                        {typeof row.pro === 'string' ? row.pro : row.pro ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-slate-300" />}
                      </td>
                      <td className="py-3.5 px-3">
                        {typeof row.school === 'string' ? row.school : row.school ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-slate-300" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
