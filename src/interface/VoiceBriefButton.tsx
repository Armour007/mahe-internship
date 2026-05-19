import { Mic, Square, Volume2 } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useCoreStore } from '../integration/store/coreStore';

const VoiceBriefButton: React.FC = () => {
  const { setUserBrief } = useCoreStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef<any>(null);
  const [hasSupport, setHasSupport] = useState(false);

  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasSupport(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setErrorMessage('');
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
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

        setTranscript(interimTranscript || finalTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        setIsProcessing(false);

        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access is blocked. Use chat brief or allow mic permissions.');
        } else {
          setErrorMessage('Voice input failed. Please try again or use chat brief.');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        // leave transcript for user confirmation (do not auto-save)
      };

      recognitionRef.current = recognition;
    }
  }, [transcript, setUserBrief]);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setErrorMessage('');
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const saveBrief = () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    setUserBrief(transcript.trim());
    setTimeout(() => {
      setIsProcessing(false);
      setTranscript('');
    }, 300);
  };

  const discardBrief = () => {
    setTranscript('');
  };

  if (!hasSupport) {
    return (
      <div className="rounded-lg border border-amber-100 bg-amber-50/80 p-3 text-xs text-amber-700">
        Voice input is unavailable in this browser. Use the chat brief below instead.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 w-full">
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all active:scale-95 font-medium text-sm"
          >
            <Square size={14} strokeWidth={3} />
            Stop Recording
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg transition-all active:scale-95 font-medium text-sm shadow-lg shadow-blue-500/30"
          >
            <Volume2 size={16} strokeWidth={2.5} className="" />
            Voice Brief
          </button>
        )}

        <button
          onClick={() => {
            if (transcript.trim()) saveBrief();
          }}
          disabled={!transcript.trim() || isProcessing}
          className="px-3 py-3 bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-50 rounded-lg text-zinc-700 text-sm font-medium"
        >
          Save Brief
        </button>

        <button
          onClick={discardBrief}
          disabled={!transcript.trim()}
          className="px-3 py-3 bg-transparent border border-zinc-100 hover:bg-zinc-50 disabled:opacity-50 rounded-lg text-zinc-600 text-sm font-medium"
        >
          Discard
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-rose-100 bg-rose-50/80 p-3 text-xs text-rose-700">
          {errorMessage}
        </div>
      )}

      {transcript && (
        <div className="text-xs text-zinc-500 italic p-2 bg-zinc-50 rounded-lg border border-zinc-100">
          <span className="text-zinc-400 block mb-1">Transcript (edit if needed):</span>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full resize-none bg-transparent outline-none text-xs leading-snug"
            rows={3}
          />
        </div>
      )}
    </div>
  );
};

export default VoiceBriefButton;
