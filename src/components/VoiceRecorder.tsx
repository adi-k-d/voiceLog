import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Play, Check, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, transcription: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Configure audio for better mobile compatibility
  const getMediaOptions = () => {
    const options: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }
    };
    
    // Force WebM on mobile devices
    if (isMobile) {
      return { 
        audio: true,
        mimeType: 'audio/webm'
      };
    }
    
    return options;
  };

  const startRecording = async () => {
    try {
      // Clear any previous errors
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia(getMediaOptions());
      
      // Get supported MIME type
      const mimeType = getSupportedMimeType();
      console.log('Using MIME type:', mimeType);
      
      mediaRecorderRef.current = new MediaRecorder(stream, { 
        mimeType: mimeType
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const mimeType = getSupportedMimeType();
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(audioBlob);
        
        // Create URL for audio playback
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        if (audioRef.current) {
          audioRef.current.src = url;
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Function to get a supported MIME type for current browser
  const getSupportedMimeType = (): string => {
    // Force WebM or show error
    if (!MediaRecorder.isTypeSupported('audio/webm')) {
      throw new Error('WebM audio recording is not supported in this browser. Please use a modern browser that supports WebM.');
    }
    return 'audio/webm';
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
    if (audioRef.current && audioUrl) {
      setIsPlaying(true);
      audioRef.current.play();
    }
  };

  const transcribeAudio = async (blob: Blob): Promise<string> => {
    try {
      // Clear any previous errors
      setError(null);
      
      // Convert blob to base64
      const buffer = await blob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      
      console.log('Sending audio for transcription, size:', buffer.byteLength, 'type:', blob.type);

      const { data, error } = await supabase.functions.invoke('transcribe', {
        body: { 
          audio: base64Audio,
          audioType: blob.type,  // Send the audio MIME type
          recordingTime: recordingTime // Send recording duration
        }
      });

      if (error) {
        console.error('Transcription error from API:', error);
        throw new Error(`Transcription failed: ${error.message}`);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data || !data.text) {
        throw new Error('No transcription returned from the service');
      }

      return data.text;
    } catch (error) {
      console.error('Transcription process error:', error);
      throw error;
    }
  };

  const confirmRecording = async () => {
    if (!audioBlob) {
      toast.error('No recording found. Please record audio first.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      toast.info('Transcribing your recording...');
      const transcription = await transcribeAudio(audioBlob);
      
      if (transcription.trim() === '') {
        setError('No speech detected. Please try speaking more clearly and ensure there is no background noise.');
        toast.warning('No speech detected. Please try speaking more clearly.');
        setIsProcessing(false);
        return;
      }
      
      onRecordingComplete(audioBlob, transcription);
      toast.success('Recording transcribed successfully');
    } catch (error) {
      console.error('Transcription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Transcription failed: ${errorMessage}`);
      toast.error(`Error transcribing audio: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsPlaying(false);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Clean up audio URLs to prevent memory leaks
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
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
              <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 h-10">
                <div className="w-1 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:0ms]"></div>
                <div className="w-1 h-6 bg-blue-500 rounded-full animate-bounce [animation-delay:200ms]"></div>
                <div className="w-1 h-8 bg-blue-500 rounded-full animate-bounce [animation-delay:400ms]"></div>
                <div className="w-1 h-6 bg-blue-500 rounded-full animate-bounce [animation-delay:600ms]"></div>
                <div className="w-1 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:800ms]"></div>
              </div>
              <div className="text-sm text-gray-500">{formatTime(recordingTime)}</div>
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
          
          {error && (
            <Alert variant="destructive" className="mb-3 mt-1">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-4">
            {!isRecording && !audioBlob && (
              <Button 
                onClick={startRecording} 
                className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600"
              >
                <Mic className="h-8 w-8 text-white" />
              </Button>
            )}
            
            {isRecording && (
              <Button 
                onClick={stopRecording} 
                className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 animate-pulse-recording"
              >
                <Mic className="h-8 w-8 text-white" />
              </Button>
            )}
            
            {!isRecording && audioBlob && (
              <>
                <Button 
                  onClick={playAudio} 
                  disabled={isPlaying}
                  className="h-14 w-14 rounded-full bg-blue-500 hover:bg-blue-500"
                >
                  <Play className="h-6 w-6 text-white" />
                </Button>
                
                <Button 
                  onClick={confirmRecording}
                  disabled={isProcessing} 
                  className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600"
                >
                  {isProcessing ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Check className="h-6 w-6 text-white" />}
                </Button>
              </>
            )}
          </div>
          
          {isProcessing && (
            <div className="text-sm text-gray-500 mt-2">
              Processing recording...
            </div>
          )}
          
          {!isProcessing && audioBlob && recordingTime < 1 && !error && (
            <div className="text-sm text-amber-500 mt-2">
              Warning: Recording was very short. Transcription may not work properly.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;