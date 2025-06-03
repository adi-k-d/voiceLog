import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNoteContext } from '@/context/NoteContext';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import TranscriptionEditor from '@/components/TranscriptionEditor';

const truncate = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'In Progress':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-red-100 text-red-800';
  }
};

const MyNotes: React.FC = () => {
  const { notes, updateNote, deleteNote } = useNoteContext();
  const { user } = useAuth();
  const { users, loading: usersLoading } = useUsers();
  const [editingNote, setEditingNote] = useState<string | null>(null);

  const myNotes = notes.filter(note => note.userId === user?.id);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">My Notes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {myNotes.map(note => (
          <Card key={note.id} className="relative group cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{note.category}</span>
                {note.status && (
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(note.status)}`}>{note.status}</span>
                )}
              </div>
              <Button size="icon" variant="ghost" onClick={() => setEditingNote(note.id)}>
                <span className="sr-only">Edit</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l11.293-11.293a1 1 0 0 0 0-1.414l-3.586-3.586a1 1 0 0 0-1.414 0L3 15v6z"/></svg>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-gray-700 text-sm">{truncate(note.text, 120)}</div>
              {note.workUpdates && note.workUpdates.length > 0 && (
                <div className="mb-2">
                  <div className="font-semibold text-xs text-gray-500">Latest Work Update:</div>
                  <div className="text-xs text-gray-700">{truncate(note.workUpdates[note.workUpdates.length - 1].text, 60)}</div>
                  <div className="text-xs text-gray-400">{new Date(note.workUpdates[note.workUpdates.length - 1].timestamp).toLocaleString()}</div>
                </div>
              )}
              {note.assignedTo && (
                <div className="text-xs text-gray-500">Assigned to: {note.assignedTo}</div>
              )}
            </CardContent>
            {editingNote === note.id && (
              <div className="absolute inset-0 bg-white bg-opacity-95 z-10 flex items-center justify-center">
                <div className="w-full max-w-lg p-4 bg-white rounded-xl shadow-xl">
                  <TranscriptionEditor
                    transcription={note.text}
                    category={note.category}
                    onSave={(text, workUpdates, status, assignedTo) => {
                      updateNote(note.id, text, workUpdates, status, assignedTo);
                      setEditingNote(null);
                    }}
                    onCancel={() => setEditingNote(null)}
                    workUpdates={note.workUpdates}
                    status={note.status}
                    assignedTo={note.assignedTo}
                    users={users}
                    usersLoading={usersLoading}
                  />
                  <Button variant="destructive" className="mt-4 w-full" onClick={() => { deleteNote(note.id); setEditingNote(null); }}>Delete Note</Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyNotes;
