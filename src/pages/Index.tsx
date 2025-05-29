import  { useState } from 'react';
import Header from '@/components/Header';
import NoteList from '@/components/NoteList';
import { Button } from '@/components/ui/button';
import { useNoteContext } from '@/context/NoteContext';
import CategorySelector, { NoteCategory } from '@/components/CategorySelector';
import VoiceRecorder from '@/components/VoiceRecorder';
import TranscriptionEditor from '@/components/TranscriptionEditor';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const Index = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | null>(null);
  const [transcription, setTranscription] = useState('');
  const { addNote, notes } = useNoteContext();
  const [step, setStep] = useState<'category' | 'record' | 'transcribe'>('category');

  const handleCategorySelect = (category: NoteCategory) => {
    setSelectedCategory(category);
    setStep('record');
  };

  const handleRecordingComplete = async (_audioBlob: Blob, text: string) => {
    setTranscription(text);
    setStep('transcribe');
  };

  const handleSaveNote = async (text: string, workUpdate?: string) => {
    if (selectedCategory) {
      await addNote(text, selectedCategory, workUpdate);
      handleClose();
    }
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setStep('category');
    setSelectedCategory(null);
    setTranscription('');
  };

  const renderDialogContent = () => {
    switch (step) {
      case 'category':
        return <CategorySelector selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} />;
      case 'record':
        return (
          <div className="flex flex-col items-center">
            <div className="mb-6 text-center">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {selectedCategory}
              </span>
            </div>
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
          </div>
        );
      case 'transcribe':
        return selectedCategory ? (
          <TranscriptionEditor
            transcription={transcription}
            category={selectedCategory}
            onSave={handleSaveNote}
            onCancel={handleClose}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notes</h1>
          <Button onClick={() => setIsDialogOpen(true)}>Add New Note</Button>
        </div>
        <NoteList notes={notes} onCreateNew={() => setIsDialogOpen(true)} />

        <Dialog open={isDialogOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-md">
            {renderDialogContent()}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Index;
