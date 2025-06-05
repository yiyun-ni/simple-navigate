# Simple Navigate

A web-based navigation application designed to enhance allocentric spatial navigation skills. Unlike traditional turn-by-turn navigation systems that promote egocentric navigation (following step-by-step directions), Simple Navigate encourages users to develop a mental map of their surroundings by focusing on landmarks and their spatial relationships.

## Key Features

- **Landmark-Based Navigation**: Users can add and manage landmarks to create their navigation routes
- **Street View Integration**: Visual confirmation of landmarks through Google Street View
- **Interactive Map**: Visualization of landmarks and their spatial relationships
- **Progress Tracking**: Mark landmarks as visited to track navigation progress
- **Responsive Design**: Optimized for both desktop and mobile devices

## How It Works

Simple Navigate helps users develop allocentric navigation skills by:

1. **Landmark Identification**: Users add significant landmarks to their route
2. **Spatial Mapping**: The application displays landmarks on a map, helping users understand their relative positions
3. **Visual Confirmation**: Street View integration allows users to verify landmarks visually
4. **Navigation Practice**: Users navigate between landmarks, building their mental map of the area

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Maps API key with Street View enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/simple-navigate.git
   ```

2. Install dependencies:
   ```bash
   cd simple-navigate
   npm install
   ```

3. Create a `.env` file in the root directory and add your Google Maps API key:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. **Add Landmarks**:
   - Click "Add Landmark" to create a new landmark
   - Enter the landmark name and address
   - Verify the location using the map and Street View
   - Confirm the landmark has Street View coverage

2. **Start Navigation**:
   - Click "Start Navigation" to begin your route
   - Use the map and Street View to navigate between landmarks
   - Mark landmarks as visited when you reach them

3. **Track Progress**:
   - View your progress through the landmark list
   - See visited landmarks marked with a checkmark
   - Return to the overview at any time

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Google Maps API for map and Street View integration
- Material-UI for the user interface components


#### hello
