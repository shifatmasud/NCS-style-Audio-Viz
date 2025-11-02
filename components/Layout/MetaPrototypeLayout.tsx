import React, { useState, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, Theme } from '../../styles/theme';
import { Code, SlidersHorizontal, TerminalWindow, X } from '../Core/Icon/PhosphorIcons';

const getStyles = (theme: Theme): { [key: string]: CSSProperties } => ({
  layoutContainer: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: theme.Color.Base.Surface[1],
  },
  mainContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: theme.ZIndex.base,
  },
  panel: {
    position: 'absolute',
    width: 340,
    maxHeight: `calc(100% - ${theme.Spacing.s8})`,
    backgroundColor: `${theme.Color.Base.Surface[2]}cc`,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${theme.Color.Border[1]}`,
    borderRadius: theme.Radii.r4,
    boxShadow: theme.Shadows.shadow3,
    display: 'flex',
    flexDirection: 'column',
    zIndex: theme.ZIndex.panel,
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${theme.Spacing.s2} ${theme.Spacing.s4}`,
    borderBottom: `1px solid ${theme.Color.Border[1]}`,
    cursor: 'grab',
    flexShrink: 0,
  },
  panelTitle: {
    ...theme.Typography.labelL,
    color: theme.Color.Base.Content[1],
  },
  closeButton: {
    border: 'none',
    background: 'transparent',
    color: theme.Color.Base.Content[2],
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
  },
  panelContent: {
    padding: theme.Spacing.s4,
    overflowY: 'auto',
    flex: 1,
  },
  toggleButton: {
    position: 'absolute',
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
    zIndex: theme.ZIndex.panel - 1,
    boxShadow: theme.Shadows.shadow2,
  },
});

const panelMotionProps = {
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    dragTransition: { bounceStiffness: 600, bounceDamping: 20 },
    dragMomentum: false,
};

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
  
  return (
    <div style={styles.layoutContainer}>
        <main style={styles.mainContent}>
          {children}
        </main>

        {/* Panel Toggles */}
        <AnimatePresence>
            {!isCodeOpen && (
                <motion.button 
                  style={{...styles.toggleButton, top: theme.Spacing.s4, left: theme.Spacing.s4}} 
                  onClick={() => setIsCodeOpen(true)} 
                  aria-label="Open Code Panel"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                   <Code />
                </motion.button>
            )}
        </AnimatePresence>
        <AnimatePresence>
            {!isControlOpen && (
                <motion.button 
                  style={{...styles.toggleButton, top: theme.Spacing.s4, right: theme.Spacing.s4}} 
                  onClick={() => setIsControlOpen(true)} 
                  aria-label="Open Control Panel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                   <SlidersHorizontal />
                </motion.button>
            )}
        </AnimatePresence>
        <AnimatePresence>
            {!isConsoleOpen && (
                 <motion.button 
                   style={{...styles.toggleButton, bottom: theme.Spacing.s4, left: '50%', transform: 'translateX(-50%)'}} 
                   onClick={() => setIsConsoleOpen(true)} 
                   aria-label="Open Console Panel"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 20 }}
                 >
                   <TerminalWindow />
                </motion.button>
            )}
        </AnimatePresence>
        
        {/* Panels */}
        <AnimatePresence>
            {isCodeOpen && (
                <motion.div
                    style={{...styles.panel, top: theme.Spacing.s4, left: theme.Spacing.s4}}
                    drag dragHandle=".drag-handle"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    {...panelMotionProps}
                >
                    <div style={styles.panelHeader} className="drag-handle">
                        <span style={styles.panelTitle}>Code I/O</span>
                        <button style={styles.closeButton} onClick={() => setIsCodeOpen(false)} aria-label="Close Code Panel"><X /></button>
                    </div>
                    <div style={styles.panelContent}>{codePanel}</div>
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {isControlOpen && (
                <motion.div
                    style={{...styles.panel, top: theme.Spacing.s4, right: theme.Spacing.s4}}
                    drag dragHandle=".drag-handle"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    {...panelMotionProps}
                >
                     <div style={styles.panelHeader} className="drag-handle">
                        <span style={styles.panelTitle}>Controls</span>
                        <button style={styles.closeButton} onClick={() => setIsControlOpen(false)} aria-label="Close Control Panel"><X /></button>
                    </div>
                    <div style={styles.panelContent}>{controlPanel}</div>
                </motion.div>
            )}
        </AnimatePresence>
        
        <AnimatePresence>
            {isConsoleOpen && (
                 <motion.div
                    style={{...styles.panel, height: 250, width: `calc(100% - ${theme.Spacing.s8})`, bottom: theme.Spacing.s4, left: theme.Spacing.s4 }}
                    drag dragHandle=".drag-handle"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    {...panelMotionProps}
                 >
                    <div style={styles.panelHeader} className="drag-handle">
                        <span style={styles.panelTitle}>Console</span>
                        <button style={styles.closeButton} onClick={() => setIsConsoleOpen(false)} aria-label="Close Console Panel"><X /></button>
                    </div>
                    <div style={styles.panelContent}>{consolePanel}</div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default MetaPrototypeLayout;
