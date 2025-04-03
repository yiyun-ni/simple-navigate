import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { Landmark } from '../types';

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

interface NavigationViewProps {
  landmarks: Landmark[];
  currentIndex: number;
  isComplete: boolean;
  onMarkArrived: () => void;
  onNextLandmark: () => void;
  onPreviousLandmark: () => void;
  onShowOverview: () => void;
}

const NavigationView: React.FC<NavigationViewProps> = ({
  landmarks,
  currentIndex,
  isComplete,
  onMarkArrived,
  onNextLandmark,
  onPreviousLandmark,
  onShowOverview,
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const currentLandmark = landmarks[currentIndex];
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const isInitializedRef = useRef(false);

  // Function to clear existing markers
  const clearMarkers = () => {
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    }
  };

  // Function to add markers to the map
  const addMarkers = (map: google.maps.Map) => {
    if (!map || !landmarks.length) return;

    // Only clear markers if we're not in the initial setup
    if (isInitializedRef.current) {
      clearMarkers();
    }
    
    landmarks.forEach(landmark => {
      const marker = new google.maps.Marker({
        position: landmark.position,
        map: map,
        icon: {
          url: landmark.id === currentLandmark.id 
            ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
            : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new google.maps.Size(32, 32),
        }
      });
      
      markersRef.current.push(marker);
    });

    // Fit bounds with max zoom limit
    const bounds = new google.maps.LatLngBounds();
    landmarks.forEach(landmark => {
      bounds.extend(landmark.position);
    });
    
    map.fitBounds(bounds);
    
    // Add a listener to check and adjust zoom level after bounds are set
    google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
      const currentZoom = map.getZoom();
      if (currentZoom && currentZoom > 18) {
        map.setZoom(18);
      }
    });
  };

  // Effect to handle landmarks or currentIndex changes
  useEffect(() => {
    if (mapRef.current && isLoaded) {
      addMarkers(mapRef.current);
    }
  }, [landmarks, currentIndex, isLoaded]);

  useEffect(() => {
    if (isLoaded && currentLandmark) {
      const streetViewElement = document.getElementById('street-view');
      if (streetViewElement) {
        const panorama = new google.maps.StreetViewPanorama(
          streetViewElement,
          {
            position: currentLandmark.position,
            pov: {
              heading: 34,
              pitch: 10,
            },
            addressControl: false,
            showRoadLabels: false,
            zoomControl: false,
          }
        );
      }
    }
  }, [isLoaded, currentLandmark]);

  if (!currentLandmark) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Navigation Complete!
        </Typography>
        <Button variant="contained" color="primary" onClick={onShowOverview}>
          Back to Overview
        </Button>
      </Box>
    );
  }

  if (loadError) {
    return <Typography color="error">Error loading Google Maps</Typography>;
  }

  if (!isLoaded) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Navigation</Typography>
        <Button variant="outlined" onClick={onShowOverview}>
          Show Overview
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={currentIndex} alternativeLabel sx={{ mb: 3 }}>
          {landmarks.map((landmark, index) => (
            <Step key={landmark.id}>
              <StepLabel>
                {landmark.name}
                {landmark.isArrived && ' ✓'}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Typography variant="h5" gutterBottom>
          Current Landmark: {currentLandmark.name}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Address: {currentLandmark.address}
        </Typography>

        <Box sx={{ width: '100%', mb: 3, display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ width: '100%', order: 1, height: { xs: '50vh', md: 400 } }}>
            <div
              id="street-view"
              style={{ width: '100%', height: '100%' }}
            />
          </Box>
          <Box sx={{ width: '100%', order: 2, height: { xs: '50vh', md: 400 } }}>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={currentLandmark.position}
              zoom={15}
              onLoad={(map) => {
                mapRef.current = map;
                isInitializedRef.current = true;
                addMarkers(map);
              }}
              onUnmount={() => {
                isInitializedRef.current = false;
                clearMarkers();
                mapRef.current = null;
              }}
            >
              {/* We're not using React markers anymore */}
            </GoogleMap>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={onPreviousLandmark}
            disabled={currentIndex === 0}
          >
            Previous Landmark
          </Button>
          <Button
            variant="contained"
            color={currentLandmark.isArrived ? "secondary" : "primary"}
            onClick={onMarkArrived}
          >
            {currentLandmark.isArrived ? "Mark as Not Arrived" : "Mark as Arrived"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={onNextLandmark}
            disabled={currentIndex === landmarks.length - 1 && !isComplete}
          >
            Next Landmark
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NavigationView; 