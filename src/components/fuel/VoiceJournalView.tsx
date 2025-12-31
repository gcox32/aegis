'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mic, MicOff, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import VoiceJournalConfirmation from './VoiceJournalConfirmation';

export default function VoiceJournalView() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [confirmationData, setConfirmationData] = useState<any>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { showToast } = useToast();

  // Check for browser support and request permission
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasPermission(false);
      showToast({
        title: 'Speech recognition not supported',
        description: 'Your browser does not support speech recognition. Please use a modern browser like Chrome or Edge.',
        variant: 'error',
      });
      return;
    }

    // Request microphone permission
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        setHasPermission(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscription((prev) => {
            // Remove any previous interim text markers
            const cleaned = prev.replace(/\s*\[listening\.\.\.\]\s*$/, '').trim();
            const newText = cleaned + (cleaned ? ' ' : '') + finalTranscript;
            return newText + (interimTranscript ? ' [listening...]' : '');
          });
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'no-speech') {
            // This is common, don't show error - user might just be pausing
            return;
          }
          setIsRecording(false);
          
          let errorTitle = 'Recording error';
          let errorDescription = '';
          
          switch (event.error) {
            case 'not-allowed':
              errorTitle = 'Microphone access denied';
              errorDescription = 'Please enable microphone access in your browser settings to use voice journaling.';
              break;
            case 'aborted':
              errorTitle = 'Recording stopped';
              errorDescription = 'Recording was interrupted. Please try again.';
              break;
            case 'network':
              errorTitle = 'Network error';
              errorDescription = 'Could not connect to speech recognition service. Please check your connection.';
              break;
            case 'audio-capture':
              errorTitle = 'No microphone found';
              errorDescription = 'No microphone was detected. Please connect a microphone and try again.';
              break;
            case 'service-not-allowed':
              errorTitle = 'Service not allowed';
              errorDescription = 'Speech recognition service is not available. Please try again later.';
              break;
            default:
              errorDescription = `Error: ${event.error}`;
          }
          
          showToast({
            title: errorTitle,
            description: errorDescription,
            variant: 'error',
          });
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      })
      .catch((err) => {
        console.error('Microphone permission error:', err);
        setHasPermission(false);
        showToast({
          title: 'Microphone access denied',
          description: 'Please enable microphone access to use voice journaling.',
          variant: 'error',
        });
      });
  }, [showToast]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      showToast({
        title: 'Speech recognition not available',
        description: 'Please refresh the page and try again.',
        variant: 'error',
      });
      return;
    }

    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Failed to start recognition:', err);
      showToast({
        title: 'Failed to start recording',
        description: err.message || 'Please try again.',
        variant: 'error',
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      // Clean up interim text markers
      setTranscription((prev) => prev.replace(/\s*\[listening\.\.\.\]\s*$/, '').trim());
    }
  };

  const handleSubmit = async () => {
    const text = transcription.trim();
    
    if (!text) {
      showToast({
        title: 'No transcription',
        description: 'Please record or type something before submitting.',
        variant: 'error',
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStage('Parsing meal description...');
    
    try {
      const res = await fetch('/api/fuel/meals/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcription: text }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to process transcription' }));
        throw new Error(errorData.error || 'Failed to process transcription');
      }

      setProcessingStage('Finalizing...');
      const data = await res.json();
      setConfirmationData(data);
    } catch (err: any) {
      setIsProcessing(false);
      setProcessingStage('');
      
      // Provide more specific error messages
      let errorTitle = 'Failed to process';
      let errorDescription = err.message || 'Please try again.';
      
      if (err.message.includes('OpenAI')) {
        errorTitle = 'AI Processing Error';
        if (err.message.includes('rate limit')) {
          errorDescription = 'Too many requests. Please wait a moment and try again.';
        } else if (err.message.includes('authentication')) {
          errorDescription = 'AI service configuration error. Please contact support.';
        } else if (err.message.includes('temporarily unavailable')) {
          errorDescription = 'AI service is temporarily unavailable. Please try again in a moment.';
        }
      } else if (err.message.includes('Invalid meal data') || err.message.includes('Invalid food data')) {
        errorTitle = 'Could not parse meal';
        errorDescription = 'The meal description could not be understood. Please try rephrasing or be more specific about foods and portions.';
      } else if (err.message.includes('parse')) {
        errorTitle = 'Parsing Error';
        errorDescription = 'Could not understand the meal description. Please try again with a clearer description.';
      }
      
      showToast({
        title: errorTitle,
        description: errorDescription,
        variant: 'error',
      });
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const handleConfirmationCancel = () => {
    setConfirmationData(null);
  };

  const handleCancel = () => {
    stopRecording();
    if (confirmationData) {
      setConfirmationData(null);
    } else {
      router.back();
    }
  };

  // Show confirmation view if we have parsed data
  if (confirmationData) {
    return <VoiceJournalConfirmation data={confirmationData} onCancel={handleConfirmationCancel} />;
  }

  if (hasPermission === false) {
    return (
      <div className="z-50 fixed inset-0 flex justify-center items-center bg-black">
        <div className="space-y-4 px-6 max-w-md text-center">
          <p className="text-white text-lg">
            Speech recognition is not available in your browser or microphone access was denied.
          </p>
          <p className="text-zinc-400 text-sm">
            Please use Chrome, Edge, or another browser that supports speech recognition, and ensure microphone permissions are enabled.
          </p>
          <button
            onClick={handleCancel}
            className="bg-zinc-800 hover:bg-zinc-700 mt-6 px-6 py-3 rounded-full text-white transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="z-50 fixed inset-0 flex flex-col bg-black">
      {/* Main Content Area - Centered Transcription */}
      <div className="flex flex-1 justify-center items-center px-6 py-8">
        <div className="w-full max-w-3xl">
          {isProcessing ? (
            <div className="flex flex-col justify-center items-center space-y-4 py-12">
              <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
              <p className="text-white text-lg">{processingStage || 'Processing...'}</p>
              <p className="text-zinc-400 text-sm">This may take a few seconds</p>
            </div>
          ) : (
            <textarea
              id="voice-journal-textarea"
              name="voice-journal-textarea"
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              onFocus={stopRecording}
              placeholder={isRecording ? 'Listening...' : 'Tap the microphone to start recording, or type your meal here...'}
              disabled={isRecording || isProcessing}
              className="justify-center items-center bg-zinc-900/50 disabled:opacity-60 backdrop-blur-sm p-8 border border-zinc-800 focus:border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary w-full min-h-[300px] text-white placeholder:text-zinc-500 text-lg text-center leading-relaxed resize-none disabled:cursor-not-allowed"
            />
          )}
        </div>
      </div>

      {/* Bottom Action Bar - 3 Buttons */}
      <div className="safe-area-inset-bottom bg-zinc-900/80 backdrop-blur-sm border-zinc-800 border-t">
        <div className="flex justify-evenly items-center gap-4 mx-auto px-6 py-4 max-w-2xl">
          {/* Cancel Button (X) */}
          <button
            onClick={handleCancel}
            disabled={isProcessing}
            className="flex justify-center items-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-full w-14 h-14 active:scale-95 transition-all disabled:cursor-not-allowed"
            aria-label="Cancel"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Record Button (Microphone) */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={hasPermission !== true || isProcessing}
            className={`flex items-center justify-center w-20 h-20 rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                : 'bg-brand-primary hover:bg-brand-primary-dark'
            }`}
            aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            {isRecording ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>

          {/* Submit Button (CheckMark) */}
          <button
            onClick={handleSubmit}
            disabled={!transcription.trim() || isProcessing || isRecording}
            className="flex justify-center items-center bg-zinc-800 hover:bg-zinc-700 disabled:hover:bg-zinc-800 disabled:opacity-50 rounded-full w-14 h-14 active:scale-95 transition-all disabled:cursor-not-allowed"
            aria-label="Submit"
          >
            {isProcessing ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Check className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

