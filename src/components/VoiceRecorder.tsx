import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Play, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, transcription: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(audioBlob);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Error accessing microphone. Please make sure you have granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioBlob) {
      setIsPlaying(true);
      audioRef.current.play();
    }
  };

  const transcribeAudio = async (blob: Blob): Promise<string> => {
    // Convert blob to base64
    const buffer = await blob.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    const { data, error } = await supabase.functions.invoke('transcribe', {
      body: { audio: base64Audio }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.text;
  };

  const confirmRecording = async () => {
    if (audioBlob) {
      setIsProcessing(true);
      try {
        const transcription = await transcribeAudio(audioBlob);
        onRecordingComplete(audioBlob, transcription);
        toast.success('Recording transcribed successfully');
      } catch (error) {
        console.error('Transcription error:', error);
        toast.error('Error transcribing audio. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsPlaying(false);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-center mb-4">
            {isRecording ? (
              <div className="waveform-container">
                <div className="waveform-bar animate-waveform-1"></div>
                <div className="waveform-bar animate-waveform-2"></div>
                <div className="waveform-bar animate-waveform-3"></div>
                <div className="waveform-bar animate-waveform-4"></div>
                <div className="waveform-bar animate-waveform-5"></div>
              </div>
            ) : audioBlob ? (
              <div className="text-center">
                <div className="text-lg font-medium mb-2">Recording Complete</div>
                <div className="text-sm text-gray-500">{formatTime(recordingTime)}</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-lg font-medium mb-2">Ready to Record</div>
                <div className="text-sm text-gray-500">Tap the mic to start</div>
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            {!isRecording && !audioBlob && (
              <Button 
                onClick={startRecording} 
                className="h-16 w-16 rounded-full bg-voicelog-red hover:bg-red-600"
              >
                <Mic className="h-8 w-8 text-white" />
              </Button>
            )}
            
            {isRecording && (
              <Button 
                onClick={stopRecording} 
                className="h-16 w-16 rounded-full bg-voicelog-red hover:bg-red-600 animate-pulse-recording"
              >
                <Mic className="h-8 w-8 text-white" />
              </Button>
            )}
            
            {!isRecording && audioBlob && (
              <>
                <Button 
                  onClick={playAudio} 
                  disabled={isPlaying}
                  className="h-14 w-14 rounded-full bg-voicelog-blue hover:bg-blue-500"
                >
                  <Play className="h-6 w-6 text-white" />
                </Button>
                
                <Button 
                  onClick={confirmRecording}
                  disabled={isProcessing} 
                  className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600"
                >
                  <Check className="h-6 w-6 text-white" />
                </Button>
              </>
            )}
          </div>
          
          {isProcessing && (
            <div className="text-sm text-gray-500 mt-2">
              Processing recording...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;