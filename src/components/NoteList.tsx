import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NoteCategory } from './CategorySelector';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

import { useNoteContext } from '@/context/NoteContext';
import TranscriptionEditor from './TranscriptionEditor';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useUsers } from '@/hooks/useUsers';

export interface WorkUpdate {
  text: string;
  timestamp: string;
  userEmail: string;
}

export interface Note {
  id: string;
  text: string;
  category: NoteCategory;
  createdAt: Date;
  userId: string;
  useremail: string;
  workUpdates: WorkUpdate[];
  status?: string;
  assignedTo?: string;
}

interface NoteListProps {
  notes: Note[];
  onCreateNew?: () => void;
}

const NoteList: React.FC<NoteListProps> = ({ notes, onCreateNew }) => {
  const navigate = useNavigate();
  
  const { updateNote, deleteNote } = useNoteContext();
  const { users, loading: usersLoading } = useUsers();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleSaveEdit = async (text: string, workUpdates?: WorkUpdate[], status?: string, assignedTo?: string) => {
    if (editingNote) {
      await updateNote(editingNote.id, text, workUpdates, status, assignedTo);
      setIsEditorOpen(false);
    }
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingNote(null);
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId);
  };

  const handleCloseIssue = async (note: Note) => {
    await updateNote(note.id, note.text, note.workUpdates, 'Completed', note.assignedTo);
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

 

  return (
    <>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {notes.map(note => (
          <Card 
            key={note.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/notes/${note.id}`)}
          >
            <CardHeader className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {note.useremail?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{note.useremail}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditNote(note);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  note.status === 'Completed' 
                    ? 'bg-green-100 text-green-800'
                    : note.status === 'In Progress'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {note.status || 'Not Started'}
                </span>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {note.category}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-3">{note.text}</p>
              {note.workUpdates && note.workUpdates.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500">Latest Update:</p>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {note.workUpdates[note.workUpdates.length - 1].text}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(note.workUpdates[note.workUpdates.length - 1].timestamp).toLocaleString()}
                  </p>
                </div>
              )}
              {note.assignedTo && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500">Assigned To:</p>
                  <p className="text-xs text-gray-600">{note.assignedTo}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNote(note.id);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              {note.category === 'Customer Complaints' && note.status !== 'Completed' && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseIssue(note);
                  }}
                >
                  Close Issue
                </Button>
              )}
            </CardFooter>
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
              workUpdates={editingNote.workUpdates}
              status={editingNote.status}
              assignedTo={editingNote.assignedTo}
              users={users}
              usersLoading={usersLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NoteList;