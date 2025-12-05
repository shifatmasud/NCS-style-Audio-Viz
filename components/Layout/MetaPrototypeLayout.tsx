import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useTheme, Theme } from '../../styles/theme';
import { Code, SlidersHorizontal, TerminalWindow } from '../Core/Icon/PhosphorIcons';

// --- Types ---

interface MetaPrototypeLayoutProps {
  children: React.ReactNode;
  codePanel: React.ReactNode;
  controlPanel: React.ReactNode;
  consolePanel: React.ReactNode;
}

type WindowId = 'code' | 'control' | 'console';

interface WindowState {
  id: WindowId;
  title: string;
  isOpen: boolean;
  zIndex: number;
}

// --- Styles ---

const getStyles = (theme: Theme) => ({
  container: {
    width: '100vw',
    height: '100vh',
    position: 'relative' as const,
    overflow: 'hidden',
    backgroundColor: theme.Color.Base.Surface[1],
  },
  contentLayer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: theme.ZIndex.base,
  },
  // Dock Styles
  dockContainer: {
    position: 'absolute' as const,
    bottom: theme.Spacing.s8,
    left: '50%',
    zIndex: theme.ZIndex.dock,
    display: 'flex',
    gap: theme.Spacing.s4,
    padding: `${theme.Spacing.s3} ${theme.Spacing.s4}`,
    backgroundColor: 'rgba(20, 20, 20, 0.4)', // Glassmorphic base
    backdropFilter: 'blur(20px)',
    borderRadius: theme.Radii.r5, // Peel shape
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    boxShadow: theme.Shadows.shadow3,
    cursor: 'grab',
    // Removed transform: 'translateX(-50%)' to allow Framer Motion to handle x position via drag
  },
  dockIcon: {
    width: '48px',
    height: '48px',
    borderRadius: theme.Radii.r3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: theme.Color.Base.Content[1],
    border: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
    position: 'relative' as const,
  },
  activeDot: {
    position: 'absolute' as const,
    bottom: '-6px',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: theme.Color.Base.Content[1],
  },
  // Window Styles
  windowFrame: {
    position: 'absolute' as const,
    backgroundColor: 'rgba(20, 20, 20, 0.65)', // Dark glass
    backdropFilter: 'blur(25px)',
    borderRadius: theme.Radii.r4,
    border: `1px solid rgba(255, 255, 255, 0.08)`,
    boxShadow: theme.Shadows.shadow3,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    minWidth: '320px',
    maxWidth: '90vw',
    maxHeight: '80vh',
  },
  windowHeader: {
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between', // Title left, close right
    padding: `0 ${theme.Spacing.s4}`,
    borderBottom: `1px solid rgba(255, 255, 255, 0.05)`,
    cursor: 'grab',
    userSelect: 'none' as const,
    touchAction: 'none' as const, // Important for drag on touch devices
  },
  windowTitle: {
    ...theme.Typography.labelM,
    color: theme.Color.Base.Content[2],
    letterSpacing: '0.05em',
  },
  closeButton: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: theme.Color.Error.Surface[1], 
    boxShadow: `0 0 8px ${theme.Color.Error.Surface[1]}80`,
    border: 'none',
    cursor: 'pointer',
  },
  windowContent: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: theme.Spacing.s4,
    color: theme.Color.Base.Content[1],
    // Custom scrollbar
    scrollbarWidth: 'thin' as const,
    scrollbarColor: `${theme.Color.Base.Content[3]} transparent`,
  },
});

// --- Components ---

const DockIcon = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: React.ElementType, 
  label: string, 
  isActive: boolean, 
  onClick: () => void 
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <motion.div
      style={styles.dockIcon}
      whileHover={{ scale: 1.15, y: -5, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={label}
    >
      <Icon size={24} weight={isActive ? "fill" : "regular"} />
      {isActive && <div style={styles.activeDot} />}
    </motion.div>
  );
};

interface WindowFrameProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  zIndex: number;
  onFocus: () => void;
  initialPosition: { x: number; y: number };
}

const WindowFrame: React.FC<WindowFrameProps> = ({ 
  id,
  title, 
  children, 
  isOpen, 
  onClose, 
  zIndex, 
  onFocus,
  initialPosition
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const dragControls = useDragControls();

  // Determine window size based on type for better UX
  const getSize = () => {
    switch(id) {
        case 'console': return { width: 500, height: 300 };
        case 'code': return { width: 400, height: 500 };
        default: return { width: 360, height: 550 };
    }
  };

  const size = getSize();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key={id}
          drag
          dragListener={false} // Only drag from header via controls
          dragControls={dragControls}
          dragMomentum={false}
          onPointerDown={onFocus}
          // Set X and Y in initial, remove from animate to prevent snapping back
          initial={{ 
            opacity: 0, 
            scale: 0.95, 
            x: initialPosition.x - (size.width / 2), 
            y: initialPosition.y - (size.height / 2),
            filter: 'blur(10px)'
          }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            filter: 'blur(0px)',
            // zIndex removed from animate so it doesn't trigger a transform re-calc that resets drag
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.95, 
            filter: 'blur(10px)',
            transition: { duration: 0.2 } 
          }}
          style={{
            ...styles.windowFrame,
            width: size.width,
            height: size.height,
            zIndex: zIndex // zIndex applied here
          }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
            mass: 0.8
          }}
        >
          {/* Header */}
          <div 
            style={styles.windowHeader} 
            onPointerDown={(e) => {
              dragControls.start(e); // Start drag first
              onFocus(); // Then focus
            }}
          >
            <span style={styles.windowTitle}>{title}</span>
            <motion.button 
              style={styles.closeButton} 
              onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when clicking close
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close"
            />
          </div>

          {/* Content */}
          <div 
            style={styles.windowContent}
            // Removed e.stopPropagation() so clicking content triggers onPointerDown={onFocus} on parent
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Main Layout ---

const MetaPrototypeLayout: React.FC<MetaPrototypeLayoutProps> = ({ 
  children, 
  codePanel, 
  controlPanel, 
  consolePanel 
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  // State
  const [windows, setWindows] = useState<Record<WindowId, WindowState>>({
    code: { id: 'code', title: 'CODE I/O', isOpen: false, zIndex: 100 },
    control: { id: 'control', title: 'CONTROLS', isOpen: true, zIndex: 101 },
    console: { id: 'console', title: 'CONSOLE', isOpen: false, zIndex: 100 },
  });

  const [topZ, setTopZ] = useState(102);

  const focusWindow = (id: WindowId) => {
    setWindows(prev => {
        if (prev[id].zIndex === topZ - 1) return prev; // Already on top
        return {
            ...prev,
            [id]: { ...prev[id], zIndex: topZ }
        };
    });
    setTopZ(prev => prev + 1);
  };

  const toggleWindow = (id: WindowId) => {
    setWindows(prev => {
      const isOpen = !prev[id].isOpen;
      let newZ = prev[id].zIndex;
      
      if (isOpen) {
        newZ = topZ;
        setTopZ(z => z + 1);
      }

      return {
        ...prev,
        [id]: { ...prev[id], isOpen, zIndex: newZ }
      };
    });
  };

  const closeWindow = (id: WindowId) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false }
    }));
  };

  // Center position for windows (approximation of 50vw, 50vh)
  const centerPos = { x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 };

  return (
    <div style={styles.container}>
      {/* 3D Content Layer */}
      <div style={styles.contentLayer}>
        {children}
      </div>

      {/* Floating Windows */}
      <WindowFrame 
        id="code"
        title={windows.code.title}
        isOpen={windows.code.isOpen}
        onClose={() => closeWindow('code')}
        zIndex={windows.code.zIndex}
        onFocus={() => focusWindow('code')}
        initialPosition={centerPos}
      >
        {codePanel}
      </WindowFrame>

      <WindowFrame 
        id="control"
        title={windows.control.title}
        isOpen={windows.control.isOpen}
        onClose={() => closeWindow('control')}
        zIndex={windows.control.zIndex}
        onFocus={() => focusWindow('control')}
        initialPosition={centerPos}
      >
        {controlPanel}
      </WindowFrame>

      <WindowFrame 
        id="console"
        title={windows.console.title}
        isOpen={windows.console.isOpen}
        onClose={() => closeWindow('console')}
        zIndex={windows.console.zIndex}
        onFocus={() => focusWindow('console')}
        initialPosition={{ x: centerPos.x, y: centerPos.y + 150 }} // Offset console slightly
      >
        {consolePanel}
      </WindowFrame>

      {/* Dock */}
      <motion.div 
        style={styles.dockContainer}
        drag
        dragMomentum={false}
        dragConstraints={{ left: -centerPos.x + 100, right: centerPos.x - 100, top: -centerPos.y * 2 + 100, bottom: 0 }}
        initial={{ y: 100, opacity: 0, x: '-50%' }}
        animate={{ y: 0, opacity: 1 }} // x removed from animate to rely on drag transform
        transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
      >
        <DockIcon 
          icon={Code} 
          label="Code I/O" 
          isActive={windows.code.isOpen} 
          onClick={() => toggleWindow('code')} 
        />
        <DockIcon 
          icon={SlidersHorizontal} 
          label="Controls" 
          isActive={windows.control.isOpen} 
          onClick={() => toggleWindow('control')} 
        />
        <DockIcon 
          icon={TerminalWindow} 
          label="Console" 
          isActive={windows.console.isOpen} 
          onClick={() => toggleWindow('console')} 
        />
      </motion.div>
    </div>
  );
};

export default MetaPrototypeLayout;