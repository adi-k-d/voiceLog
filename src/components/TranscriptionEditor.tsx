import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NoteCategory } from './CategorySelector';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';

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
  workUpdates: initialWorkUpdates = [],
  status: initialStatus,
  assignedTo: initialAssignedTo,
  users,
  usersLoading
}) => {
  const [text, setText] = useState(transcription);
  const [workUpdateText, setWorkUpdateText] = useState('');
  const [workUpdates, setWorkUpdates] = useState<WorkUpdate[]>(initialWorkUpdates);
  const [status, setStatus] = useState(initialStatus || 'Not Started');
  const [assignedTo, setAssignedTo] = useState(initialAssignedTo || '');
  const { user } = useAuth();

  const handleWorkUpdateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWorkUpdateText(e.target.value);
  };

  const addWorkUpdate = () => {
    if (workUpdateText.trim()) {
      const newWorkUpdate: WorkUpdate = {
        text: workUpdateText.trim(),
        timestamp: new Date().toISOString(),
        userEmail: user?.email || ''
      };
      setWorkUpdates([...workUpdates, newWorkUpdate]);
      setWorkUpdateText('');
      setStatus('In Progress');
    }
  };

  const handleSave = () => {
    if (text.trim() === '') {
      toast.error('Please enter some text before saving.');
      return;
    }
    
    if (category === 'Customer Complaints') {
      onSave(text, workUpdates, status, assignedTo);
    } else {
      onSave(text);
    }
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
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Assigned By</label>
                <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-600">
                  {user?.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Assigned To</label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
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

              <div>
                <label className="block text-sm font-medium mb-2">Work Updates</label>
                {workUpdates.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {workUpdates.map((update, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md">
                        <div className="text-sm text-gray-600">
                          {new Date(update.timestamp).toLocaleString()} - {update.userEmail}
                        </div>
                        <div className="mt-1">{update.text}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <Textarea
                    className="min-h-[100px] text-base resize-none"
                    placeholder="Enter new work update..."
                    value={workUpdateText}
                    onChange={handleWorkUpdateChange}
                  />
                  <Button 
                    variant="outline" 
                    onClick={addWorkUpdate}
                    disabled={!workUpdateText.trim()}
                  >
                    Add Update
                  </Button>
                </div>
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