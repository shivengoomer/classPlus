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
      className="border border-dashed border-transparent hover:border-red-500 focus-within:border-red-500 focus-within:border-solid hover:border-solid rounded-xl p-4 transition-all duration-200 bg-transparent flex flex-col gap-3 w-full max-w-sm mr-auto"
    >
      {/* Row 1: Name */}
      <div className="flex items-center gap-2 w-full text-sm text-black">
        <span className="font-semibold whitespace-nowrap">Name:</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-transparent border-none border-b border-black text-veda-text-primary px-1 focus:outline-none focus:border-red-500 text-sm h-5"
        />
      </div>

      {/* Row 2: Roll Number */}
      <div className="flex items-center gap-2 w-full text-sm text-black">
        <span className="font-semibold whitespace-nowrap">Roll Number:</span>
        <input
          type="text"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          className="flex-1 bg-transparent border-none border-b border-black text-veda-text-primary px-1 focus:outline-none focus:border-red-500 text-sm h-5"
        />
      </div>

      {/* Row 3: Class & Section */}
      <div className="flex items-center gap-2 w-full text-sm text-black">
        <span className="font-semibold whitespace-nowrap">Class:</span>
        <span className="border-b border-black px-1 min-w-[36px] text-center">{grade}</span>
        
        <span className="font-semibold whitespace-nowrap ml-2">Section:</span>
        <input
          type="text"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="flex-1 bg-transparent border-none border-b border-black text-veda-text-primary px-1 focus:outline-none focus:border-red-500 text-sm h-5"
        />
      </div>
    </div>
  );
}
