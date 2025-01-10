export interface Marker {
    position: [number, number];  // More specific type for position
    timestamp: number;
  }
  
export type MarkerArray = Array<Marker>;

export interface WorldMapProps {
  markers: MarkerArray;
  selectedMarkers: MarkerArray;
  highlightedMarkers: MarkerArray;
  polygons: PolygonArray;
  onMapClick: (coordinate: [number, number] | null) => void;
  onMarkerClick: (marker: Marker) => void;
  onPolygonCreate: (points: MarkerArray) => void;
}

export interface Polygon {
  polygon: number[][];
  timestamp: number;
}

export type PolygonArray = Array<Polygon>;



//GeoJSON format types
// Basic types
type Position = [number, number];

// GeoJSON geometry types
interface PointGeometry {
  type: 'Point';
  coordinates: Position;
}

interface PolygonGeometry {
  type: 'Polygon';
  coordinates: Position[][];
}

// Feature interface
export interface GeoJSON {
  type: 'Feature';
  geometry: PointGeometry | PolygonGeometry;
  properties?: Record<string, any>;
}