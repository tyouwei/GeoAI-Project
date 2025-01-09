import React from "react";
import DeckGL from "@deck.gl/react";
import StaticMap from "react-map-gl";

// Set your Mapbox access token here
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// Initial view state of the map
// TODO - GET CURRENT LATLNG
const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
  pitch: 0,
  bearing: 0,
};

export default function WorldMap() {
  return (
    <div className="w-full h-[calc(100vh-64px)] bg-gray-200 flex items-center justify-center">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden' }}
      >
        {/* Add a StaticMap as the base map */}
        <StaticMap
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v11"
        />
        {/* Add layers here for interactivity */}
      </DeckGL>
    </div>
  );
}
