import React, { useState, useRef, useCallback, useEffect } from 'react';
import AudioVisualizer from '../../Section/AudioVisualizer/AudioVisualizer';
import MetaPrototypeLayout from '../../Layout/MetaPrototypeLayout';
import ControlPanel from '../../Package/ControlPanel/ControlPanel';
import CodePanel from '../../Package/CodePanel/CodePanel';
import ConsolePanel from '../../Package/ConsolePanel/ConsolePanel';
import { VisualizerParams } from '../../../three/Visualizer';

const HomePage: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const [visualizerParams, setVisualizerParams] = useState<VisualizerParams>({
    bloom: 0.35,
    pointSize: 3.8,
    particleDensity: 31,
    baseColor: "#5d47ff",
    hotColor: "#ffffff",
    waveFrequency: 6,
    waveSpeed: 2.4,
    waveSize: 0.25,
    noiseSize: 1,
    shrinkScale: 0.87,
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]);
  }, []);

  useEffect(() => {
    addLog("Application initialized.");
  }, [addLog]);

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
      addLog("Audio context ready.");
    }
  }, [addLog]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (isPlaying) {
        handlePlayPause();
      }
      setIsReady(false);
      
      // Clean up old audio context and URL
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      addLog(`Audio file selected: ${file.name}`);
    }
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setupAudioContext();
    }
    
    // Cleanup on component unmount
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  }, [audioUrl, setupAudioContext]);

  const handlePlayPause = useCallback(async () => {
    if (!audioContextRef.current || !audioRef.current || !audioFile) return;

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
      addLog("Audio context resumed.");
    }
    
    if (audioRef.current.paused) {
      audioRef.current.play();
      addLog("Audio playing.");
    } else {
      audioRef.current.pause();
      addLog("Audio paused.");
    }
  }, [addLog, audioFile]);
  
  const handleExportParams = () => {
    const dataStr = JSON.stringify(visualizerParams, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'visualizer-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    addLog("Visualizer settings exported.");
  };

  const handleImportParams = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text === 'string') {
                const importedParams = JSON.parse(text);
                // Basic validation
                if(importedParams.bloom !== undefined && importedParams.pointSize !== undefined) {
                    setVisualizerParams(importedParams);
                    addLog(`Settings imported from ${file.name}.`);
                } else {
                    addLog(`Error: Invalid JSON structure in ${file.name}.`);
                }
            }
        } catch (error) {
            addLog(`Error reading JSON file: ${error}`);
        }
    };
    reader.readAsText(file);
  };


  return (
    <>
      <MetaPrototypeLayout
        codePanel={
          <CodePanel 
            onImport={handleImportParams} 
            onExport={handleExportParams}
            addLog={addLog}
          />
        }
        controlPanel={
          <ControlPanel
            audioFile={audioFile}
            isPlaying={isPlaying}
            onFileChange={handleFileChange}
            onPlayPause={handlePlayPause}
            visualizerParams={visualizerParams}
            onParamsChange={setVisualizerParams}
            addLog={addLog}
          />
        }
        consolePanel={<ConsolePanel logs={logs} />}
      >
        {isReady && analyser ? (
          <AudioVisualizer 
            analyser={analyser} 
            isPlaying={isPlaying}
            params={visualizerParams}
            onSphereClick={handlePlayPause}
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