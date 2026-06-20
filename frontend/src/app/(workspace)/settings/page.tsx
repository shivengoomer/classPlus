'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PillButton } from '@/components/shared/PillButton';
import { Settings, User, School, Loader2 } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { useUser } from '@clerk/nextjs';
import { useProfileStore } from '@/store/profileStore';

export default function SettingsPage() {
  const { addToast } = useToastStore();
  const { user: clerkUser } = useUser();
  const { profile: storeProfile, fetchProfile, updateProfile } = useProfileStore();
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: ''
  });

  const [school, setSchool] = useState({
    name: '',
    branch: '',
    code: ''
  });

  useEffect(() => {
    const initProfile = async () => {
      let data = storeProfile;
      if (!data) {
        data = await fetchProfile();
      }
      if (data) {
        const fallbackName = clerkUser ? `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() : 'John Doe';
        const fallbackEmail = clerkUser?.emailAddresses[0]?.emailAddress || 'john.doe@dpsbokaro.edu.in';
        
        setProfile({
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || fallbackName,
          email: data.email || fallbackEmail,
          role: data.role || 'Senior Science Teacher'
        });

        setSchool({
          name: data.schoolName ?? 'Delhi Public School',
          branch: data.schoolBranch ?? 'Bokaro Steel City, Sector-4',
          code: data.schoolCode ?? 'CBSE-3430015'
        });
      } else if (clerkUser) {
        setProfile({
          name: clerkUser.fullName || '',
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          role: 'Senior Science Teacher'
        });
      }
      setLoading(false);
    };

    if (clerkUser) {
      initProfile();
    }
  }, [clerkUser, storeProfile, fetchProfile]);

  const handleSaveProfile = async () => {
    try {
      const nameParts = profile.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await updateProfile({
        firstName,
        lastName,
        role: profile.role
      });
      addToast('Successfully saved profile details.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to save profile details.', 'error');
    }
  };

  const handleSaveSchool = async () => {
    try {
      await updateProfile({
        schoolName: school.name,
        schoolBranch: school.branch,
        schoolCode: school.code
      });
      addToast('Successfully saved school organization settings.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to save school details.', 'error');
    }
  };



  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-16 px-[2px] relative z-10">
        
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-bold text-classplus-text-primary flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-700" />
            <span>Settings</span>
          </h2>
          <p className="text-[13px] text-classplus-text-secondary">
            Configure your personal profile details, school organization information, and AI generation parameters.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-classplus-orange animate-spin" />
            <p className="text-sm text-classplus-text-secondary font-medium">Loading settings profile...</p>
          </div>
        ) : (
          <>
            {/* Section 1: Teacher Profile Details */}
            <div className="bg-white border border-classplus-card-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="bg-gray-50 px-5 py-4 border-b border-classplus-card-border flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-classplus-text-primary">
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
                    className="border border-classplus-card-border p-2.5 rounded-lg text-classplus-text-primary outline-none focus:border-gray-400 font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500">Email Address (Managed by Clerk)</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="border border-classplus-card-border p-2.5 rounded-lg text-gray-400 bg-gray-50 outline-none cursor-not-allowed font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-semibold text-gray-500">Professional Role</label>
                  <input
                    type="text"
                    value={profile.role}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    className="border border-classplus-card-border p-2.5 rounded-lg text-classplus-text-primary outline-none focus:border-gray-400 font-sans w-full"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end mt-2">
                  <PillButton
                    variant="primary"
                    className="text-xs !py-2"
                    onClick={handleSaveProfile}
                  >
                    Save Profile
                  </PillButton>
                </div>
              </div>
            </div>

            {/* Section 2: School Organization Settings */}
            <div className="bg-white border border-classplus-card-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="bg-gray-50 px-5 py-4 border-b border-classplus-card-border flex items-center gap-2">
                <School className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-classplus-text-primary">
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
                    className="border border-classplus-card-border p-2.5 rounded-lg text-classplus-text-primary outline-none focus:border-gray-400 font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-500">Branch Location</label>
                  <input
                    type="text"
                    value={school.branch}
                    onChange={(e) => setSchool({ ...school, branch: e.target.value })}
                    className="border border-classplus-card-border p-2.5 rounded-lg text-classplus-text-primary outline-none focus:border-gray-400 font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-semibold text-gray-500">CBSE Affiliation / Accreditation Code</label>
                  <input
                    type="text"
                    value={school.code}
                    onChange={(e) => setSchool({ ...school, code: e.target.value })}
                    className="border border-classplus-card-border p-2.5 rounded-lg text-classplus-text-primary outline-none focus:border-gray-400 font-sans w-full"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end mt-2">
                  <PillButton
                    variant="primary"
                    className="text-xs !py-2"
                    onClick={handleSaveSchool}
                  >
                    Save School Info
                  </PillButton>
                </div>
              </div>
            </div>


          </>
        )}

      </div>
    </AppShell>
  );
}
