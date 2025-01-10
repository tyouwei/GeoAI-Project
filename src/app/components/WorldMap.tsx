import React, { useState } from "react";
import DeckGL from "@deck.gl/react";
import StaticMap from "react-map-gl";
import { ScatterplotLayer, PolygonLayer } from "@deck.gl/layers";
import { PickingInfo } from "@deck.gl/core";
import { Marker, WorldMapProps, Polygon } from "../types/types";

const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const INITIAL_VIEW_STATE = {
  longitude: 103.8198,
  latitude: 1.3521,
  zoom: 11,
  pitch: 0,
  bearing: 0,
};

export default function WorldMap({ 
  markers, 
  selectedMarkers, 
  highlightedMarkers,
  polygons,
  onMapClick, 
  onMarkerClick,
  onPolygonCreate,
}: WorldMapProps): JSX.Element {

  const [lastSelectedMarker, setLastSelectedMarker] = useState<Marker | null>(null);
  const [isPolygonVisible, setIsPolygonVisible] = useState(true);
  
  // Handle click events on the map
  const onClick = (event: PickingInfo) => {
    console.log(event);
    if (event.object) {
      return;
    }
    onMapClick(event.coordinate as [number, number] || null);
  };

  // Handle marker selection
  const handleMarkerClick = (info: PickingInfo) => {
    if (!info.object) return;
    onMarkerClick(info.object as Marker);
    setLastSelectedMarker(info.object);
  };

  // Create layers for markers and polygons
  const layers = [
    new ScatterplotLayer({
        id: 'markers',
        data: markers,
        getPosition: (d: Marker) => d.position,
        getFillColor: (d: Marker) => {
          const isHighlighted = highlightedMarkers.some((m: Marker) => 
            m.position[0] === d.position[0] && 
            m.position[1] === d.position[1] &&
            m.timestamp === d.timestamp
          );
          
          if (isHighlighted) {
            return [0, 255, 0, 255];  // Green for highlighted
          }
          
          const isSelected = selectedMarkers.some((m: Marker) =>
            m.position[0] === d.position[0] &&
            m.position[1] === d.position[1] &&
            m.timestamp === d.timestamp
          );
          
          return isSelected
            ? [0, 0, 255, 255]  // Blue for selected
            : [255, 0, 0, 255]; // Red for unselected
        },
        getRadius: 15,
        radiusScale: 1,
        radiusMinPixels: 5,
        radiusMaxPixels: 20,
        pickable: true,
        onClick: handleMarkerClick,
        updateTriggers: {
          getFillColor: [selectedMarkers, highlightedMarkers]
        }
      }),
    ...(isPolygonVisible ? [
      new PolygonLayer({
        id: 'polygon-layer',
        data: polygons,
        pickable: true,
        stroked: true,
        filled: true,
        wireframe: true,
        lineWidthMinPixels: 1,
        getPolygon: (d: Polygon) => d.polygon,
        getFillColor: [160, 160, 180, 200],
        getLineColor: [80, 80, 80, 255],
        updateTriggers: {
          getPolygon: [polygons], 
          getFillColor: [polygons]
        }
      })
    ] : [])
  ];

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-gray-200 flex items-center justify-center relative">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        onClick={onClick}
        style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden' }}
      >
        <StaticMap
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v11"
        />
      </DeckGL>
      
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button 
          onClick={() => onPolygonCreate(selectedMarkers)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Polygon
        </button>
        <button 
          onClick={() => setIsPolygonVisible(!isPolygonVisible)}
          className={`font-bold py-2 px-4 rounded ${
            isPolygonVisible 
              ? 'bg-blue-500 hover:bg-blue-700 text-white' 
              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
          }`}
        >
          {isPolygonVisible ? 'Hide Polygons' : 'Show Polygons'}
        </button>
      </div>

      {lastSelectedMarker && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded shadow">
          <h3 className="font-bold">Selected Marker</h3>
          <p>Position: [{lastSelectedMarker.position[0].toFixed(4)}, {lastSelectedMarker.position[1].toFixed(4)}]</p>
          <p>Time: {new Date(lastSelectedMarker.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}