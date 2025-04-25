import React, { createContext, useContext, useState, useEffect } from 'react';
import { NoteCategory } from '@/components/CategorySelector';
import { Note } from '@/components/NoteList';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NoteContextProps {
  notes: Note[];
  loading: boolean;
  addNote: (text: string, category: NoteCategory) => Promise<void>;
  updateNote: (id: string, text: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const NoteContext = createContext<NoteContextProps | undefined>(undefined);

export const useNoteContext = () => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNoteContext must be used within a NoteProvider');
  }
  return context;
};

interface NoteProviderProps {
  children: React.ReactNode;
}

export const NoteProvider: React.FC<NoteProviderProps> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Fetch all notes from Supabase
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchNotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
        toast.error('Failed to load notes');
        setLoading(false);
        return;
      }

      const formattedNotes: Note[] = data.map(note => ({
        id: note.id,
        text: note.content,
        category: note.category as NoteCategory,
        createdAt: new Date(note.created_at),
        userId: note.user_id
      }));

      setNotes(formattedNotes);
      setLoading(false);
    };

    fetchNotes();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('notes_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notes'
        },
        () => {
          fetchNotes(); // Refresh notes when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addNote = async (text: string, category: NoteCategory) => {
    if (!user) {
      toast.error('You must be logged in to add notes');
      return;
    }

    const { error } = await supabase
      .from('notes')
      .insert([
        {
          content: text,
          category,
          user_id: user.id
        }
      ]);

    if (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
      return;
    }

    toast.success('Note added successfully');
  };

  const updateNote = async (id: string, text: string) => {
    if (!user) {
      toast.error('You must be logged in to update notes');
      return;
    }

    const { error } = await supabase
      .from('notes')
      .update({ 
        content: text,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
      throw error;
    }

    toast.success('Note updated successfully');
  };

  const deleteNote = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete notes');
      return;
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
      throw error;
    }

    toast.success('Note deleted successfully');
  };

  return (
    <NoteContext.Provider value={{ notes, loading, addNote, updateNote, deleteNote }}>
      {children}
    </NoteContext.Provider>
  );
};
