import React, { useState } from 'react';
import Header from '@/components/Header';
import VoiceRecorder from '@/components/VoiceRecorder';
import CategorySelector, { NoteCategory } from '@/components/CategorySelector';
import TranscriptionEditor from '@/components/TranscriptionEditor';
import NoteList from '@/components/NoteList';
import { useNoteContext } from '@/context/NoteContext';
import { Button } from '@/components/ui/button';

enum AppState {
  LIST,
  CATEGORY,
  RECORD,
  TRANSCRIBE
}

const Index = () => {
  const { notes, addNote } = useNoteContext();
  const [appState, setAppState] = useState<AppState>(notes.length > 0 ? AppState.LIST : AppState.CATEGORY);
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | null>(null);
  const [transcription, setTranscription] = useState<string>('');

  const handleCategorySelect = (category: NoteCategory) => {
    setSelectedCategory(category);
    setAppState(AppState.RECORD);
  };

  const handleRecordingComplete = (_audioBlob: Blob, text: string) => {
    setTranscription(text);
    setAppState(AppState.TRANSCRIBE);
  };

  const handleSaveNote = (text: string) => {
    if (selectedCategory) {
      addNote(text, selectedCategory);
      setAppState(AppState.LIST);
      setSelectedCategory(null);
      setTranscription('');
    }
  };

  const handleCancel = () => {
    setAppState(AppState.CATEGORY);
    setSelectedCategory(null);
    setTranscription('');
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.LIST:
        return <NoteList notes={notes} onCreateNew={() => setAppState(AppState.CATEGORY)} />;
      case AppState.CATEGORY:
        return <CategorySelector selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} />;
      case AppState.RECORD:
        return (
          <div className="flex flex-col items-center w-full max-w-md mx-auto px-4">
            <div className="mb-6 text-center">
              <span className="category-pill">{selectedCategory}</span>
            </div>
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
            <Button 
              variant="ghost"
              onClick={handleCancel}
              className="mt-4 w-full max-w-[200px]"
            >
              Cancel
            </Button>
          </div>
        );
      case AppState.TRANSCRIBE:
        return selectedCategory ? (
          <TranscriptionEditor 
            transcription={transcription}
            category={selectedCategory}
            onSave={handleSaveNote}
            onCancel={handleCancel}
          />
        ) : null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 md:py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;