export interface Marker {
    position: [number, number];  // More specific type for position
    timestamp: number;
  }
  
export type MarkerArray = Array<Marker>;

export interface WorldMapProps {
  markers: MarkerArray;
  selectedMarker: Marker | null;
  highlightedMarkers: MarkerArray;
  onMapClick: (coordinate: [number, number] | null) => void;
  onMarkerClick: (marker: Marker) => void;
}

export interface ServerResponsePoint {
  coordinates: [number, number];
  distance: number;
}