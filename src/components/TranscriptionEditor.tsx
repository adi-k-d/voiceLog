import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NoteCategory } from './CategorySelector';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface WorkUpdate {
  text: string;
  timestamp: string;
  userEmail: string;
}

interface TranscriptionEditorProps {
  transcription: string;
  category: NoteCategory;
  onSave: (text: string, workUpdates?: WorkUpdate[], status?: string, assignedTo?: string) => void;
  onCancel: () => void;
  workUpdates?: WorkUpdate[];
  status?: string;
  assignedTo?: string;
  users: Array<{ id: string; email: string; username?: string }>;
  usersLoading: boolean;
}

const TranscriptionEditor: React.FC<TranscriptionEditorProps> = ({
  transcription,
  category,
  onSave,
  onCancel,
  workUpdates: initialWorkUpdates,
  status: initialStatus,
  assignedTo: initialAssignedTo,
  users,
  usersLoading
}) => {
  const [text, setText] = useState(transcription);
  const [currentAssignedTo, setCurrentAssignedTo] = useState(initialAssignedTo || '');
  
  const handleSave = () => {
    if (text.trim() === '') {
      toast.error('Please enter some text before saving.');
      return;
    }
    
    onSave(text, initialWorkUpdates || [], initialStatus || 'Not Started', currentAssignedTo || undefined);
    toast.success('Note saved successfully!');
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 max-h-[80vh] overflow-y-auto">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-medium">Edit Transcription</h2>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {category}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Transcription</label>
            <Textarea
              className="min-h-[150px] text-base resize-none"
              placeholder="Edit your transcribed note..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {category === 'Customer Complaints' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Assigned To</label>
                <Select value={currentAssignedTo} onValueChange={setCurrentAssignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersLoading ? (
                      <SelectItem value="loading" disabled>Loading users...</SelectItem>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.email}>
                          {user.username || user.email}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionEditor;