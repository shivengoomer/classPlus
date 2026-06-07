// src/components/result/StudentInfoBlock.tsx
'use client';

import React, { useState } from 'react';

interface StudentInfoBlockProps {
  grade?: string;
}

export function StudentInfoBlock({ grade = '5th' }: StudentInfoBlockProps) {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [section, setSection] = useState('');

  return (
    <div 
      className="rounded-2xl py-3 px-4 transition-all duration-200 bg-slate-50/50 border border-slate-200 flex flex-col gap-3 w-full max-w-md mr-auto"
    >
      {/* Row 1: Name */}
      <div className="flex items-center gap-2 w-full text-xs font-extrabold text-slate-500 uppercase tracking-wider">
        <span className="whitespace-nowrap">Name:</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-transparent border-b border-slate-300 text-slate-800 px-1 focus:outline-none focus:border-[#10375C] text-sm h-7 font-sans font-bold transition-colors"
        />
      </div>

      {/* Row 2: Roll Number */}
      <div className="flex items-center gap-2 w-full text-xs font-extrabold text-slate-500 uppercase tracking-wider">
        <span className="whitespace-nowrap">Roll Number:</span>
        <input
          type="text"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          className="flex-1 bg-transparent border-b border-slate-300 text-slate-800 px-1 focus:outline-none focus:border-[#10375C] text-sm h-7 font-sans font-bold transition-colors"
        />
      </div>

      {/* Row 3: Class & Section */}
      <div className="flex items-center gap-2 w-full text-xs font-extrabold text-slate-500 uppercase tracking-wider">
        <span className="whitespace-nowrap">Class:</span>
        <span className="border-b border-slate-300 px-2 min-w-[36px] text-center font-sans font-black text-slate-800 text-sm leading-7">{grade}</span>
        
        <span className="whitespace-nowrap ml-4">Section:</span>
        <input
          type="text"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="flex-1 bg-transparent border-b border-slate-300 text-slate-800 px-1 focus:outline-none focus:border-[#10375C] text-sm h-7 font-sans font-bold transition-colors"
        />
      </div>
    </div>
  );
}
