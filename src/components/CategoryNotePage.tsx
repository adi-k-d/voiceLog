
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNoteContext } from '@/context/NoteContext';
import CategorySelector, { NoteCategory } from '@/components/CategorySelector';
import VoiceRecorder from '@/components/VoiceRecorder';
import TranscriptionEditor from '@/components/TranscriptionEditor';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, Mic, MoreHorizontal } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CategoryNotePageProps {
  category: NoteCategory;
  title: string;
  description: string;
}

const CategoryNotePage: React.FC<CategoryNotePageProps> = ({ category, title, description }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | null>(null);
  const [transcription, setTranscription] = useState('');
  const { addNote, notes,  updateNote, deleteNote } = useNoteContext();
  const [step, setStep] = useState<'category' | 'record' | 'transcribe'>('category');
  const [searchTerm, setSearchTerm] = useState('');
  

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

  const handleVoiceNoteClick = () => {
    setIsDialogOpen(true);
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

  // Filter notes by category
  const categoryNotes = notes.filter(note => note.category === category);

  const filteredNotes = categoryNotes.filter(note =>
    note.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.assignedTo && note.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

 
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onVoiceNoteClick={handleVoiceNoteClick} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
              <p className="text-gray-600 mt-2">{description}</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600">
              <Mic className="h-4 w-4 mr-2" />
              Add New Note
            </Button>
          </div>

          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Training ID</TableHead>
                <TableHead>Assigned to me by</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Link Requs ID</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotes.map((note, index) => (
                <TableRow key={note.id}>
                  <TableCell className="font-medium">
                    TRN-{String(index + 1).padStart(3, '0')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {note.assignedTo?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm">{note.assignedTo || 'Unassigned'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{note.category}</span>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="truncate text-sm">{note.text}</p>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('Pending')}`}>
                      Pending
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-blue-600">REQ-{String(index + 1).padStart(3, '0')}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      index % 3 === 0 ? 'bg-red-100 text-red-800' : 
                      index % 3 === 1 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {index % 3 === 0 ? 'High' : index % 3 === 1 ? 'Medium' : 'Low'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateNote(note.id, note.text, note.workUpdate)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteNote(note.id)} className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

export default CategoryNotePage;