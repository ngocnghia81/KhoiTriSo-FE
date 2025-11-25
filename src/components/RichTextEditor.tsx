'use client';

import { useRef, useEffect, useState, createElement } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Undo,
  Redo,
  Calculator
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const mathFieldRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showMathKb, setShowMathKb] = useState(false);
  const mathFieldIdRef = useRef(`ml-field-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editorRef.current && mounted) {
      // Only update if content is different to avoid cursor jumping
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, mounted]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Nhập URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handleOpenMathKb = () => {
    setShowMathKb(true);
  };

  const handleInsertMath = (mathML: string) => {
    if (editorRef.current && mathML) {
      // Wrap in <math> tag if needed
      const mathContent = mathML.startsWith('<math') ? mathML : `<math xmlns="http://www.w3.org/1998/Math/MathML">${mathML}</math>`;
      
      // Focus editor first
      editorRef.current.focus();
      
      // Get current selection
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      
      if (range) {
        // Delete any selected content
        range.deleteContents();
        
        // Create a temporary container to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = mathContent;
        
        // Insert the parsed content
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        range.insertNode(fragment);
        
        // Move cursor after inserted content
        range.setStartAfter(fragment.lastChild || range.endContainer);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } else {
        // Fallback: append to end if no selection
        const mathNode = document.createElement('span');
        mathNode.innerHTML = mathContent;
        editorRef.current.appendChild(mathNode);
        
        // Move cursor to end
        const newRange = document.createRange();
        newRange.selectNodeContents(editorRef.current);
        newRange.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(newRange);
      }
      
      handleInput();
    }
    setShowMathKb(false);
  };

  // Load MathLive when modal opens
  useEffect(() => {
    if (!showMathKb) return;
    if (typeof window === 'undefined') return;
    
    (async () => {
      try {
        const w = window as Window & { mathlive?: { fontsDirectory: string } };
        w.mathlive = { 
          fontsDirectory: 'https://unpkg.com/mathlive/dist/fonts' 
        };
        await import('mathlive');
      } catch (error) {
        console.error('MathLive load error:', error);
      }
    })();
    
    // Initialize MathLive field after load
    setTimeout(() => {
      try {
        const mf = document.getElementById(mathFieldIdRef.current) as HTMLElement & {
          setOptions?: (options: Record<string, unknown>) => void;
          focus?: () => void;
          showVirtualKeyboard?: () => void;
          executeCommand?: (cmd: string) => void;
        };
        if (mf) {
          mathFieldRef.current = mf;
          mf.setOptions?.({
            virtualKeyboardMode: 'manual',
            virtualKeyboards: 'all symbols roman letters functions arrows calculus trigonometry geometry sets derivatives integrals',
          });
          mf.focus?.();
          if (typeof mf.showVirtualKeyboard === 'function') {
            mf.showVirtualKeyboard();
          }
          if (typeof mf.executeCommand === 'function') {
            mf.executeCommand('showVirtualKeyboard');
          }
        }
      } catch (error) {
        console.error('MathLive init error:', error);
      }
    }, 200);
  }, [showMathKb]);

  if (!mounted) {
    return (
      <textarea
        className={`w-full border rounded px-3 py-2 h-48 ${className || ''}`}
        value={value.replace(/<[^>]*>/g, '')}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${className || ''}`}>
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="In đậm (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="In nghiêng (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Gạch chân (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('strikeThrough')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Gạch ngang"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Danh sách không thứ tự"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Danh sách có thứ tự"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          type="button"
          onClick={() => executeCommand('justifyLeft')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Căn trái"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyCenter')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Căn giữa"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyRight')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Căn phải"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          type="button"
          onClick={insertLink}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Chèn link"
        >
          <Link className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          type="button"
          onClick={handleOpenMathKb}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Bàn phím CASIO"
        >
          <Calculator className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          type="button"
          onClick={() => executeCommand('undo')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('redo')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Làm lại (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
          handleInput();
        }}
        className="min-h-[200px] p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 rich-text-editor-content"
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}
        data-placeholder={placeholder || 'Nhập nội dung...'}
        suppressContentEditableWarning
      />
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .rich-text-editor-content[data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }
          .rich-text-editor-content math {
            display: inline-block;
            margin: 0 2px;
          }
          .rich-text-editor-content math:hover {
            background-color: #f3f4f6;
            cursor: pointer;
          }
        `
      }} />

      {/* MathLive Modal */}
      {showMathKb && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Nhập công thức toán học</h3>
            {createElement('math-field', {
              id: mathFieldIdRef.current,
              ref: (el: HTMLElement | null) => { mathFieldRef.current = el; },
              style: {
                width: '100%',
                minHeight: '200px',
                fontSize: '20px',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }
            })}
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  const mf = mathFieldRef.current as HTMLElement & {
                    getValue?: (format: string) => string;
                  };
                  const mathML = mf?.getValue?.('math-ml') || '';
                  if (mathML) {
                    handleInsertMath(mathML);
                  } else {
                    setShowMathKb(false);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Chèn
              </button>
              <button
                onClick={() => {
                  setShowMathKb(false);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

