// src/app/billing/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PillButton } from '@/components/shared/PillButton';
import { CreditCard, Check, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { useUser } from '@clerk/nextjs';
import { getUserProfile, upgradeUserPlan, UserProfile } from '@/lib/api';

export default function BillingPage() {
  const { addToast } = useToastStore();
  const { user: clerkUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch billing profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clerkUser) {
      fetchProfile();
    }
  }, [clerkUser]);

  const handleUpgrade = async (planName: string) => {
    if (profile?.plan === planName) {
      addToast(`You are already subscribed to the ${planName} plan.`, 'info');
      return;
    }

    try {
      setUpgradingPlan(planName);
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const updatedProfile = await upgradeUserPlan(planName);
      setProfile(updatedProfile);
      addToast(`Successfully upgraded to the ${planName} plan!`, 'success');
    } catch (err) {
      console.error('Failed to upgrade plan:', err);
      addToast('Failed to complete subscription upgrade.', 'error');
    } finally {
      setUpgradingPlan(null);
    }
  };

  // Safe variables with fallbacks
  const currentPlan = profile?.plan || 'Free Trial';
  const creditsUsed = profile?.creditsUsed || 0;
  const creditsLimit = profile?.creditsLimit || 10;
  const usagePercentage = Math.min(100, Math.round((creditsUsed / creditsLimit) * 100));

  const pricingTiers = [
    {
      name: 'Free Trial',
      price: '$0',
      period: 'forever',
      description: 'Test classPlus capabilities with mock elements.',
      features: [
        'Up to 10 total assignments',
        'Standard generation speed',
        'Strict NCERT constraints',
        'Standard PDF exports',
        'Basic classroom groups'
      ],
      color: 'border-gray-200 hover:border-gray-300',
      btnVariant: 'outline' as const,
      btnText: 'Current Plan'
    },
    {
      name: 'Pro Teacher',
      price: '$15',
      period: 'per month',
      description: 'Empower individual teachers with extensive AI generation.',
      features: [
        'Up to 500 assignments/month',
        'Priority generation queues',
        'Gemini 1.5 Pro reasoning engine',
        'Premium formatted PDF exports',
        'Unlimited student groups',
        'Custom template saving'
      ],
      color: 'border-classplus-orange shadow-md relative ring-2 ring-classplus-orange ring-opacity-20',
      btnVariant: 'primary' as const,
      btnText: 'Upgrade to Pro',
      badge: 'Most Popular'
    },
    {
      name: 'School Enterprise',
      price: '$99',
      period: 'per month',
      description: 'Unlimited volume and centralized controls for departments.',
      features: [
        'Unlimited assignments',
        'Zero-rate-limit access',
        'Co-pilot sharing and shared library',
        'Custom school branding on PDF exams',
        'Consolidated billing department billing',
        '24/7 dedicated support representative'
      ],
      color: 'border-gray-200 hover:border-gray-300',
      btnVariant: 'outline' as const,
      btnText: 'Contact Sales / Enterprise'
    }
  ];

  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-16 px-[2px] relative z-10">
        
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-bold text-classplus-text-primary flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-700" />
            <span>Billing & Subscription</span>
          </h2>
          <p className="text-[13px] text-classplus-text-secondary">
            Manage your classPlus subscription plan, track your assignment usage limits, and view pricing options.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-classplus-orange animate-spin" />
            <p className="text-sm text-classplus-text-secondary font-medium">Loading subscription details...</p>
          </div>
        ) : (
          <>
            {/* Usage Summary Card */}
            <div className="bg-white border border-classplus-card-border rounded-xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex flex-col gap-3 w-full md:w-3/5">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Current Active Plan</span>
                  <span className="bg-orange-50 text-classplus-orange text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-100 flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" />
                    {currentPlan}
                  </span>
                </div>
                
                {/* Credit usage bar */}
                <div className="flex flex-col gap-1.5 font-sans">
                  <div className="flex justify-between text-xs text-classplus-text-primary font-bold">
                    <span>Assignment Consumption Limit</span>
                    <span>{creditsUsed} / {creditsLimit === 9999 ? '∞' : creditsLimit} created</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#10375C] h-full rounded-full transition-all duration-500"
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-classplus-text-secondary">
                    {creditsLimit === 9999 
                      ? 'You have unlimited assignment generation capabilities under your Enterprise account.'
                      : `Your consumption rate is at ${usagePercentage}% of your total allocated monthly credits.`}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-classplus-card-border rounded-lg p-4 flex flex-col gap-1.5 w-full md:w-auto font-sans text-xs">
                <div className="flex justify-between gap-6">
                  <span className="text-gray-500 font-semibold">Payment Status:</span>
                  <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                    <Check className="w-3.5 h-3.5" />
                    Good Standing
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-gray-500 font-semibold">Billing Cycle:</span>
                  <span className="text-classplus-text-primary font-medium">Monthly Renewal</span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-gray-500 font-semibold">Next Invoice Date:</span>
                  <span className="text-classplus-text-primary font-medium">June 26, 2026</span>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="flex flex-col gap-4 mt-2">
              <h3 className="text-sm font-extrabold text-classplus-text-primary">Available Plans & Upgrades</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pricingTiers.map((tier) => {
                  const isCurrent = currentPlan === tier.name;
                  const isUpgrading = upgradingPlan === tier.name;

                  return (
                    <div 
                      key={tier.name}
                      className={`bg-white border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 ${tier.color}`}
                    >
                      <div>
                        {tier.badge && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-classplus-orange text-white text-[10px] uppercase font-black px-3 py-1 rounded-full shadow-sm tracking-wider">
                            {tier.badge}
                          </span>
                        )}
                        
                        <div className="flex flex-col gap-1 mb-4 font-sans">
                          <h4 className="text-sm font-bold text-classplus-text-primary">{tier.name}</h4>
                          <p className="text-[11px] text-classplus-text-secondary leading-relaxed min-h-[32px]">{tier.description}</p>
                          <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-2xl font-black text-classplus-text-primary">{tier.price}</span>
                            <span className="text-[11px] text-classplus-text-secondary">/ {tier.period}</span>
                          </div>
                        </div>

                        {/* Feature list */}
                        <ul className="flex flex-col gap-2 mb-6 font-sans text-xs text-classplus-text-primary">
                          {tier.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-snug">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <PillButton
                        variant={isCurrent ? 'outline' : tier.btnVariant}
                        className="w-full text-xs !py-2.5 flex items-center justify-center gap-1.5"
                        disabled={isCurrent || isUpgrading || upgradingPlan !== null}
                        onClick={() => handleUpgrade(tier.name)}
                      >
                        {isUpgrading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <span>{isCurrent ? 'Active Plan' : tier.btnText}</span>
                        )}
                      </PillButton>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Safety / Compliance Banner */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3 mt-2">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5 font-sans text-xs">
                <span className="font-bold text-amber-900">Developer Sandbox Simulated Billing</span>
                <p className="text-amber-800 leading-relaxed text-[11px]">
                  This app is running in developer preview mode. Upgrading plans is fully functional but simulated—no actual credit cards or charges will be processed, allowing you to test limits instantly.
                </p>
              </div>
            </div>
          </>
        )}

      </div>
    </AppShell>
  );
}
