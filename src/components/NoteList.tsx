import React from 'react';
import { Button } from '@/components/ui/button';
import { NoteCategory } from './CategorySelector';

export interface Note {
  id: string;
  text: string;
  category: NoteCategory;
  createdAt: Date;
}

interface NoteListProps {
  notes: Note[];
  onCreateNew: () => void;
}

const NoteList: React.FC<NoteListProps> = ({ notes, onCreateNew }) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-gray-500 mb-4 text-center">You don't have any notes yet.</p>
        <Button onClick={onCreateNew}>Create Your First Note</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 px-4">
        <h2 className="text-xl font-semibold">Your Notes</h2>
        <Button onClick={onCreateNew}>New Note</Button>
      </div>

      <div className="space-y-8">
        {(['Work Update', 'Improvement Idea', 'New Learning'] as NoteCategory[]).map(category => {
          const categoryNotes = notes.filter(note => note.category === category);
          
          if (categoryNotes.length === 0) return null;
          
          return (
            <div key={category} className="space-y-4 px-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">{category}</h3>
                <span className="text-sm bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                  {categoryNotes.length}
                </span>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {categoryNotes.map(note => (
                  <div key={note.id} className="note-card">
                    <div className="flex justify-between items-start mb-3">
                      <span className="category-pill">{note.category}</span>
                      <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
                    </div>
                    <p className="text-gray-800 line-clamp-3">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NoteList;