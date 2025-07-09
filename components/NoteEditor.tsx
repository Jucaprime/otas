import React, { useState, useEffect, useRef } from 'react';
import type { Note } from '../types';
import { generateNoteContent } from '../services/geminiService';
import { SparklesIcon } from './Icons';

interface NoteEditorProps {
  note: Partial<Note> | null;
  onSave: (noteData: Omit<Note, 'id' | 'createdAt' | 'uid' | 'updatedAt'>) => void;
  onClose: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('bg-white');
  
  const [geminiPrompt, setGeminiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setColor(note.color || 'bg-white');
    } else {
      setTitle('');
      setContent('');
      setColor('bg-white');
    }
  }, [note]);

  const handleSave = () => {
    if (title.trim() === '' && content.trim() === '') {
        onClose();
        return;
    };
    onSave({ title, content, color });
  };

  const handleGenerate = async () => {
    if (!geminiPrompt.trim()) return;
    setIsGenerating(true);
    const result = await generateNoteContent(geminiPrompt, content);
    setContent(prev => prev ? `${prev}\n\n${result}` : result);
    setIsGenerating(false);
    setGeminiPrompt('');
    setShowPrompt(false);
  };

  useEffect(() => {
    if(contentRef.current){
        contentRef.current.style.height = "auto";
        contentRef.current.style.height = (contentRef.current.scrollHeight) + "px";
    }
  }, [content]);

  return (
    <div className={`flex flex-col h-full w-full ${color} dark:bg-slate-800 transition-colors duration-300`}>
      <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full p-2 mb-4 text-2xl font-bold bg-transparent focus:outline-none dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        <textarea
          ref={contentRef}
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Take a note..."
          className="w-full p-2 bg-transparent focus:outline-none resize-none text-lg leading-relaxed dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
          rows={10}
        />
        {showPrompt && (
            <div className="mt-4 p-3 bg-black/5 dark:bg-white/5 rounded-lg">
                <textarea
                    value={geminiPrompt}
                    onChange={(e) => setGeminiPrompt(e.target.value)}
                    placeholder="e.g., 'Brainstorm ideas for a birthday party'"
                    className="w-full p-2 text-sm bg-transparent focus:outline-none resize-none dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                    rows={2}
                    autoFocus
                />
                <div className="flex justify-end space-x-2 mt-2">
                     <button onClick={() => setShowPrompt(false)} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 rounded-md hover:bg-black/10 dark:hover:bg-white/10">
                        Cancel
                    </button>
                    <button 
                        onClick={handleGenerate} 
                        disabled={isGenerating || !geminiPrompt} 
                        className="px-3 py-1 text-sm font-semibold bg-amber-400 text-white rounded-md hover:bg-amber-500 disabled:bg-amber-300 disabled:cursor-not-allowed flex items-center"
                    >
                        {isGenerating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : null}
                        Generate
                    </button>
                </div>
            </div>
        )}
      </div>
      <div className="flex-shrink-0 p-4 border-t border-black/10 dark:border-white/10 flex justify-between items-center">
        <button 
            onClick={() => setShowPrompt(p => !p)} 
            className="p-2 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-500 dark:text-amber-400 transition-colors flex items-center"
        >
          <SparklesIcon className="w-5 h-5" />
          <span className="text-sm font-semibold ml-2 hidden sm:inline">Ask Gemini</span>
        </button>
        <div className="flex space-x-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-md">
                Close
            </button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-amber-400 hover:bg-amber-500 rounded-md">
                Save
            </button>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;