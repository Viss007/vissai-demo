export interface RealtimeClientEvents {
  onConnected: () => void;
  onDisconnected: () => void;
  onError: (error: string) => void;
  onTranscript: (text: string, isUser: boolean, isComplete: boolean) => void;
}

export class RealtimeClient {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private events: RealtimeClientEvents;

  constructor(events: RealtimeClientEvents) {
    this.events = events;
  }

  async connect(): Promise<void> {
    try {
      // Get user media first
      this.localStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });

      // Get ephemeral token
      const response = await fetch('/api/realtime/ephemeral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get ephemeral token: ${response.status}`);
      }

      const sessionData = await response.json();
      const ephemeralToken = sessionData.client_secret?.value;

      if (!ephemeralToken) {
        throw new Error('No ephemeral token received');
      }

      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      // Create data channel for events
      this.dataChannel = this.peerConnection.createDataChannel('oai-events');
      this.setupDataChannel();

      // Add local stream
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        this.setupAudioPlayback(remoteStream);
      };

      // Create offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Send offer to OpenAI
      const model = 'gpt-4o-realtime-preview';
      const realtimeResponse = await fetch(
        `https://api.openai.com/v1/realtime?model=${model}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ephemeralToken}`,
            'Content-Type': 'application/sdp',
            'OpenAI-Beta': 'realtime=v1',
          },
          body: offer.sdp,
        }
      );

      if (!realtimeResponse.ok) {
        throw new Error(`Realtime API error: ${realtimeResponse.status}`);
      }

      const answerSdp = await realtimeResponse.text();
      await this.peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

      this.events.onConnected();

    } catch (error) {
      console.error('Connection error:', error);
      this.events.onError(error instanceof Error ? error.message : String(error));
      this.disconnect();
    }
  }

  private setupDataChannel(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log('Data channel opened');
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleRealtimeEvent(data);
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    };
  }

  private handleRealtimeEvent(event: any): void {
    switch (event.type) {
      case 'conversation.item.input_audio_transcription.completed':
        this.events.onTranscript(event.transcript || '', true, true);
        break;
      case 'conversation.item.input_audio_transcription.failed':
        console.warn('Input transcription failed:', event.error);
        break;
      case 'response.audio_transcript.delta':
        this.events.onTranscript(event.delta || '', false, false);
        break;
      case 'response.audio_transcript.done':
        this.events.onTranscript(event.transcript || '', false, true);
        break;
      case 'error':
        this.events.onError(event.error?.message || 'Unknown error');
        break;
    }
  }

  private async setupAudioPlayback(stream: MediaStream): Promise<void> {
    // Create audio element if it doesn't exist
    if (!this.audioElement) {
      this.audioElement = document.createElement('audio');
      this.audioElement.autoplay = true;
      this.audioElement.setAttribute('playsinline', 'true');
      document.body.appendChild(this.audioElement);
    }

    this.audioElement.srcObject = stream;

    // Handle autoplay policy
    try {
      await this.audioElement.play();
    } catch (error) {
      console.warn('Autoplay blocked, user interaction required');
      // Will be handled by the UI component
    }
  }

  async enableAudio(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    if (this.audioElement) {
      try {
        await this.audioElement.play();
      } catch (error) {
        console.error('Failed to play audio:', error);
      }
    }
  }

  disconnect(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.audioElement) {
      this.audioElement.remove();
      this.audioElement = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.events.onDisconnected();
  }

  isConnected(): boolean {
    return this.peerConnection?.connectionState === 'connected';
  }
}