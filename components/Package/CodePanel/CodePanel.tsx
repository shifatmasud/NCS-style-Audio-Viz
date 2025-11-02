import React from 'react';
import { useTheme } from '../../../styles/theme';

const CodePanel: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div>
      <h2 style={theme.Typography.titleM}>Code I/O</h2>
      <p style={{...theme.Typography.bodyS, color: theme.Color.Base.Content[2]}}>
        Import/export JSON, GLB, SVG, React code for backendless reuse.
      </p>
    </div>
  );
};

export default CodePanel;
