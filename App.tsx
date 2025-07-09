import React, { useState, useEffect } from 'react';
import type { User, Note } from './types';
import * as notesService from './services/firebaseService';
import { auth } from './services/firebaseService';
import AuthScreen from './components/AuthScreen';
import NoteCard from './components/NoteCard';
import NoteEditor from './components/NoteEditor';
import { PlusIcon, LogoutIcon, NoteIcon } from './components/Icons';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = notesService.onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
      } else {
        setUser(null);
        setNotes([]); // Clear notes on logout
      }
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Fetch notes for the logged-in user in real-time
  useEffect(() => {
    if (user?.uid) {
      // onNotesSnapshot returns its own unsubscribe function
      const unsubscribe = notesService.onNotesSnapshot(user.uid, setNotes);
      return () => unsubscribe(); // Cleanup notes subscription on user change or unmount
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await notesService.signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally, show an error message to the user
    }
  };

  const handleSaveNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'uid' | 'updatedAt'>) => {
    if (!user) return;

    try {
      if (editingNote && 'id' in editingNote && editingNote.id) {
        // Editing an existing note
        await notesService.updateNote(user.uid, editingNote.id, {
          title: noteData.title,
          content: noteData.content,
          color: noteData.color,
        });
      } else {
        // Creating a new note
        await notesService.addNote(user.uid, {
          title: noteData.title,
          content: noteData.content,
          color: noteData.color || 'bg-white',
        });
      }
    } catch (error) {
      console.error("Error saving note:", error);
      // Optionally, show an error message to the user
    } finally {
      setEditorOpen(false);
      setEditingNote(null);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!user) return;
    try {
      await notesService.deleteNote(user.uid, id);
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };
  
  const handleSetColor = async (id: string, color: string) => {
    if (!user) return;
    try {
      await notesService.updateNoteColor(user.uid, id, color);
    } catch (error) {
      console.error("Error updating note color:", error);
    }
  };

  const openEditorForNew = () => {
    setEditingNote({ color: 'bg-white' }); // Start new notes with a default color
    setEditorOpen(true);
  };

  const openEditorForEdit = (note: Note) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans text-slate-800 dark:text-slate-200">
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 shadow-sm sticky top-0 z-20 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <NoteIcon className="w-7 h-7 text-amber-500 dark:text-amber-400 mr-2"/>
          <h1 className="text-xl sm:text-2xl font-bold">Gemini Notes</h1>
        </div>
        <div className="flex items-center">
          <span className="text-gray-600 dark:text-gray-400 text-sm mr-4 hidden sm:block">{user.email || 'User'}</span>
          <button onClick={handleLogout} className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 font-semibold transition-colors">
            <LogoutIcon className="w-5 h-5"/>
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {notes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {notes.map((note) => (
                <NoteCard
                key={note.id}
                note={note}
                onDelete={handleDeleteNote}
                onEdit={openEditorForEdit}
                onSetColor={handleSetColor}
                />
            ))}
            </div>
        ) : (
            <div className="text-center py-20">
                <h2 className="text-xl font-semibold text-gray-500">No notes yet</h2>
                <p className="text-gray-400 mt-2">Click the '+' button to add your first note.</p>
            </div>
        )}
      </main>

      <button onClick={openEditorForNew} className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-amber-400 hover:bg-amber-500 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 z-10">
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex justify-center items-center z-30 animate-fade-in">
            <div className="relative w-full h-full sm:w-4/5 sm:h-4/5 md:w-3/5 lg:w-1/2 max-w-4xl sm:max-h-[80vh] bg-white dark:bg-slate-800 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <NoteEditor 
                    note={editingNote} 
                    onSave={handleSaveNote}
                    onClose={() => setEditorOpen(false)}
                />
            </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;