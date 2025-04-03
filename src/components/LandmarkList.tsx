import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { Landmark } from '../types';

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

interface LandmarkListProps {
  landmarks: Landmark[];
  onAddLandmark: (landmark: Landmark) => void;
  onDeleteLandmark: (id: string) => void;
  onStartNavigation: () => void;
}

const LandmarkList: React.FC<LandmarkListProps> = ({
  landmarks,
  onAddLandmark,
  onDeleteLandmark,
  onStartNavigation,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [streetViewAvailable, setStreetViewAvailable] = useState(false);
  const [streetViewError, setStreetViewError] = useState<string | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setName('');
    setAddress('');
    setSelectedPosition(null);
    setStreetViewAvailable(false);
    setStreetViewError(null);
  };

  const handleSubmit = () => {
    if (name && address && selectedPosition) {
      onAddLandmark({
        id: Date.now().toString(),
        name,
        address,
        position: selectedPosition,
        isArrived: false,
      });
      handleClose();
    }
  };

  const checkStreetViewAvailability = (position: { lat: number; lng: number }) => {
    const streetViewService = new google.maps.StreetViewService();
    streetViewService.getPanorama(
      { location: position, radius: 50 },
      (data, status) => {
        if (status === 'OK' && data) {
          setStreetViewAvailable(true);
          setStreetViewError(null);
          const panorama = new google.maps.StreetViewPanorama(
            document.getElementById('street-view') as HTMLElement,
            {
              position: position,
              pov: {
                heading: 34,
                pitch: 10,
              },
              addressControl: false,
              showRoadLabels: false,
              zoomControl: false,
            }
          );
        } else {
          setStreetViewAvailable(false);
          setStreetViewError('Street View is not available at this location. Please select a different location.');
        }
      }
    );
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const position = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setSelectedPosition(position);
      checkStreetViewAvailability(position);
      
      // Reverse geocode to get the address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: position }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          setAddress(results[0].formatted_address);
        }
      });
    }
  };

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setAddress(value);
    setShowPredictions(true);

    if (value.length > 2) {
      const service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input: value,
          types: ['address'],
        },
        (predictions, status) => {
          if (status === 'OK' && predictions) {
            setPredictions(predictions);
          }
        }
      );
    } else {
      setPredictions([]);
    }
  };

  const handlePredictionClick = (prediction: google.maps.places.AutocompletePrediction) => {
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    service.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['geometry', 'formatted_address'],
      },
      (place, status) => {
        if (status === 'OK' && place?.geometry?.location) {
          setAddress(place.formatted_address || '');
          const position = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setSelectedPosition(position);
          checkStreetViewAvailability(position);
          setShowPredictions(false);
          setPredictions([]);
        }
      }
    );
  };

  const handleDelete = (id: string) => {
    onDeleteLandmark(id);
  };

  if (loadError) {
    return <Typography color="error">Error loading Google Maps</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Landmarks</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add Landmark
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <List>
          {landmarks.map((landmark) => (
            <ListItem key={landmark.id}>
              <ListItemText
                primary={landmark.name}
                secondary={landmark.address}
              />
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => handleDelete(landmark.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      {isLoaded && landmarks.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            All Landmarks
          </Typography>
          <Box sx={{ height: 400, width: '100%' }}>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={landmarks[0].position}
              zoom={12}
            >
              {landmarks.map((landmark, index) => (
                <Marker
                  key={landmark.id}
                  position={landmark.position}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new google.maps.Size(32, 32),
                  }}
                />
              ))}
            </GoogleMap>
          </Box>
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onStartNavigation}
          disabled={landmarks.length === 0}
        >
          Start Navigation
        </Button>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Add New Landmark</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Address"
                value={address}
                onChange={handleAddressChange}
                fullWidth
                inputRef={addressInputRef}
              />
              {showPredictions && predictions.length > 0 && (
                <Paper
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {predictions.map((prediction) => (
                    <Box
                      key={prediction.place_id}
                      sx={{
                        p: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                      onClick={() => handlePredictionClick(prediction)}
                    >
                      {prediction.description}
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
            {streetViewError && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {streetViewError}
              </Alert>
            )}
            {isLoaded && (
              <Box sx={{ width: '100%', display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <Box sx={{ width: '100%', order: 1, height: { xs: '40vh', md: 300 } }}>
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={selectedPosition || { lat: 43.6532, lng: -79.3832 }}
                    zoom={12}
                    onClick={handleMapClick}
                  >
                    {selectedPosition && (
                      <Marker position={selectedPosition} />
                    )}
                  </GoogleMap>
                </Box>
                <Box sx={{ width: '100%', order: 2, height: { xs: '40vh', md: 300 } }}>
                  {streetViewAvailable ? (
                    <div
                      id="street-view"
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: 'grey.100',
                        p: 2,
                      }}
                    >
                      <Typography variant="h6" color="error" gutterBottom>
                        Street View Not Available
                      </Typography>
                      <Typography variant="body1" color="error" align="center" sx={{ mb: 2 }}>
                        This location does not have Street View coverage.
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Please select a different location to add this landmark.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!name || !address || !selectedPosition || !streetViewAvailable}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LandmarkList; 