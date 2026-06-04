// src/components/landing/PricingSection.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Free Trial',
      desc: 'Perfect for trying out VedAI worksheets.',
      price: { monthly: 0, annual: 0 },
      features: [
        '10 AI credits limit',
        '4 active worksheets per month',
        'Standard AI Models',
        'Basic classroom reports',
        'Community support'
      ],
      cta: 'Get Started Free',
      highlighted: false
    },
    {
      name: 'Teacher Pro',
      desc: 'Unlimited power for professional educators.',
      price: { monthly: 24, annual: 18 },
      features: [
        'Unlimited AI worksheets',
        'Advanced AI Models (Premium)',
        'Full classroom analytics & reports',
        'Instant Auto-grading engine',
        'PDF & Microsoft Word exports',
        '24/7 Priority email support'
      ],
      cta: 'Upgrade to Pro',
      highlighted: true,
      badge: 'Best Value'
    },
    {
      name: 'School Plan',
      desc: 'Institutional control for schools & districts.',
      price: { monthly: 'Custom', annual: 'Custom' },
      features: [
        'Unlimited credits for all teachers',
        'Central administrative dashboard',
        'Custom curriculum alignments',
        'Google Classroom integration',
        'Dedicated success partner',
        'SSO/SAML integration & SLA'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ];

  return (
    <section className="py-24 px-6 max-w-6xl mx-auto z-10 relative font-sans">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-4 mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
          Simple, Transparent Pricing
        </h2>
        <p className="text-slate-500 max-w-xl text-sm md:text-base leading-relaxed">
          No hidden fees. Choose a plan that fits your classroom or institution. Cancel anytime.
        </p>

        {/* Toggle Switch */}
        <div className="flex items-center gap-3 mt-6 bg-slate-100 border border-slate-200 p-1 rounded-full shadow-inner">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all relative ${
              billingPeriod === 'monthly' ? 'text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {billingPeriod === 'monthly' && (
              <motion.div 
                layoutId="activeBillingLight"
                className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full z-0" 
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            <span className="relative z-10">Monthly</span>
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all relative flex items-center gap-1.5 ${
              billingPeriod === 'annual' ? 'text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {billingPeriod === 'annual' && (
              <motion.div 
                layoutId="activeBillingLight"
                className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full z-0"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            <span className="relative z-10">Annually</span>
            <span className="relative z-10 text-[9px] bg-emerald-500/15 text-emerald-600 px-1.5 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase">
              Save 25%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, index) => {
          const isCustom = typeof plan.price[billingPeriod] === 'string';
          
          return (
            <motion.div
              key={index}
              whileHover={{ y: -6 }}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                plan.highlighted 
                  ? 'bg-white border-2 border-orange-500 shadow-xl shadow-orange-500/5' 
                  : 'bg-white/60 border border-slate-200/80 hover:border-slate-300 shadow-md shadow-slate-100/50'
              }`}
            >
              {/* Highlight background glow */}
              {plan.highlighted && (
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />
              )}

              {/* Header section */}
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  {plan.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 border border-orange-500/20 uppercase tracking-wide flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-orange-600" /> {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs mt-2">{plan.desc}</p>
                
                {/* Price Display */}
                <div className="my-6 flex items-baseline gap-1 text-slate-900">
                  <span className="text-3xl md:text-4xl font-extrabold">
                    {isCustom ? '' : '$'}
                    {plan.price[billingPeriod]}
                  </span>
                  {!isCustom && (
                    <span className="text-slate-400 text-xs">/month</span>
                  )}
                </div>

                <div className="w-full h-px bg-slate-200 my-6" />

                {/* Features List */}
                <div className="flex flex-col gap-3.5">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-xs text-slate-650 leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call To Action */}
              <button
                className={`w-full py-3.5 rounded-2xl text-xs font-semibold mt-8 transition-all active:scale-95 ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-400 hover:via-orange-550 hover:to-amber-400 text-white shadow-md shadow-orange-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80'
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
