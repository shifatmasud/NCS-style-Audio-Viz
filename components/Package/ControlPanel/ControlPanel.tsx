import React, { useRef, useEffect } from 'react';
import GUI from 'lil-gui';
import { useTheme } from '../../../styles/theme';
import Button from '../../Core/Button/Button';
import { ArrowUp, Play, Pause, Sun, Moon } from '../../Core/Icon/PhosphorIcons';
import { VisualizerParams } from '../../../three/Visualizer';

interface ControlPanelProps {
  audioFile: File | null;
  isPlaying: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPlayPause: () => void;
  visualizerParams: VisualizerParams;
  onParamsChange: (params: VisualizerParams) => void;
  addLog: (message: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  audioFile,
  isPlaying,
  onFileChange,
  onPlayPause,
  visualizerParams,
  onParamsChange,
  addLog
}) => {
  const { theme, themeMode, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const guiRef = useRef<HTMLDivElement>(null);
  const guiInstanceRef = useRef<GUI | null>(null);

  useEffect(() => {
    if (!guiRef.current || guiInstanceRef.current) return;
    
    const gui = new GUI({container: guiRef.current});
    guiInstanceRef.current = gui;

    const visualsFolder = gui.addFolder('Visuals');
    
    visualsFolder.add(visualizerParams, 'bloom', 0, 2, 0.01)
      .name('Bloom')
      .onChange((value: number) => {
        onParamsChange({ ...visualizerParams, bloom: value });
        addLog(`Bloom set to ${value.toFixed(2)}`);
      });

    visualsFolder.add(visualizerParams, 'pointSize', 0.1, 5, 0.1)
      .name('Particle Size')
      .onChange((value: number) => {
        onParamsChange({ ...visualizerParams, pointSize: value });
        addLog(`Particle size set to ${value.toFixed(1)}`);
      });
      
    visualsFolder.addColor(visualizerParams, 'baseColor')
      .name('Base Color')
      .onChange((value: string) => {
        onParamsChange({ ...visualizerParams, baseColor: value });
        addLog(`Base color set to ${value}`);
      });
      
    visualsFolder.addColor(visualizerParams, 'hotColor')
      .name('Hot Color')
      .onChange((value: string) => {
        onParamsChange({ ...visualizerParams, hotColor: value });
        addLog(`Hot color set to ${value}`);
      });

    const waveFolder = gui.addFolder('Wave');
    waveFolder.add(visualizerParams, 'waveFrequency', 1, 20, 0.5)
      .name('Frequency')
      .onChange((value: number) => {
        onParamsChange({ ...visualizerParams, waveFrequency: value });
        addLog(`Wave frequency set to ${value.toFixed(1)}`);
      });

    waveFolder.add(visualizerParams, 'waveSpeed', 0, 5, 0.1)
      .name('Speed')
      .onChange((value: number) => {
        onParamsChange({ ...visualizerParams, waveSpeed: value });
        addLog(`Wave speed set to ${value.toFixed(1)}`);
      });
      
    waveFolder.add(visualizerParams, 'waveSize', 0.0, 1.0, 0.01)
      .name('Size')
      .onChange((value: number) => {
        onParamsChange({ ...visualizerParams, waveSize: value });
        addLog(`Wave size set to ${value.toFixed(2)}`);
      });
      
    waveFolder.add(visualizerParams, 'noiseSize', 0.1, 10, 0.1)
      .name('Noise Size')
      .onChange((value: number) => {
        onParamsChange({ ...visualizerParams, noiseSize: value });
        addLog(`Noise size set to ${value.toFixed(1)}`);
      });

    const interactionFolder = gui.addFolder('Interaction');
    interactionFolder.add(visualizerParams, 'displacementScale', 0, 5, 0.1)
      .name('Displacement Scale')
      .onChange((value: number) => {
        onParamsChange({ ...visualizerParams, displacementScale: value });
        addLog(`Displacement scale set to ${value.toFixed(1)}`);
      });

    const shrinkFolder = gui.addFolder('Shrink');
    shrinkFolder.add(visualizerParams, 'shrinkScale', 0, 2, 0.01)
      .name('Shrink')
      .onChange((value: number) => {
        onParamsChange({ ...visualizerParams, shrinkScale: value });
        addLog(`Shrink scale set to ${value.toFixed(2)}`);
      });

    return () => {
      gui.destroy();
      guiInstanceRef.current = null;
    }
  }, []); // Run only once

  // Update GUI when params change from external source (like import)
  useEffect(() => {
    if (guiInstanceRef.current) {
      guiInstanceRef.current.controllers.forEach(c => c.updateDisplay());
    }
  }, [visualizerParams])

  const styles: { [key: string]: React.CSSProperties } = {
    panelWrapper: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: theme.Spacing.s6,
    },
    section: {
        borderBottom: `1px solid ${theme.Color.Border[1]}`,
        paddingBottom: theme.Spacing.s4,
    },
    title: {
      ...theme.Typography.titleM,
      marginBottom: theme.Spacing.s4,
    },
    fileName: {
        ...theme.Typography.bodyS,
        color: theme.Color.Base.Content[2],
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100%',
        textAlign: 'center',
        marginTop: theme.Spacing.s2,
        height: '16px',
    },
    controlsContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    playPauseButton: {
        width: theme.Spacing.s12,
        height: theme.Spacing.s12,
        borderRadius: theme.Radii.full,
        padding: 0,
        boxShadow: theme.Shadows.shadow3,
    },
    themeSwitcher: {
        backgroundColor: theme.Color.Base.Surface[3],
        color: theme.Color.Base.Content[1],
        border: `1px solid ${theme.Color.Border[1]}`,
        borderRadius: theme.Radii.full,
        width: '44px',
        height: '44px',
        padding: 0,
    }
  }

  const handleThemeToggle = () => {
    toggleTheme();
    addLog(`Theme changed to ${themeMode === 'dark' ? 'light' : 'dark'} mode.`);
  }

  return (
    <div style={styles.panelWrapper}>
      <div style={styles.section}>
        <h2 style={styles.title}>Controls</h2>
        <div style={styles.controlsContainer}>
          <input
            type="file"
            accept="audio/*"
            onChange={onFileChange}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          <Button onClick={() => fileInputRef.current?.click()} style={{width: '100%'}}>
            <ArrowUp size={20} weight="bold" />
            {audioFile ? 'Change Audio' : 'Upload Audio'}
          </Button>
           <p style={styles.fileName} title={audioFile?.name}>{audioFile?.name || 'No file selected'}</p>
          {audioFile && (
             <Button 
                onClick={onPlayPause}
                style={styles.playPauseButton}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" style={{transform: 'translateX(2px)'}} />}
              </Button>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <div ref={guiRef} id="gui-container"></div>
      </div>
      
      <div style={{...styles.section, borderBottom: 'none'}}>
        <h2 style={styles.title}>Settings</h2>
        <Button onClick={handleThemeToggle} style={styles.themeSwitcher} aria-label="Toggle theme">
            {themeMode === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </Button>
      </div>

    </div>
  );
};

export default ControlPanel;