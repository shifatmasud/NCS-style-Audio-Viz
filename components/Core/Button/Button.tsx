import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../styles/theme';

interface StateLayer {
  id: number;
  x: number;
  y: number;
  type: 'hover' | 'press';
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, style, ...props }) => {
  const { theme } = useTheme();
  const [ripples, setRipples] = useState<StateLayer[]>([]);
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.Spacing.s2,
    ...theme.Typography.labelL,
    padding: `${theme.Spacing.s3} ${theme.Spacing.s6}`,
    backgroundColor: theme.Color.Primary.Surface[1],
    color: theme.Color.Primary.Content[1],
    borderRadius: theme.Radii.r3,
    transition: `background-color ${theme.Motion.durationM}`,
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    ...style,
  };

  const addRipple = (event: React.MouseEvent<HTMLButtonElement>, type: 'hover' | 'press') => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const newRipple: StateLayer = { id: Date.now(), x, y, type };
    setRipples(current => [...current, newRipple]);
  };

  const handlePointerEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(true);
    addRipple(e, 'hover');
  }

  const handlePointerLeave = () => {
    setIsHovered(false);
    setRipples(current => current.filter(r => r.type !== 'hover'));
  }
  
  const handlePointerDown = (e: React.MouseEvent<HTMLButtonElement>) => {
     addRipple(e, 'press');
  }

  const handlePointerUp = () => {
    setRipples(current => current.filter(r => r.type !== 'press'));
  }

  return (
    <button
      ref={ref}
      style={buttonStyle}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      {...props}
    >
      <AnimatePresence>
        {ripples.map(ripple => {
          const size = ref.current ? Math.max(ref.current.offsetWidth, ref.current.offsetHeight) * 2.5 : 0;
          const opacity = ripple.type === 'hover' ? 0.08 : 0.12;
          return (
            <motion.span
              key={ripple.id}
              style={{
                position: 'absolute',
                left: ripple.x,
                top: ripple.y,
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: theme.Color.Primary.Content[1],
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: opacity }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          );
        })}
      </AnimatePresence>
      <span style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: theme.Spacing.s2 }}>
        {children}
      </span>
    </button>
  );
};

export default Button;
