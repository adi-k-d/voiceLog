import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useNoteContext } from '@/context/NoteContext';
import CategorySelector, { NoteCategory } from '@/components/CategorySelector';
import VoiceRecorder from '@/components/VoiceRecorder';
import TranscriptionEditor from '@/components/TranscriptionEditor';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, Mic, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Note, WorkUpdate } from '@/components/NoteList';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useUsers } from '@/hooks/useUsers';

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
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | null>(null);
  const [transcription, setTranscription] = useState('');
  const { addNote, notes, updateNote, deleteNote } = useNoteContext();
  const { users, loading: usersLoading } = useUsers();
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

  const handleVoiceNoteClick = () => {
    setIsDialogOpen(true);
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsDetailDialogOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsDetailDialogOpen(false);
    setIsDialogOpen(true);
    setStep('transcribe');
    setTranscription(note.text);
    setSelectedCategory(note.category);
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId);
    setIsDetailDialogOpen(false);
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
            workUpdates={selectedNote?.workUpdates}
            status={selectedNote?.status}
            assignedTo={selectedNote?.assignedTo}
            users={users}
            usersLoading={usersLoading}
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
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'not started':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onVoiceNoteClick={handleVoiceNoteClick} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h1>
            <p className="text-gray-600 mt-2">{description}</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600 w-full md:w-auto">
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

        {/* Notes Grid */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card 
              key={note.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleNoteClick(note)}
            >
              <CardHeader className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {note.useremail?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{note.useremail}</p>
                      <p className="text-xs text-gray-500">{formatDate(note.createdAt)}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleEditNote(note);
                      }}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }} 
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(note.status || '')}`}>
                    {note.status || 'Not Started'}
                  </span>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {note.category}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3">{note.text}</p>
                {note.workUpdates && note.workUpdates.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500">Latest Update:</p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {note.workUpdates[note.workUpdates.length - 1].text}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(note.workUpdates[note.workUpdates.length - 1].timestamp).toLocaleString()}
                    </p>
                  </div>
                )}
                {note.assignedTo && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500">Assigned To:</p>
                    <p className="text-xs text-gray-600">{note.assignedTo}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Note Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-md">
            {renderDialogContent()}
          </DialogContent>
        </Dialog>

        {/* Note Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            {selectedNote && (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">Note Details</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedNote.status || '')}`}>
                        {selectedNote.status || 'Not Started'}
                      </span>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {selectedNote.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditNote(selectedNote)}
                      className="flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteNote(selectedNote.id)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Content</h3>
                    <p className="mt-1 text-gray-700 whitespace-pre-wrap">{selectedNote.text}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Created By</h3>
                      <p className="mt-1 text-gray-700">{selectedNote.useremail}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                      <p className="mt-1 text-gray-700">{formatDate(selectedNote.createdAt)}</p>
                    </div>
                    {selectedNote.assignedTo && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
                        <p className="mt-1 text-gray-700">{selectedNote.assignedTo}</p>
                      </div>
                    )}
                  </div>

                  {selectedNote.workUpdates && selectedNote.workUpdates.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Work Updates</h3>
                      <div className="space-y-4">
                        {[...selectedNote.workUpdates]
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map((update, index) => (
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
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default CategoryNotePage;