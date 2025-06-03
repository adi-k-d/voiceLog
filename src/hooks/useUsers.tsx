import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  username?: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get all users from the profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, username');

        if (error) throw error;

        // Convert null to undefined for username to match the User interface
        const formattedUsers = (data || []).map(user => ({
          id: user.id,
          email: user.email,
          username: user.username || undefined
        }));

        setUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading };
} 