import React, { useState } from 'react';
import { NoteCategory } from './CategorySelector';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNoteContext } from '@/context/NoteContext';
import TranscriptionEditor from './TranscriptionEditor';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export interface Note {
  id: string;
  text: string;
  category: NoteCategory;
  createdAt: Date;
  userId?: string;
  workUpdate?: string;
  useremail?: string;
  status?: 'Not Started' | 'In Progress' | 'Completed';
}

interface NoteListProps {
  notes: Note[];
  onCreateNew: () => void;
}

const NoteList: React.FC<NoteListProps> = ({ notes, onCreateNew }) => {
  const { user } = useAuth();
  const { updateNote, deleteNote } = useNoteContext();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleEditClick = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleSaveEdit = async (text: string, workUpdate?: string) => {
    if (editingNote) {
      await updateNote(editingNote.id, text, workUpdate);
      setIsEditorOpen(false);
      setEditingNote(null);
    }
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingNote(null);
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
    <>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {notes.map(note => (
          <Card key={note.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {note.category}
                  </span>
                  
                </div>
                <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
              </div>
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  
                  {note.useremail && (
                    <span className="text-xs text-gray-500">User: {note.useremail}</span>
                  )}
                </div>
                
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800 whitespace-pre-wrap">{note.text}</p>
              {note.category === 'Customer Complaints' && (
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-600">Status:</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      note.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      note.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {note.status || 'Not Started'}
                    </span>
                  </div>
                  {note.workUpdate && (
                    <>
                      <p className="text-sm font-medium text-gray-600 mb-1">Work Update:</p>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">
                        {note.workUpdate}
                      </p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
            {(isOwner(note.userId) || note.category === 'Customer Complaints') && (
              <CardFooter className="flex justify-end gap-2 border-t pt-3">
                <Button size="sm" variant="outline" onClick={() => handleEditClick(note)}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                {isOwner(note.userId) && (
                  <Button size="sm" variant="destructive" onClick={() => deleteNote(note.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                )}
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={isEditorOpen} onOpenChange={handleCloseEditor}>
        <DialogContent className="sm:max-w-md">
          {editingNote && (
            <TranscriptionEditor
              transcription={editingNote.text}
              category={editingNote.category}
              onSave={handleSaveEdit}
              onCancel={handleCloseEditor}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NoteList;