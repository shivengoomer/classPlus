// src/components/shared/GenerationStepper.tsx
'use client';

import React from 'react';
import { Check, Loader2, Sparkles, FileText, Cpu, CheckSquare, AlertCircle } from 'lucide-react';

interface GenerationStepperProps {
  currentStage?: 'queued' | 'parsing' | 'prompting' | 'generating' | 'saving' | 'completed' | 'failed';
  currentMessage?: string;
  sectionIndex?: number;
  totalSections?: number;
}

export function GenerationStepper({
  currentStage = 'queued',
  currentMessage = '',
  sectionIndex,
  totalSections
}: GenerationStepperProps) {
  
  const steps = [
    {
      id: 'parsing',
      title: 'Parse Reference Material',
      description: 'Extracting text and structure from your uploaded files...',
      icon: FileText,
      stages: ['parsing'],
      completedStages: ['prompting', 'generating', 'saving', 'completed']
    },
    {
      id: 'prompting',
      title: 'Curriculum Alignment',
      description: 'Aligning test blueprint with CBSE / NCERT standard syllabus...',
      icon: Cpu,
      stages: ['prompting'],
      completedStages: ['generating', 'saving', 'completed']
    },
    {
      id: 'generating',
      title: 'Generate Questions',
      description: 'Drafting structured sections, answers, and rubrics...',
      icon: Sparkles,
      stages: ['generating'],
      completedStages: ['saving', 'completed']
    },
    {
      id: 'saving',
      title: 'Finalize & Export PDF',
      description: 'Formatting layout and uploading final PDF exports...',
      icon: CheckSquare,
      stages: ['saving'],
      completedStages: ['completed']
    }
  ];

  const getStepStatus = (step: typeof steps[0]) => {
    if (currentStage === 'failed') {
      if (step.stages.includes('generating') && currentStage === 'failed') {
        return 'failed';
      }
      // Simple approximation: mark previous as completed, active/pending as failed
      return step.completedStages.includes(currentStage) ? 'completed' : 'failed';
    }
    if (currentStage === 'completed') return 'completed';
    if (step.completedStages.includes(currentStage)) return 'completed';
    if (step.stages.includes(currentStage)) return 'active';
    return 'pending';
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[480px] mx-auto p-6 bg-white border border-gray-150 rounded-[32px] shadow-sm font-sans">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4 mb-2">
        <h4 className="text-[18px] font-bold text-[#303030]">Generation Progress</h4>
        <p className="text-[13px] text-gray-500">Watching background BullMQ processing pipeline</p>
      </div>

      <div className="flex flex-col relative pl-4">
        {/* Continuous timeline line */}
        <div className="absolute left-[29px] top-6 bottom-6 w-[2px] bg-gray-100" />

        {steps.map((step, idx) => {
          const status = getStepStatus(step);
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="flex gap-5 pb-8 relative last:pb-2 group">
              {/* Step indicator circle */}
              <div className="z-10 flex-shrink-0">
                {status === 'completed' && (
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm border-2 border-green-400">
                    <Check className="w-4.5 h-4.5 stroke-[3]" />
                  </div>
                )}
                {status === 'active' && (
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg border-2 border-purple-400 animate-pulse relative">
                    <div className="absolute inset-0 rounded-full border border-purple-400 animate-ping opacity-60" />
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                )}
                {status === 'pending' && (
                  <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center border-2 border-gray-200">
                    <StepIcon className="w-4 h-4" />
                  </div>
                )}
                {status === 'failed' && (
                  <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center border-2 border-red-200">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="flex flex-col pt-0.5">
                <span className={`text-[15px] font-bold font-sans transition-colors duration-250 ${
                  status === 'completed' ? 'text-gray-500 line-through decoration-gray-300' :
                  status === 'active' ? 'text-purple-700' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>

                {status === 'active' && (
                  <div className="flex flex-col gap-1 mt-1.5 animate-in fade-in slide-in-from-left-2 duration-200">
                    <p className="text-[13px] font-medium text-gray-700 leading-normal font-sans">
                      {currentMessage || step.description}
                    </p>
                    
                    {/* Display sub-progress for section generation */}
                    {step.id === 'generating' && sectionIndex && totalSections && (
                      <div className="flex flex-col gap-1.5 mt-2 bg-purple-50/30 border border-purple-200/20 p-2.5 rounded-xl">
                        <div className="flex justify-between text-[11px] font-bold text-purple-700 font-sans">
                          <span>Progress</span>
                          <span>Section {sectionIndex} of {totalSections}</span>
                        </div>
                        <div className="w-full bg-purple-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-purple-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${(sectionIndex / totalSections) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {status === 'pending' && (
                  <p className="text-[12px] text-gray-400 font-sans mt-0.5 leading-normal">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
