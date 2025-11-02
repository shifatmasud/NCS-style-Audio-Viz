import React, { useRef } from 'react';
import { useTheme } from '../../../styles/theme';
import Button from '../../Core/Button/Button';
import { ArrowUp, ArrowDown } from '../../Core/Icon/PhosphorIcons';

interface CodePanelProps {
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  addLog: (message: string) => void;
}

const CodePanel: React.FC<CodePanelProps> = ({ onImport, onExport, addLog }) => {
  const { theme } = useTheme();
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const styles: React.CSSProperties = {
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.Spacing.s3,
      marginTop: theme.Spacing.s4,
    }
  };

  return (
    <div>
      <h2 style={theme.Typography.titleM}>Code I/O</h2>
      <p style={{...theme.Typography.bodyS, color: theme.Color.Base.Content[2]}}>
        Import or export the visualizer settings as a JSON file.
      </p>
      <div style={styles.buttonContainer}>
        <input 
          type="file" 
          accept=".json"
          onChange={onImport}
          style={{ display: 'none' }}
          ref={importInputRef}
        />
        <Button onClick={handleImportClick} style={{width: '100%'}}>
           <ArrowUp size={20} weight="bold" />
           Import JSON
        </Button>
        <Button onClick={onExport} style={{width: '100%'}}>
           <ArrowDown size={20} weight="bold" />
           Export JSON
        </Button>
      </div>
    </div>
  );
};

export default CodePanel;