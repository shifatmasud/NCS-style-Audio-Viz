import React from 'react';
import { useTheme } from '../../../styles/theme';

const ConsolePanel: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div>
      <h2 style={theme.Typography.titleM}>Console</h2>
      <p style={{...theme.Typography.bodyS, color: theme.Color.Base.Content[2]}}>
        Logs events, FSM transitions, observer signals.
      </p>
    </div>
  );
};

export default ConsolePanel;
