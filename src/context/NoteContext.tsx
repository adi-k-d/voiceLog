import React, { createContext, useContext, useState, useEffect } from 'react';
import { NoteCategory } from '@/components/CategorySelector';
import { Note } from '@/components/NoteList';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NoteContextProps {
  notes: Note[];
  loading: boolean;
  addNote: (text: string, category: NoteCategory, workUpdate?: string, status?: string) => Promise<void>;
  updateNote: (id: string, text: string, workUpdate?: string, status?: string) => Promise<void>;
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
    
      setNotes([]);
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

      

      const formattedNotes: Note[] = data.map((note) => {
       
        // Ensure we have a valid date
        let createdAt = new Date();
        if (note.created_at) {
          
          const parsedDate = new Date(note.created_at);
          
          if (!isNaN(parsedDate.getTime())) {
            createdAt = parsedDate;
          } else {
            console.warn(`Invalid date detected for note ${note.id}: ${note.created_at}`);
          }
        } else {
          console.warn(`No created_at value for note ${note.id}`);
        }

        const formattedNote: Note = {
          id: note.id,
          text: note.content || '',
          category: note.category as NoteCategory,
          createdAt: createdAt,
          userId: note.user_id,
          workUpdate: note.work_update || '',
          useremail: note.useremail || '',
          status: note.status || 'Not Started'

        };

       
        return formattedNote;
      });

      
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

  const addNote = async (text: string, category: NoteCategory, workUpdate?: string, status?: string) => {
    if (!user) {
      toast.error('You must be logged in to add notes');
      return;
    }

    console.log('Adding note:', { text, category, workUpdate, status, userId: user.id });

    const noteData: any = {
      content: text,
      category,
      user_id: user.id,
      work_update: workUpdate || '',
      useremail: user.email,
      status: category === 'Customer Complaints' ? (status || 'Not Started') : null
    };

    const { error } = await supabase
      .from('notes')
      .insert([noteData]);

    if (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
      return;
    }

    toast.success('Note added successfully');
  };

  const updateNote = async (id: string, text: string, workUpdate?: string, status?: string) => {
    if (!user) {
      toast.error('You must be logged in to update notes');
      return;
    }

    const updateData: any = {
      content: text,
      updated_at: new Date().toISOString()
    };

    if (workUpdate !== undefined) {
      updateData.work_update = workUpdate;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const { error } = await supabase
      .from('notes')
      .update(updateData)
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