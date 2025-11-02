import React from 'react';
import type { Theme } from './theme';

interface GlobalStylesProps {
  theme: Theme;
}

const GlobalStyles: React.FC<GlobalStylesProps> = ({ theme }) => {
  return (
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');

        body {
          background-color: ${theme.Color.Base.Surface[1]};
          color: ${theme.Color.Base.Content[1]};
          font-family: ${theme.Typography.fontFamily};
          transition: background-color ${theme.Motion.durationM} ${theme.Motion.ease}, color ${theme.Motion.durationM} ${theme.Motion.ease};
        }
      `}
    </style>
  );
};

export default GlobalStyles;
