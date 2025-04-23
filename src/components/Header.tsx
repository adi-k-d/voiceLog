import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <header className="w-full py-4 px-6 bg-white shadow-sm flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-voicelog-blue flex items-center justify-center">
          <span className="text-white font-bold text-lg">V</span>
        </div>
        <h1 className="text-xl font-bold">VoiceLog</h1>
      </div>
      {user ? (
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
          Sign In
        </Button>
      )}
    </header>
  );
};

export default Header;