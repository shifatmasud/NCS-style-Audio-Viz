import React from 'react';
import { useTheme } from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import HomePage from './components/Page/HomePage/HomePage';

const App: React.FC = () => {
  const { theme } = useTheme();

  return (
    <>
      <GlobalStyles theme={theme} />
      <HomePage />
    </>
  );
};

export default App;
