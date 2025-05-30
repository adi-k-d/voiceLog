import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NoteCategory } from './CategorySelector';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TranscriptionEditorProps {
  transcription: string;
  category: NoteCategory;
  onSave: (text: string, workUpdate?: string, status?: string) => void;
  onCancel: () => void;
  workUpdate?: string;
  status?: string;
}

const TranscriptionEditor: React.FC<TranscriptionEditorProps> = ({ 
  transcription, 
  category,
  onSave,
  onCancel,
  workUpdate: initialWorkUpdate,
  status: initialStatus
}) => {
  const [text, setText] = useState(transcription);
  const [workUpdate, setWorkUpdate] = useState(initialWorkUpdate || '');
  const [status, setStatus] = useState(initialStatus || 'Not Started');

  const handleWorkUpdateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newWorkUpdate = e.target.value;
    setWorkUpdate(newWorkUpdate);
    // If there's any work update content, set status to In Progress
    if (newWorkUpdate.trim()) {
      setStatus('In Progress');
    }
  };

  const handleSave = () => {
    if (text.trim() === '') {
      toast.error('Please enter some text before saving.');
      return;
    }
    
    if (category === 'Customer Complaints') {
      onSave(text, workUpdate, status);
    } else {
      onSave(text);
    }
    toast.success('Note saved successfully!');
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
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
                <label className="block text-sm font-medium mb-2">Work Update</label>
                <Textarea
                  className="min-h-[100px] text-base resize-none"
                  placeholder="Enter work update details..."
                  value={workUpdate}
                  onChange={handleWorkUpdateChange}
                />
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