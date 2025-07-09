
import React, { useState, useRef, useEffect } from 'react';
import type { Note } from '../types';
import { NOTE_COLORS } from '../types';
import { MoreVertIcon, EditIcon, TrashIcon, PaletteIcon } from './Icons';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  onSetColor: (id: string, color: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, onEdit, onSetColor }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setColorPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleColorChange = (color: string) => {
    onSetColor(note.id, color);
    setMenuOpen(false);
    setColorPickerOpen(false);
  };

  return (
    <div
      className={`relative p-4 rounded-lg shadow-md break-inside-avoid-column cursor-pointer transition-shadow duration-200 hover:shadow-xl dark:text-gray-800 ${note.color}`}
      onClick={() => onEdit(note)}
    >
      <div className="absolute top-2 right-2 z-10" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
            setColorPickerOpen(false);
          }}
          className="p-1 rounded-full hover:bg-black/10 transition-colors"
        >
          <MoreVertIcon className="w-5 h-5 text-gray-600" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg py-1 z-20">
            {colorPickerOpen ? (
              <div className="p-2">
                 <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-2 px-2">Choose a color</p>
                 <div className="grid grid-cols-6 gap-2 px-2">
                    {NOTE_COLORS.map(c => (
                        <button key={c} onClick={(e) => { e.stopPropagation(); handleColorChange(c); }} className={`w-6 h-6 rounded-full ${c} border border-gray-300 dark:border-slate-500 transition-transform hover:scale-110`}/>
                    ))}
                 </div>
              </div>
            ) : (
              <>
                <a href="#" onClick={(e) => { e.stopPropagation(); onEdit(note); setMenuOpen(false); }} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600">
                  <EditIcon className="w-4 h-4 mr-3" /> Edit
                </a>
                <a href="#" onClick={(e) => { e.stopPropagation(); setColorPickerOpen(true); }} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600">
                  <PaletteIcon className="w-4 h-4 mr-3" /> Change Color
                </a>
                <a href="#" onClick={(e) => { e.stopPropagation(); onDelete(note.id); setMenuOpen(false); }} className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <TrashIcon className="w-4 h-4 mr-3" /> Delete
                </a>
              </>
            )}
          </div>
        )}
      </div>
      
      {note.title && <h3 className="font-bold mb-2 pr-8 pointer-events-none">{note.title}</h3>}
      <p className="text-gray-700 whitespace-pre-wrap pointer-events-none">{note.content}</p>
      <div className="text-xs text-gray-500 mt-4 pointer-events-none">
        {new Date(note.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default NoteCard;
