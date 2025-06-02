
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChevronDown, Mic } from 'lucide-react';

interface HeaderProps {
  onVoiceNoteClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onVoiceNoteClick }) => {
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

  const navItems = [
    { label: 'Home', path: '/', active: false },
    { label: 'My Notes', path: '/my-notes', active: false }
  ];

  return (
    <header className="w-full py-3 px-6 bg-white shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-orange-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <div>
            <span className="text-lg font-bold text-gray-800">VoiceLog</span>
            <br />
            <span className="text-xs text-gray-600">Tech</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center bg-orange-100 rounded-full px-2 py-1">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                window.location.pathname === item.path
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Voice Note Button */}
          {user && onVoiceNoteClick && (
            <Button onClick={onVoiceNoteClick} className="bg-orange-500 hover:bg-orange-600">
              <Mic className="h-4 w-4 mr-2" />
              Record Note
            </Button>
          )}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;