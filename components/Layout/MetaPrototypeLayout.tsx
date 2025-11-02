import React, { useState, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, Theme } from '../../styles/theme';
import { Code, SlidersHorizontal, TerminalWindow, X } from '../Core/Icon/PhosphorIcons';

const getStyles = (theme: Theme): { [key: string]: CSSProperties } => ({
  layoutContainer: {
    width: '100vw',
    height: '100vh',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gridTemplateRows: '1fr auto',
    gridTemplateAreas: `
      "code main control"
      "console console console"
    `,
    backgroundColor: theme.Color.Base.Surface[1],
    color: theme.Color.Base.Content[1],
    transition: `background-color ${theme.Motion.durationM} ${theme.Motion.ease}, color ${theme.Motion.durationM} ${theme.Motion.ease}`,
  },
  mainContent: {
    gridArea: 'main',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  panel: {
    backgroundColor: theme.Color.Base.Surface[2],
    borderLeft: `1px solid ${theme.Color.Border[1]}`,
    borderRight: `1px solid ${theme.Color.Border[1]}`,
    borderTop: `1px solid ${theme.Color.Border[1]}`,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    zIndex: theme.ZIndex.panel,
  },
  panelContent: {
    padding: theme.Spacing.s4,
    overflowY: 'auto',
    height: '100%',
  },
  toggleButton: {
    position: 'absolute',
    top: theme.Spacing.s3,
    backgroundColor: theme.Color.Base.Surface[3],
    border: 'none',
    color: theme.Color.Base.Content[2],
    width: '32px',
    height: '32px',
    borderRadius: theme.Radii.r2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: theme.ZIndex.header,
  },
});

interface MetaPrototypeLayoutProps {
  children: React.ReactNode;
  codePanel: React.ReactNode;
  controlPanel: React.ReactNode;
  consolePanel: React.ReactNode;
}

const MetaPrototypeLayout: React.FC<MetaPrototypeLayoutProps> = ({ children, codePanel, controlPanel, consolePanel }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [isControlOpen, setIsControlOpen] = useState(true);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  
  const panelVariants = {
      open: { width: 320, opacity: 1, x: 0 },
      closed: { width: 0, opacity: 0, x: -20 },
  };

  const bottomPanelVariants = {
      open: { height: 200, opacity: 1, y: 0 },
      closed: { height: 0, opacity: 0, y: 20 },
  }

  return (
    <div style={styles.layoutContainer}>
        {/* Panel Toggles */}
        <button style={{...styles.toggleButton, left: theme.Spacing.s3}} onClick={() => setIsCodeOpen(!isCodeOpen)} aria-label="Toggle Code Panel">
           {isCodeOpen ? <X/> : <Code />}
        </button>
        <button style={{...styles.toggleButton, right: theme.Spacing.s3}} onClick={() => setIsControlOpen(!isControlOpen)} aria-label="Toggle Control Panel">
           {isControlOpen ? <X/> : <SlidersHorizontal />}
        </button>
         <button style={{...styles.toggleButton, right: `calc(50% - 16px)`, bottom: theme.Spacing.s3}} onClick={() => setIsConsoleOpen(!isConsoleOpen)} aria-label="Toggle Console Panel">
           {isConsoleOpen ? <X/> : <TerminalWindow />}
        </button>

        {/* Left Panel (Code) */}
        <motion.div
            style={{...styles.panel, gridArea: 'code', borderRight: `1px solid ${theme.Color.Border[1]}`}}
            initial="closed"
            animate={isCodeOpen ? 'open' : 'closed'}
            variants={panelVariants}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
            <div style={styles.panelContent}>{codePanel}</div>
        </motion.div>

        {/* Main Content */}
        <main style={styles.mainContent}>
          {children}
        </main>

        {/* Right Panel (Controls) */}
        <motion.div
            style={{...styles.panel, gridArea: 'control', borderLeft: `1px solid ${theme.Color.Border[1]}`}}
            initial="open"
            animate={isControlOpen ? 'open' : 'closed'}
            variants={panelVariants}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
             <div style={styles.panelContent}>{controlPanel}</div>
        </motion.div>
        
        {/* Bottom Panel (Console) */}
         <motion.div
            style={{...styles.panel, gridArea: 'console', borderTop: `1px solid ${theme.Color.Border[1]}`}}
            initial="closed"
            animate={isConsoleOpen ? 'open' : 'closed'}
            variants={bottomPanelVariants}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
            <div style={styles.panelContent}>{consolePanel}</div>
        </motion.div>
    </div>
  );
};

export default MetaPrototypeLayout;
