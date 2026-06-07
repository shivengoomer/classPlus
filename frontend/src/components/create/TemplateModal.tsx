// src/components/create/TemplateModal.tsx
'use client';

import React, { useEffect } from 'react';
import { X, Trash2, FileText, Sparkles } from 'lucide-react';
import { Template } from '@/types/group';
import { useTemplateStore } from '@/store/templateStore';
import { useToastStore } from '@/store/toastStore';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

export function TemplateModal({ isOpen, onClose, onSelectTemplate }: TemplateModalProps) {
  const { templates, fetchTemplates, isLoading, removeTemplate } = useTemplateStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, fetchTemplates]);

  if (!isOpen) return null;

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent selecting the template when clicking delete
    if (window.confirm('Are you sure you want to delete this custom template?')) {
      try {
        await removeTemplate(id);
        addToast('Template deleted successfully', 'success');
      } catch (err) {
        addToast('Failed to delete template', 'error');
      }
    }
  };

  const getQuestionSummary = (template: Template) => {
    const sections = template.blueprint?.sections || [];
    if (sections.length === 0) return 'No questions configured';
    return sections
      .map((s) => `${s.count}x ${s.type.toUpperCase()} (${s.marks}M)`)
      .join(', ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Wrapper */}
      <div className="relative bg-white border border-gray-200/80 rounded-[32px] w-full max-w-[800px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-[#303030] font-sans">
                Select Blueprint Template
              </h3>
              <p className="text-[13px] text-gray-500 font-sans mt-0.5">
                Pre-populate questions, marks, and settings with one click
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {isLoading && templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4" />
              <p className="text-[15px] font-medium font-sans">Loading template library...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
              <FileText className="w-12 h-12 stroke-[1.5] mb-3 text-gray-300" />
              <p className="text-[15px] font-semibold text-[#303030] font-sans">No templates found</p>
              <p className="text-[13px] text-gray-500 font-sans mt-1">Create a custom template after designing an assignment blueprint</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template._id}
                  onClick={() => onSelectTemplate(template)}
                  className="group relative bg-white hover:bg-purple-50/15 border border-gray-150 rounded-[24px] p-5 cursor-pointer shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Badge & Action Header */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <span 
                        className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-sans ${
                          template.isDefault 
                            ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                            : 'bg-purple-50 text-purple-600 border border-purple-100'
                        }`}
                      >
                        {template.isDefault ? 'Default' : 'Custom'}
                      </span>
                      
                      {!template.isDefault && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, template._id)}
                          className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-full transition-all"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Name & Desc */}
                    <h4 className="text-[16px] font-bold text-[#303030] group-hover:text-purple-700 transition-colors font-sans">
                      {template.name}
                    </h4>
                    <p className="text-[13px] text-gray-500 font-sans mt-1.5 leading-relaxed">
                      {template.description}
                    </p>
                  </div>

                  {/* Summary Footer */}
                  <div className="mt-4 pt-3.5 border-t border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase font-sans tracking-wide">
                      Blueprinted Sections
                    </p>
                    <p className="text-[13px] text-[#303030] font-semibold font-sans mt-1.5 truncate">
                      {getQuestionSummary(template)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
