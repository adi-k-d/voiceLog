import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NoteCategory } from './CategorySelector';
import { toast } from 'sonner';

interface TranscriptionEditorProps {
  transcription: string;
  category: NoteCategory;
  onSave: (text: string, workUpdate?: string) => void;
  onCancel: () => void;
}

const TranscriptionEditor: React.FC<TranscriptionEditorProps> = ({ 
  transcription, 
  category,
  onSave,
  onCancel
}) => {
  const [text, setText] = useState(transcription);
  const [workUpdate, setWorkUpdate] = useState('Uninitialized');

  const handleSave = () => {
    if (text.trim() === '') {
      toast.error('Please enter some text before saving.');
      return;
    }
    
    if (category === 'Customer Support') {
      onSave(text, workUpdate);
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

          {category === 'Customer Support' && (
            <div>
              <label className="block text-sm font-medium mb-2">Work Update</label>
              <Textarea
                className="min-h-[100px] text-base resize-none"
                placeholder="Enter work update details..."
                value={workUpdate}
                onChange={(e) => setWorkUpdate(e.target.value)}
              />
            </div>
          )}
          
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Save Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionEditor;