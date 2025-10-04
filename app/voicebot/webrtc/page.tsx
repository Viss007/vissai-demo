'use client';

import { useState, useRef, useCallback } from 'react';
import { RealtimeClient, RealtimeClientEvents } from '../../../lib/realtimeClient';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  isComplete: boolean;
  timestamp: Date;
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

export default function VoiceBotPage() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string>('');
  const [audioBlocked, setAudioBlocked] = useState(false);
  
  const clientRef = useRef<RealtimeClient | null>(null);
  const currentBotMessageRef = useRef<string>('');

  const addMessage = useCallback((text: string, isUser: boolean, isComplete: boolean) => {
    const messageId = isUser ? `user-${Date.now()}` : 'bot-current';
    
    setMessages(prev => {
      if (!isUser && !isComplete) {
        // Update existing bot message or create new one
        currentBotMessageRef.current += text;
        const filtered = prev.filter(m => m.id !== 'bot-current');
        return [...filtered, {
          id: messageId,
          text: currentBotMessageRef.current,
          isUser,
          isComplete,
          timestamp: new Date(),
        }];
      } else if (!isUser && isComplete) {
        // Finalize bot message
        const filtered = prev.filter(m => m.id !== 'bot-current');
        currentBotMessageRef.current = '';
        return [...filtered, {
          id: `bot-${Date.now()}`,
          text,
          isUser,
          isComplete,
          timestamp: new Date(),
        }];
      } else {
        // User message
        return [...prev, {
          id: messageId,
          text,
          isUser,
          isComplete,
          timestamp: new Date(),
        }];
      }
    });
  }, []);

  const handleStart = async () => {
    try {
      setError('');
      setConnectionState('connecting');
      setAudioBlocked(false);

      const events: RealtimeClientEvents = {
        onConnected: () => {
          setConnectionState('connected');
          addMessage('Connected! Start speaking...', false, true);
        },
        onDisconnected: () => {
          setConnectionState('disconnected');
          addMessage('Disconnected.', false, true);
        },
        onError: (errorMessage: string) => {
          setError(errorMessage);
          setConnectionState('disconnected');
        },
        onTranscript: (text: string, isUser: boolean, isComplete: boolean) => {
          if (text.trim()) {
            addMessage(text, isUser, isComplete);
          }
        },
      };

      clientRef.current = new RealtimeClient(events);
      await clientRef.current.connect();

    } catch (error) {
      console.error('Start error:', error);
      setError(error instanceof Error ? error.message : String(error));
      setConnectionState('disconnected');
    }
  };

  const handleStop = () => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }
    currentBotMessageRef.current = '';
  };

  const handleEnableAudio = async () => {
    if (clientRef.current) {
      try {
        await clientRef.current.enableAudio();
        setAudioBlocked(false);
      } catch (error) {
        console.error('Audio enable error:', error);
      }
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connecting': return 'Connecting...';
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
    }
  };

  return (
    <div className="container">
      <h1>Voice Bot Demo</h1>
      <p>Real-time voice conversation with OpenAI GPT-4o</p>

      <div className="controls">
        <button
          className={`btn ${connectionState === 'connected' ? 'btn-danger' : 'btn-primary'}`}
          onClick={connectionState === 'connected' ? handleStop : handleStart}
          disabled={connectionState === 'connecting'}
        >
          {connectionState === 'connected' ? 'Stop' : 'Start'}
        </button>
        
        <span className={`status ${connectionState}`}>
          {getStatusText()}
        </span>
      </div>

      {error && (
        <div className="error">
          Error: {error}
        </div>
      )}

      {audioBlocked && (
        <div className="audio-notice" onClick={handleEnableAudio}>
          Click to enable sound (autoplay was blocked)
        </div>
      )}

      <div className="chat-container">
        {messages.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic' }}>
            Click Start to begin voice conversation...
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`bubble ${message.isUser ? 'user' : 'bot'}`}
            >
              <div>{message.text}</div>
              {!message.isComplete && (
                <span style={{ opacity: 0.5 }}>...</span>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>
        <p><strong>Instructions:</strong></p>
        <ul>
          <li>Click "Start" and grant microphone permission</li>
          <li>Speak naturally - the AI will respond with voice</li>
          <li>Transcripts appear in real-time above</li>
          <li>Click "Stop" to end the conversation</li>
        </ul>
      </div>
    </div>
  );
}