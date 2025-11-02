import React, { useState, useRef, useCallback, useEffect } from 'react';
import AudioVisualizer from '../../Section/AudioVisualizer/AudioVisualizer';
import MetaPrototypeLayout from '../../Layout/MetaPrototypeLayout';
import ControlPanel from '../../Package/ControlPanel/ControlPanel';
import CodePanel from '../../Package/CodePanel/CodePanel';
import ConsolePanel from '../../Package/ConsolePanel/ConsolePanel';

const HomePage: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [visualizerParams, setVisualizerParams] = useState({ bloom: 0.35 });

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const setupAudioContext = useCallback(() => {
    if (audioRef.current && !audioContextRef.current) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 512;

      const source = context.createMediaElementSource(audioRef.current);
      source.connect(analyserNode);
      analyserNode.connect(context.destination);
      
      audioContextRef.current = context;
      setAnalyser(analyserNode);
      setIsReady(true);
    }
  }, []);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (isPlaying) {
        handlePlayPause();
      }
      setIsReady(false);
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setupAudioContext();
    }
  }, [audioUrl, setupAudioContext]);
  
  const handlePlayPause = async () => {
    if (!audioContextRef.current || !audioRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <MetaPrototypeLayout
        codePanel={<CodePanel />}
        controlPanel={
          <ControlPanel
            audioFile={audioFile}
            isPlaying={isPlaying}
            onFileChange={handleFileChange}
            onPlayPause={handlePlayPause}
            visualizerParams={visualizerParams}
            onParamsChange={setVisualizerParams}
          />
        }
        consolePanel={<ConsolePanel />}
      >
        {isReady && analyser ? (
          <AudioVisualizer 
            analyser={analyser} 
            isPlaying={isPlaying}
            params={visualizerParams}
          />
        ) : (
          <InitialState onFileChange={handleFileChange} />
        )}
      </MetaPrototypeLayout>
      <audio ref={audioRef} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} loop/>
    </>
  );
};

// Simple component for the initial "upload" state
import { ArrowUp } from '../../Core/Icon/PhosphorIcons';
import Button from '../../Core/Button/Button';
import { useTheme } from '../../../styles/theme';

const InitialState: React.FC<{onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ onFileChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  const styles = {
     container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
     },
     uploadCard: {
        textAlign: 'center',
        padding: theme.Spacing.s12,
        border: `1px solid ${theme.Color.Border[1]}`,
        borderRadius: theme.Radii.r5,
        backgroundColor: `${theme.Color.Base.Surface[1]}80`, // with transparency
        backdropFilter: 'blur(10px)',
        boxShadow: theme.Shadows.shadowBlueGlow2,
        maxWidth: '500px',
      },
      title: {
        ...theme.Typography.displayM,
        marginBottom: theme.Spacing.s2,
        background: `linear-gradient(to bottom right, ${theme.Color.Base.Content[1]}, ${theme.Color.Base.Content[2]})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
      subtitle: {
        ...theme.Typography.bodyL,
        color: theme.Color.Base.Content[2],
        marginBottom: theme.Spacing.s8,
        maxWidth: '400px',
      },
  }

  return (
    <div style={styles.container}>
         <div style={styles.uploadCard}>
            <h1 style={styles.title}>
              Audio Visualizer
            </h1>
            <p style={styles.subtitle}>
              Upload an audio file to experience a dynamic, NCS-inspired visual spectacle powered by Three.js shaders.
            </p>
            <input
              type="file"
              accept="audio/*"
              onChange={onFileChange}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              <ArrowUp size={24} weight="bold" />
              Upload Audio
            </Button>
          </div>
    </div>
  )
}

export default HomePage;
