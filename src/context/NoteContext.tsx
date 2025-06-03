import React, { createContext, useContext, useState, useEffect } from 'react';
import { NoteCategory } from '@/components/CategorySelector';
import { Note, WorkUpdate } from '@/components/NoteList';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NoteContextProps {
  notes: Note[];
  loading: boolean;
  addNote: (text: string, category: NoteCategory, workUpdates?: WorkUpdate[], status?: string, assignedTo?: string) => Promise<void>;
  updateNote: (id: string, text: string, workUpdates?: WorkUpdate[], status?: string, assignedTo?: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNote: (id: string) => Promise<Note>;
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

        // Parse work updates from JSON string if it exists
        let workUpdates: WorkUpdate[] = [];
        if (note.work_updates) {
          try {
            workUpdates = JSON.parse(note.work_updates);
          } catch (e) {
            console.warn(`Failed to parse work updates for note ${note.id}`);
          }
        }

        const formattedNote: Note = {
          id: note.id,
          text: note.content || '',
          category: note.category as NoteCategory,
          createdAt: createdAt,
          userId: note.user_id,
          workUpdates: workUpdates,
          useremail: note.useremail || '',
          status: note.status || 'Not Started',
          assignedTo: note.assigned_to || '',
          assignedBy: note.assigned_by || ''
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

  const addNote = async (text: string, category: NoteCategory, workUpdates?: WorkUpdate[], status?: string, assignedTo?: string) => {
    if (!user) {
      toast.error('You must be logged in to add notes');
      return;
    }

    console.log('Adding note:', { text, category, workUpdates, status, userId: user.id, assignedTo });

    const noteData: any = {
      content: text,
      category,
      user_id: user.id,
      work_updates: workUpdates ? JSON.stringify(workUpdates) : '[]',
      useremail: user.email,
      status: category === 'Customer Complaints' ? (status || 'Not Started') : null,
      assigned_to: assignedTo || null,
      assigned_by: user.email
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

  const updateNote = async (id: string, text: string, workUpdates?: WorkUpdate[], status?: string, assignedTo?: string) => {
    if (!user) {
      toast.error('You must be logged in to update notes');
      return;
    }

    const updateData: any = {
      content: text,
      updated_at: new Date().toISOString()
    };

    if (workUpdates !== undefined) {
      updateData.work_updates = JSON.stringify(workUpdates);
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (assignedTo !== undefined) {
      updateData.assigned_to = assignedTo;
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

  const getNote = async (id: string): Promise<Note> => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching note:', error);
      toast.error('Failed to load note');
      throw error;
    }

    if (!data) {
      throw new Error('Note not found');
    }

    let createdAt = new Date();
    if (data.created_at) {
      const parsedDate = new Date(data.created_at);
      if (!isNaN(parsedDate.getTime())) {
        createdAt = parsedDate;
      }
    }

    // Parse work updates from JSON string if it exists
    let workUpdates: WorkUpdate[] = [];
    if (data.work_updates) {
      try {
        workUpdates = JSON.parse(data.work_updates);
      } catch (e) {
        console.warn(`Failed to parse work updates for note ${data.id}`);
      }
    }

    return {
      id: data.id,
      text: data.content || '',
      category: data.category as NoteCategory,
      createdAt: createdAt,
      userId: data.user_id,
      workUpdates: workUpdates,
      useremail: data.useremail || '',
      status: data.status || 'Not Started',
      assignedTo: data.assigned_to || '',
      assignedBy: data.assigned_by || ''
    };
  };

  return (
    <NoteContext.Provider value={{ notes, loading, addNote, updateNote, deleteNote, getNote }}>
      {children}
    </NoteContext.Provider>
  );
};