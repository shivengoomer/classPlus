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
      className="border border-dashed border-transparent hover:border-red-500 focus-within:border-red-500 focus-within:border-solid hover:border-solid rounded-xl p-4 transition-all duration-200 bg-transparent flex flex-col gap-3 w-full max-w-lg mx-auto"
    >
      {/* Student Details Fields */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 text-sm text-veda-text-primary">
        
        {/* Name */}
        <div className="flex items-center gap-2 flex-1">
          <span className="font-semibold whitespace-nowrap">Name:</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="___________________"
            className="flex-1 bg-transparent border-none border-b border-black text-veda-text-primary px-1 focus:outline-none focus:border-red-500 text-sm placeholder:text-gray-300"
          />
        </div>

        {/* Roll Number */}
        <div className="flex items-center gap-2 sm:w-[40%]">
          <span className="font-semibold whitespace-nowrap">Roll Number:</span>
          <input
            type="text"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="____________"
            className="flex-1 bg-transparent border-none border-b border-black text-veda-text-primary px-1 focus:outline-none focus:border-red-500 text-sm placeholder:text-gray-300"
          />
        </div>

      </div>

      <div className="flex items-center gap-4 text-sm text-veda-text-primary">
        
        {/* Class */}
        <div className="flex items-center gap-2">
          <span className="font-semibold">Class:</span>
          <span className="border-b border-black px-3 py-0.5">{grade}</span>
        </div>

        {/* Section */}
        <div className="flex items-center gap-2 w-32">
          <span className="font-semibold whitespace-nowrap">Section:</span>
          <input
            type="text"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="________"
            className="flex-1 bg-transparent border-none border-b border-black text-veda-text-primary px-1 focus:outline-none focus:border-red-500 text-sm placeholder:text-gray-300"
          />
        </div>

      </div>

    </div>
  );
}
