import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NoteProvider } from "@/context/NoteContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import MyNotes from "./pages/MyNotes";
import WorkUpdate from "./pages/WorkUpdate";
import ImprovementIdea from "./pages/ImprovementIdea";
import NewLearning from "./pages/NewLearning";
import CustomerComplaints from "./pages/CustomerComplaints";
import NoteDetail from "./pages/NoteDetail";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NoteProvider>
        
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/my-notes" element={
              <ProtectedRoute>
                <MyNotes />
              </ProtectedRoute>
            } />
            <Route path="/work-update" element={
              <ProtectedRoute>
                <WorkUpdate />
              </ProtectedRoute>
            } />
            <Route path="/improvement-idea" element={
              <ProtectedRoute>
                <ImprovementIdea />
              </ProtectedRoute>
            } />
            <Route path="/new-learning" element={
              <ProtectedRoute>
                <NewLearning />
              </ProtectedRoute>
            } />
            <Route path="/customer-complaints" element={
              <ProtectedRoute>
                <CustomerComplaints />
              </ProtectedRoute>
            } />
            <Route path="/notes/:id" element={
              <ProtectedRoute>
                <NoteDetail />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </NoteProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;