import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNoteContext } from '@/context/NoteContext';
import TranscriptionEditor from '@/components/TranscriptionEditor';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Note, WorkUpdate } from '@/components/NoteList';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useUsers } from '@/hooks/useUsers';

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getNote, updateNote, deleteNote } = useNoteContext();
  const { users, loading: usersLoading } = useUsers();
  const [note, setNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [workUpdateText, setWorkUpdateText] = useState('');

  useEffect(() => {
    const fetchNote = async () => {
      if (id) {
        const noteData = await getNote(id);
        setNote(noteData);
      }
    };
    fetchNote();
  }, [id, getNote]);

  const handleSaveEdit = async (text: string, workUpdates?: WorkUpdate[], status?: string, assignedTo?: string) => {
    if (note) {
      await updateNote(note.id, text, workUpdates, status, assignedTo);
      setIsEditorOpen(false);
      // Refresh note data
      const updatedNote = await getNote(note.id);
      setNote(updatedNote);
    }
  };

  const handleCloseIssue = async () => {
    if (note) {
      await updateNote(note.id, note.text, note.workUpdates, 'Completed');
      const updatedNote = await getNote(note.id);
      setNote(updatedNote);
    }
  };

  const handleDelete = async () => {
    if (note) {
      await deleteNote(note.id);
      navigate('/');
    }
  };

  const handleAddWorkUpdate = async () => {
    if (workUpdateText.trim() && note && user) {
      const newWorkUpdate: WorkUpdate = {
        text: workUpdateText.trim(),
        timestamp: new Date().toISOString(),
        userEmail: user.email || ''
      };
      const updatedWorkUpdates = [...(note.workUpdates || []), newWorkUpdate];
      const newStatus = note.status === 'Completed' ? 'Completed' : 'In Progress';
      await updateNote(note.id, note.text, updatedWorkUpdates, newStatus, note.assignedTo);
      setWorkUpdateText('');
      // Refresh note data
      const updatedNote = await getNote(note.id);
      setNote(updatedNote);
      toast.success('Work update added.');
    } else if (!workUpdateText.trim()) {
      toast.error('Please enter some text for the work update.');
    }
  };

  if (!note) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const isOwner = note.userId === user?.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Note Details</h1>
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {note.category}
              </span>
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                note.status === 'Completed' ? 'bg-green-100 text-green-800' :
                note.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {note.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {isOwner && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditorOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
            {note.category === 'Customer Complaints' && note.status !== 'Completed' && (
              <Button
                onClick={handleCloseIssue}
                className="flex items-center gap-2"
              >
                Close Issue
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Content</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{note.text}</p>
            </div>

            {note.category === 'Customer Complaints' && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Work Updates</h2>
                {note.workUpdates && note.workUpdates.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {note.workUpdates.map((update, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm text-gray-600">
                            {new Date(update.timestamp).toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-600">
                            {update.userEmail}
                          </span>
                        </div>
                        <p className="text-gray-700">{update.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <Textarea
                    className="min-h-[100px] text-base resize-none"
                    placeholder="Add a work update..."
                    value={workUpdateText}
                    onChange={(e) => setWorkUpdateText(e.target.value)}
                  />
                  <Button
                    onClick={handleAddWorkUpdate}
                    disabled={!workUpdateText.trim()}
                  >
                    Add Update
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created By</h3>
                <p className="text-gray-700">{note.useremail}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
                <p className="text-gray-700">{note.assignedTo || 'Not assigned'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-md">
          <TranscriptionEditor
            transcription={note.text}
            category={note.category}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditorOpen(false)}
            workUpdates={note.workUpdates}
            status={note.status}
            assignedTo={note.assignedTo}
            users={users}
            usersLoading={usersLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoteDetail; 