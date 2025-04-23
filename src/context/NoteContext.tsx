import React, { createContext, useContext, useState, useEffect } from 'react';
import { NoteCategory } from '@/components/CategorySelector';
import { Note } from '@/components/NoteList';

interface NoteContextProps {
  notes: Note[];
  addNote: (text: string, category: NoteCategory) => void;
}

const NoteContext = createContext<NoteContextProps | undefined>(undefined);

export const useNoteContext = () => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNoteContext must be used within a NoteProvider');
  }
  return context;
};

interface NoteProviderProps {
  children: React.ReactNode;
}

export const NoteProvider: React.FC<NoteProviderProps> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('voicelog-notes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt)
        }));
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Error parsing saved notes:', error);
      }
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('voicelog-notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (text: string, category: NoteCategory) => {
    const newNote: Note = {
      id: Date.now().toString(),
      text,
      category,
      createdAt: new Date()
    };
    
    setNotes(prevNotes => [newNote, ...prevNotes]);
  };

  return (
    <NoteContext.Provider value={{ notes, addNote }}>
      {children}
    </NoteContext.Provider>
  );
};