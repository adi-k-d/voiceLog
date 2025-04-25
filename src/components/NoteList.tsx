import React from 'react';
import { NoteCategory } from './CategorySelector';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNoteContext } from '@/context/NoteContext';

export interface Note {
  id: string;
  text: string;
  category: NoteCategory;
  createdAt: Date;
  userId?: string;
}

interface NoteListProps {
  notes: Note[];
  onCreateNew: () => void;
}

const NoteList: React.FC<NoteListProps> = ({ notes, onCreateNew }) => {
  const { user } = useAuth();
  const { updateNote, deleteNote } = useNoteContext();

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (notes.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No notes yet. Create your first note by selecting a category.</p>
        <Button 
          onClick={onCreateNew} 
          className="mt-4"
        >
          Create Note
        </Button>
      </div>
    );
  }

  const isOwner = (noteUserId?: string) => {
    return user?.id === noteUserId;
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {notes.map(note => (
        <Card key={note.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {note.category}
              </span>
              <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-800 whitespace-pre-wrap">{note.text}</p>
          </CardContent>
          {isOwner(note.userId) && (
            <CardFooter className="flex justify-end gap-2 border-t pt-3">
              <Button size="sm" variant="outline" onClick={() => updateNote(note.id, note.text)}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => deleteNote(note.id)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
};

export default NoteList;