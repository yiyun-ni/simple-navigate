export interface Landmark {
  id: string;
  name: string;
  address: string;
  position: {
    lat: number;
    lng: number;
  };
  isArrived: boolean;
}

export interface NavigationState {
  landmarks: Landmark[];
  currentIndex: number;
  isOverview: boolean;
  isComplete: boolean;
} 