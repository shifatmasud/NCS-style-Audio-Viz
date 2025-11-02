import React from 'react';
import { useTheme } from '../../../styles/theme';

interface ConsolePanelProps {
  logs: string[];
}

const ConsolePanel: React.FC<ConsolePanelProps> = ({ logs }) => {
  const { theme } = useTheme();

  const styles: { [key: string]: React.CSSProperties } = {
    consoleWrapper: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      ...theme.Typography.titleM,
      flexShrink: 0,
    },
    logContainer: {
      flexGrow: 1,
      overflowY: 'auto',
      backgroundColor: theme.Color.Base.Surface[1],
      borderRadius: theme.Radii.r2,
      padding: theme.Spacing.s2,
      fontFamily: 'monospace',
      border: `1px solid ${theme.Color.Border[1]}`,
      marginTop: theme.Spacing.s4,
    },
    logEntry: {
      ...theme.Typography.bodyS,
      color: theme.Color.Base.Content[2],
      whiteSpace: 'pre-wrap',
      marginBottom: theme.Spacing.s1,
    }
  };

  return (
    <div style={styles.consoleWrapper}>
      <h2 style={styles.title}>Console</h2>
      <div style={styles.logContainer}>
        {logs.map((log, index) => (
          <p key={index} style={styles.logEntry}>
            {log}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ConsolePanel;