// Tier 2 - Design System & Theme Systems

// 4pt Baseline Grid System
const BASE_GRID = 4;
export const spacing = {
  s1: `${BASE_GRID}px`,      // 4px
  s2: `${BASE_GRID * 2}px`,  // 8px
  s3: `${BASE_GRID * 3}px`,  // 12px
  s4: `${BASE_GRID * 4}px`,  // 16px
  s5: `${BASE_GRID * 5}px`,  // 20px
  s6: `${BASE_GRID * 6}px`,  // 24px
  s8: `${BASE_GRID * 8}px`,  // 32px
  s12: `${BASE_GRID * 12}px`, // 48px
  s16: `${BASE_GRID * 16}px`, // 64px
};

// Achromatic Grayscale + Feedback Color System
export const colors = {
  // Core
  black: '#000000',
  white: '#FFFFFF',
  // Grayscale
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
  gray950: '#121212',
  // Feedback
  blue: '#007BFF',
  green: '#28A745',
  orange: '#FD7E14',
  red: '#DC3545',
};

// Google Material Design Type Scale
const createTypeScale = (
  fontSize: number,
  lineHeight: number,
  fontWeight: number,
  letterSpacing: number,
  tag: string
) => ({
  fontSize: `${fontSize}px`,
  lineHeight: `${lineHeight}px`,
  fontWeight,
  letterSpacing: `${letterSpacing}em`,
  tag,
});

export const typography = {
  // Paragraph/Body L/Root font size = 16px
  // Using Inter font
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  
  displayL: createTypeScale(56, 64, 900, -0.02, 'h1'),
  displayM: createTypeScale(44, 52, 900, -0.02, 'h1'),
  displayS: createTypeScale(36, 44, 900, -0.02, 'h1'),

  headlineL: createTypeScale(32, 40, 700, 0, 'h2'),
  headlineM: createTypeScale(28, 36, 700, 0, 'h3'),
  // FIX: Added missing letterSpacing argument (0) to match other headlines.
  headlineS: createTypeScale(24, 32, 700, 0, 'h4'),

  titleL: createTypeScale(22, 28, 500, 0.01, 'h5'),
  titleM: createTypeScale(16, 24, 500, 0.01, 'h6'),
  titleS: createTypeScale(14, 20, 500, 0.01, 'p'),

  labelL: createTypeScale(14, 20, 700, 0.02, 'span'),
  labelM: createTypeScale(12, 16, 700, 0.02, 'span'),
  labelS: createTypeScale(11, 16, 700, 0.02, 'span'),

  bodyL: createTypeScale(16, 24, 400, 0, 'p'),
  bodyM: createTypeScale(14, 20, 400, 0, 'p'),
  bodyS: createTypeScale(12, 16, 400, 0, 'p'),
};

// 100ms Fluid Motion System
export const motion = {
  durationS: '100ms', // Base
  durationM: '200ms', // Base * 2
  durationL: '300ms', // Base * 3 (Root/Standard)
  durationXL: '400ms',// Base * 4
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

// Rounded Shape System
export const radii = {
  r1: '4px',
  r2: '8px',
  r3: '12px',
  r4: '16px',
  r5: '24px',
  full: '9999px',
};

// Soft Subtle Effect System
export const shadows = {
  shadow1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  shadow2: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  shadow3: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  shadowBlueGlow1: `0 0 12px ${colors.blue}33`,
  shadowBlueGlow2: `0 0 24px ${colors.blue}4D, 0 0 48px ${colors.blue}33`,
};

export const zIndex = {
  base: 1,
  panel: 100,
  header: 200,
  overlay: 300,
};
