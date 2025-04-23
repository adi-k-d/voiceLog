import { useState } from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import './App.css'

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TemplateForm from "./pages/TemplateForm";
import UseTemplate from "./pages/UseTemplate";
import NotFound from "./pages/NotFound";

function App() {
  

  return (
    <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create" 
              element={
                <ProtectedRoute>
                  <TemplateForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit/:id" 
              element={
                <ProtectedRoute>
                  <TemplateForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/use/:id" 
              element={
                <ProtectedRoute>
                  <UseTemplate />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
     
  )
}

export default App
