import React, { useState } from 'react';
import { Box, Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { NavigationState, Landmark } from './types';
import LandmarkList from './components/LandmarkList';
import NavigationView from './components/NavigationView';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  const [state, setState] = useState<NavigationState>({
    landmarks: [],
    currentIndex: 0,
    isOverview: true,
    isComplete: false,
  });

  const handleAddLandmark = (landmark: Landmark) => {
    setState(prev => ({
      ...prev,
      landmarks: [...prev.landmarks, { ...landmark, isArrived: false }],
    }));
  };

  const handleDeleteLandmark = (id: string) => {
    setState(prev => ({
      ...prev,
      landmarks: prev.landmarks.filter(landmark => landmark.id !== id),
    }));
  };

  const handleStartNavigation = () => {
    setState(prev => ({
      ...prev,
      isOverview: false,
      currentIndex: 0,
      isComplete: false,
    }));
  };

  const handleMarkArrived = () => {
    setState(prev => {
      const newLandmarks = [...prev.landmarks];
      newLandmarks[prev.currentIndex] = {
        ...newLandmarks[prev.currentIndex],
        isArrived: !newLandmarks[prev.currentIndex].isArrived,
      };

      const isComplete = newLandmarks.every(landmark => landmark.isArrived);

      return {
        ...prev,
        landmarks: newLandmarks,
        isComplete,
      };
    });
  };

  const handleNextLandmark = () => {
    setState(prev => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
    }));
  };

  const handlePreviousLandmark = () => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
    }));
  };

  const handleShowOverview = () => {
    setState(prev => ({
      ...prev,
      isOverview: true,
    }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {state.isOverview ? (
            <LandmarkList
              landmarks={state.landmarks}
              onAddLandmark={handleAddLandmark}
              onDeleteLandmark={handleDeleteLandmark}
              onStartNavigation={handleStartNavigation}
            />
          ) : (
            <NavigationView
              landmarks={state.landmarks}
              currentIndex={state.currentIndex}
              isComplete={state.isComplete}
              onMarkArrived={handleMarkArrived}
              onNextLandmark={handleNextLandmark}
              onPreviousLandmark={handlePreviousLandmark}
              onShowOverview={handleShowOverview}
            />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;
