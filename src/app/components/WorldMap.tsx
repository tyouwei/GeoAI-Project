import React, { useEffect } from "react";
import DeckGL from "@deck.gl/react";
import StaticMap from "react-map-gl";
import { ScatterplotLayer } from "@deck.gl/layers";
import { PickingInfo } from "@deck.gl/core";
import { Marker, WorldMapProps} from "../types/types";

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
  selectedMarker, 
  highlightedMarkers,
  onMapClick, 
  onMarkerClick 
}: WorldMapProps): JSX.Element {
  
  // Handle click events on the map
  const onClick = (event: PickingInfo) => {
    // If we clicked a marker, don't create a new one
    if (event.object) {
      return;
    }
    onMapClick(event.coordinate as [number, number] || null);
  };

  // Handle marker selection
  const handleMarkerClick = (info: PickingInfo) => {
    if (!info.object) return;
    onMarkerClick(info.object as Marker);
  };

  // Create a scatter plot layer for the markers
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
        
        // Highlight selected marker in blue, others in red
        return d.timestamp === selectedMarker?.timestamp 
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
        getFillColor: [selectedMarker, highlightedMarkers]
      }
    })
  ];

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-gray-200 flex items-center justify-center">
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
      {selectedMarker && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded shadow">
          <h3 className="font-bold">Selected Marker</h3>
          <p>Position: [{selectedMarker.position[0].toFixed(4)}, {selectedMarker.position[1].toFixed(4)}]</p>
          <p>Time: {new Date(selectedMarker.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}