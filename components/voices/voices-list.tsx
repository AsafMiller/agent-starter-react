'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Pause, Play, Star, Volume2 } from 'lucide-react';

interface Voice {
  id: number;
  name: string;
  model: string;
  description: string | null;
  isDefault: boolean;
  createdAt: string;
}

function VoiceCard({
  voice,
  onSetDefault,
  isSettingDefault,
  currentlyPlayingId,
  onPlayPreview,
}: {
  voice: Voice;
  onSetDefault: (id: number) => Promise<void>;
  isSettingDefault: boolean;
  currentlyPlayingId: number | null;
  onPlayPreview: (voice: Voice) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const isPlaying = currentlyPlayingId === voice.id;

  const handleSetDefault = async () => {
    if (voice.isDefault) return;
    setIsLoading(true);
    try {
      await onSetDefault(voice.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`border-border bg-card relative rounded-lg border p-6 transition-all ${
        voice.isDefault ? 'ring-primary ring-2' : 'hover:border-primary/50'
      }`}
    >
      {voice.isDefault && (
        <div className="bg-primary text-primary-foreground absolute -top-3 left-4 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium">
          <Star className="h-3 w-3 fill-current" />
          Default
        </div>
      )}

      <div className="mb-4 flex items-start justify-between">
        <div className="bg-primary/10 text-primary rounded-full p-3">
          <Volume2 className="h-6 w-6" />
        </div>
        <button
          onClick={() => onPlayPreview(voice)}
          className={`rounded-full p-3 transition-colors border-2 ${
            isPlaying
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background hover:bg-primary/10 text-primary border-primary'
          }`}
          title={isPlaying ? 'Stop preview' : 'Play preview'}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
      </div>

      <h3 className="text-foreground mb-1 text-lg font-semibold capitalize">{voice.name}</h3>

      <p className="text-muted-foreground mb-3 text-sm">{voice.description || 'No description available'}</p>

      <div className="text-muted-foreground mb-4 font-mono text-xs">
        Model: <span className="text-foreground">{voice.model}</span>
      </div>

      {!voice.isDefault && (
        <button
          onClick={handleSetDefault}
          disabled={isLoading || isSettingDefault}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            'Setting...'
          ) : (
            <>
              <Check className="h-4 w-4" />
              Set as Default
            </>
          )}
        </button>
      )}

      {voice.isDefault && (
        <div className="text-primary flex w-full items-center justify-center gap-2 rounded-lg border border-current px-4 py-2 text-sm font-medium">
          <Check className="h-4 w-4" />
          Currently Active
        </div>
      )}
    </div>
  );
}

export function VoicesList() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  const fetchVoices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/voice');
      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }
      const data = await response.json();
      setVoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoices();
  }, []);

  // Cleanup audio and cached blob URLs on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      audioCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      audioCacheRef.current.clear();
    };
  }, []);

  const handleSetDefault = async (id: number) => {
    setIsSettingDefault(true);
    try {
      const response = await fetch(`http://localhost:5000/api/voice/${id}/set-default`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to set default voice');
      }

      // Update the local state to reflect the change
      setVoices((prev) =>
        prev.map((v) => ({
          ...v,
          isDefault: v.id === id,
        }))
      );
    } catch (err) {
      console.error('Error setting default voice:', err);
    } finally {
      setIsSettingDefault(false);
    }
  };

  const handlePlayPreview = async (voice: Voice) => {
    // If already playing this voice, stop it
    if (currentlyPlayingId === voice.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setCurrentlyPlayingId(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setCurrentlyPlayingId(voice.id);

    try {
      let url = audioCacheRef.current.get(voice.model);

      if (!url) {
        setIsLoadingAudio(true);
        const response = await fetch(`http://localhost:8080/preview?model=${encodeURIComponent(voice.model)}`);
        if (!response.ok) {
          throw new Error('Failed to load preview');
        }
        const blob = await response.blob();
        url = URL.createObjectURL(blob);
        audioCacheRef.current.set(voice.model, url);
        setIsLoadingAudio(false);
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setCurrentlyPlayingId(null);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setCurrentlyPlayingId(null);
        audioRef.current = null;
        console.error('Error playing audio');
      };

      await audio.play();
    } catch (err) {
      console.error('Error playing preview:', err);
      setCurrentlyPlayingId(null);
      setIsLoadingAudio(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading voices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  if (voices.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">No voices found.</div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-muted-foreground mb-6">
        Select a voice to use as the default for your assistant. Click the play button to hear a preview.
      </p>

      {isLoadingAudio && (
        <div className="bg-muted/50 mb-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading audio preview...
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {voices.map((voice) => (
          <VoiceCard
            key={voice.id}
            voice={voice}
            onSetDefault={handleSetDefault}
            isSettingDefault={isSettingDefault}
            currentlyPlayingId={currentlyPlayingId}
            onPlayPreview={handlePlayPreview}
          />
        ))}
      </div>
    </div>
  );
}
