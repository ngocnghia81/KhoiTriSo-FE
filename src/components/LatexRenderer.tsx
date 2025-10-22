'use client';

import { useState, useEffect } from 'react';

interface LatexRendererProps {
  content: string;
  className?: string;
}

export function LatexRenderer({ content, className = '' }: LatexRendererProps) {
  const [renderedContent, setRenderedContent] = useState(content);

  useEffect(() => {
    // Simple LaTeX-like rendering for common math expressions
    let processed = content;
    
    // Handle inline math expressions $...$
    processed = processed.replace(/\$([^$]+)\$/g, (match, formula) => {
      return `<span class="math-inline" style="font-family: 'Times New Roman', serif; font-style: italic;">${formula}</span>`;
    });
    
    // Handle display math expressions $$...$$
    processed = processed.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
      return `<div class="math-display" style="text-align: center; font-family: 'Times New Roman', serif; font-style: italic; margin: 10px 0;">${formula}</div>`;
    });
    
    // Handle common LaTeX commands
    processed = processed.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span style="display: inline-block; vertical-align: middle;"><span style="display: block; text-align: center; border-bottom: 1px solid black; padding-bottom: 2px;">$1</span><span style="display: block; text-align: center;">$2</span></span>');
    
    processed = processed.replace(/\\sqrt\{([^}]+)\}/g, '√<span style="text-decoration: overline;">$1</span>');
    
    processed = processed.replace(/\\pi/g, 'π');
    processed = processed.replace(/\\alpha/g, 'α');
    processed = processed.replace(/\\beta/g, 'β');
    processed = processed.replace(/\\gamma/g, 'γ');
    processed = processed.replace(/\\delta/g, 'δ');
    processed = processed.replace(/\\theta/g, 'θ');
    processed = processed.replace(/\\lambda/g, 'λ');
    processed = processed.replace(/\\mu/g, 'μ');
    processed = processed.replace(/\\sigma/g, 'σ');
    processed = processed.replace(/\\phi/g, 'φ');
    processed = processed.replace(/\\omega/g, 'ω');
    
    // Handle superscripts ^
    processed = processed.replace(/\^(\d+)/g, '<sup>$1</sup>');
    processed = processed.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');
    
    // Handle subscripts _
    processed = processed.replace(/_(\d+)/g, '<sub>$1</sub>');
    processed = processed.replace(/_\{([^}]+)\}/g, '<sub>$1</sub>');
    
    setRenderedContent(processed);
  }, [content]);

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
}

interface LatexEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function LatexEditor({ value, onChange, placeholder, rows = 4, className = '' }: LatexEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const insertLatex = (latex: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + latex + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + latex.length, start + latex.length);
      }, 0);
    }
  };

  const latexTemplates = [
    { label: 'Phân số', template: '\\frac{a}{b}' },
    { label: 'Căn bậc hai', template: '\\sqrt{x}' },
    { label: 'Mũ', template: 'x^{2}' },
    { label: 'Chỉ số', template: 'x_{1}' },
    { label: 'Pi', template: '\\pi' },
    { label: 'Alpha', template: '\\alpha' },
    { label: 'Beta', template: '\\beta' },
    { label: 'Gamma', template: '\\gamma' },
    { label: 'Delta', template: '\\delta' },
    { label: 'Theta', template: '\\theta' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Nội dung với LaTeX
        </label>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showPreview ? 'Ẩn xem trước' : 'Xem trước'}
        </button>
      </div>
      
      <div className="flex space-x-2">
        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${className}`}
            rows={rows}
            placeholder={placeholder}
          />
        </div>
        
        {showPreview && (
          <div className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">Xem trước:</div>
            <LatexRenderer content={value} />
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-500">Chèn nhanh:</span>
        {latexTemplates.map((template, index) => (
          <button
            key={index}
            type="button"
            onClick={() => insertLatex(template.template)}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title={template.label}
          >
            {template.label}
          </button>
        ))}
      </div>
    </div>
  );
}
