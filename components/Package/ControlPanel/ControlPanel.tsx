import React, { useRef, useEffect } from 'react';
import GUI from 'lil-gui';
import { useTheme, Theme } from '../../../styles/theme';
import Button from '../../Core/Button/Button';
import { ArrowUp, Play, Pause, Sun, Moon } from '../../Core/Icon/PhosphorIcons';

interface ControlPanelProps {
  audioFile: File | null;
  isPlaying: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPlayPause: () => void;
  visualizerParams: { bloom: number };
  onParamsChange: (params: { bloom: number }) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  audioFile,
  isPlaying,
  onFileChange,
  onPlayPause,
  visualizerParams,
  onParamsChange
}) => {
  const { theme, themeMode, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const guiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!guiRef.current) return;
    
    const gui = new GUI({container: guiRef.current});
    
    gui.add(visualizerParams, 'bloom', 0, 2, 0.01)
      .name('Bloom Intensity')
      .onChange((value: number) => {
        onParamsChange({ ...visualizerParams, bloom: value });
      });

    return () => {
      gui.destroy();
    }
  }, [guiRef.current]);

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
        <h2 style={styles.title}>Visuals</h2>
        <div ref={guiRef} id="gui-container"></div>
      </div>
      
      <div style={{...styles.section, borderBottom: 'none'}}>
        <h2 style={styles.title}>Settings</h2>
        <Button onClick={toggleTheme} style={styles.themeSwitcher} aria-label="Toggle theme">
            {themeMode === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </Button>
      </div>

    </div>
  );
};

export default ControlPanel;
