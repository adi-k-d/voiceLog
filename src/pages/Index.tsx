import  { useState } from 'react';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import NoteList from '@/components/NoteList';
import { Button } from '@/components/ui/button';
import { useNoteContext } from '@/context/NoteContext';
import CategorySelector, { NoteCategory } from '@/components/CategorySelector';
import VoiceRecorder from '@/components/VoiceRecorder';
import TranscriptionEditor from '@/components/TranscriptionEditor';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Mic, FileText, Users, Settings, BarChart } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { WorkUpdate } from '@/components/NoteList';

const Index = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | null>(null);
  const [transcription, setTranscription] = useState('');
  const { addNote, notes } = useNoteContext();
  const { users, loading: usersLoading } = useUsers();
  const [step, setStep] = useState<'category' | 'record' | 'transcribe'>('category');

  const handleCategorySelect = (category: NoteCategory) => {
    setSelectedCategory(category);
    setStep('record');
  };

  const handleRecordingComplete = async (_audioBlob: Blob, text: string) => {
    setTranscription(text);
    setStep('transcribe');
  };

  const handleSaveNote = async (text: string, workUpdates?: WorkUpdate[], status?: string, assignedTo?: string) => {
    if (selectedCategory) {
      await addNote(text, selectedCategory, workUpdates, status, assignedTo);
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
            users={users}
            usersLoading={usersLoading}
          />
        ) : null;
      default:
        return null;
    }
  };
  const portals = [
    {
      title: "Work Update",
      description: "Document work progress and project updates",
      icon: BarChart,
      color: "bg-blue-500",
      action: () => navigate('/work-update')
    },
    {
      title: "Improvement Idea",
      description: "Capture ideas for process improvements",
      icon: Settings,
      color: "bg-green-500",
      action: () => navigate('/improvement-idea')
    },
    {
      title: "New Learning",
      description: "Record new knowledge and learnings",
      icon: FileText,
      color: "bg-purple-500",
      action: () => navigate('/new-learning')
    },
    {
      title: "Customer Complaints",
      description: "Log customer feedback and complaints",
      icon: Users,
      color: "bg-red-500",
      action: () => navigate('/customer-complaints')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section with Orange Gradient */}
      <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 py-16 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            WELCOME TO VOICELOG
          </h1>
          <p className="text-xl text-orange-100 mb-8">
            VOICE NOTES PORTAL
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Portals Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">PORTALS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portals.map((portal, index) => (
              <div
                key={index}
                onClick={portal.action}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`${portal.color} p-4 rounded-lg group-hover:scale-110 transition-transform`}>
                    <portal.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{portal.title}</h3>
                    <p className="text-sm text-gray-600">{portal.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Notes</h2>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600">
              <Mic className="h-4 w-4 mr-2" />
              Add New Note
            </Button>
          </div>
          <NoteList notes={notes.slice(0, 6)}  onCreateNew={() => setIsDialogOpen(true)} />
        </div>

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
