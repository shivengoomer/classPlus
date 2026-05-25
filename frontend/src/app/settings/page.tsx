// src/app/settings/page.tsx
'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PillButton } from '@/components/shared/PillButton';
import { Settings, User, School, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@dpsbokaro.edu.in',
    role: 'Senior Science Teacher'
  });

  const [school, setSchool] = useState({
    name: 'Delhi Public School',
    branch: 'Bokaro Steel City, Sector-4',
    code: 'CBSE-3430015'
  });

  const [model, setModel] = useState({
    selectedModel: 'gemini-1.5-flash',
    strictNCERT: true,
    creativity: 0.2 // low creativity for exams, factual
  });

  const handleSave = (section: string) => {
    alert(`Successfully saved ${section} configuration settings.`);
  };

  return (
    <AppShell>
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 pb-16">
        
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-bold text-veda-text-primary flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-700" />
            <span>Settings</span>
          </h2>
          <p className="text-[13px] text-veda-text-secondary">
            Configure your personal profile details, school organization information, and AI generation parameters.
          </p>
        </div>

        {/* Section 1: Teacher Profile Details */}
        <div className="bg-white border border-veda-card-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-5 py-4 border-b border-veda-card-border flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-veda-text-primary">
              Teacher Profile Details
            </h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-500">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="border border-veda-card-border p-2.5 rounded-lg text-veda-text-primary outline-none focus:border-gray-400 font-sans"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-500">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="border border-veda-card-border p-2.5 rounded-lg text-veda-text-primary outline-none focus:border-gray-400 font-sans"
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-semibold text-gray-500">Professional Role</label>
              <input
                type="text"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                className="border border-veda-card-border p-2.5 rounded-lg text-veda-text-primary outline-none focus:border-gray-400 font-sans w-full"
              />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <PillButton
                variant="primary"
                className="text-xs !py-2"
                onClick={() => handleSave('Profile')}
              >
                Save Profile
              </PillButton>
            </div>
          </div>
        </div>

        {/* Section 2: School Organization Settings */}
        <div className="bg-white border border-veda-card-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-5 py-4 border-b border-veda-card-border flex items-center gap-2">
            <School className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-veda-text-primary">
              School Organization settings
            </h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-500">School Identity Name</label>
              <input
                type="text"
                value={school.name}
                onChange={(e) => setSchool({ ...school, name: e.target.value })}
                className="border border-veda-card-border p-2.5 rounded-lg text-veda-text-primary outline-none focus:border-gray-400 font-sans"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-500">Branch Location</label>
              <input
                type="text"
                value={school.branch}
                onChange={(e) => setSchool({ ...school, branch: e.target.value })}
                className="border border-veda-card-border p-2.5 rounded-lg text-veda-text-primary outline-none focus:border-gray-400 font-sans"
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-semibold text-gray-500">CBSE Affiliation / Accreditation Code</label>
              <input
                type="text"
                value={school.code}
                onChange={(e) => setSchool({ ...school, code: e.target.value })}
                className="border border-veda-card-border p-2.5 rounded-lg text-veda-text-primary outline-none focus:border-gray-400 font-sans w-full"
              />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <PillButton
                variant="primary"
                className="text-xs !py-2"
                onClick={() => handleSave('School')}
              >
                Save School Info
              </PillButton>
            </div>
          </div>
        </div>

        {/* Section 3: AI Generation & Model Tuning */}
        <div className="bg-white border border-veda-card-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-5 py-4 border-b border-veda-card-border flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-veda-orange" />
            <h3 className="text-sm font-bold text-veda-text-primary">
              AI Generation & Model Tuning
            </h3>
          </div>
          <div className="p-5 flex flex-col gap-5 font-sans text-xs">
            {/* Model select */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-500">Selected LLM Model Engine</label>
              <select
                value={model.selectedModel}
                onChange={(e) => setModel({ ...model, selectedModel: e.target.value })}
                className="border border-veda-card-border p-2.5 rounded-lg text-veda-text-primary outline-none focus:border-gray-400 bg-white"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended - Fastest and cost-effective)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Best reasoning for complex Science/Maths)</option>
                <option value="gpt-4o">GPT-4o (Standard multimodal capabilities)</option>
              </select>
            </div>

            {/* Strict NCERT Toggle */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex flex-col gap-0.5 max-w-md">
                <span className="font-bold text-veda-text-primary">Strict NCERT Syllabus Constraint</span>
                <p className="text-[11px] text-veda-text-secondary leading-relaxed">
                  When enabled, the AI will reject questions referencing terms or contexts not covered in class textbooks.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={model.strictNCERT}
                  onChange={(e) => setModel({ ...model, strictNCERT: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-veda-orange"></div>
              </label>
            </div>

            {/* Creativity/Temperature slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-veda-text-primary">Model Temperature (Creativity)</span>
                  <span className="text-[11px] text-veda-text-secondary">Low temperature produces factual, standard exam structures.</span>
                </div>
                <span className="font-extrabold text-veda-orange">{model.creativity}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={model.creativity}
                onChange={(e) => setModel({ ...model, creativity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-veda-orange"
              />
            </div>

            <div className="flex justify-end mt-2">
              <PillButton
                variant="primary"
                className="text-xs !py-2"
                onClick={() => handleSave('AI Configuration')}
              >
                Save Tuning Profile
              </PillButton>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
