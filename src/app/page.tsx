'use client'

import { useState, useCallback } from 'react'
import WorldMap from './components/WorldMap'
import CommandLine from './components/CommandLine'
import { Marker, MarkerArray, ServerResponsePoint } from "./types/types";

export default function Home() {
  const [markers, setMarkers] = useState<MarkerArray>([]);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const [highlightedMarkers, setHighlightedMarkers] = useState<MarkerArray>([]);

  const handleCommand = async (input: string) => {
    if (selectedMarker == null) {
      return;
    }

    if (input.trim()) {
      try {
        // Convert to GeoJSON format
        const filteredMarkers = markers.filter(marker => marker != selectedMarker);
        const markersGeoJSON = filteredMarkers.map(marker => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [marker.position[0], marker.position[1]]
          },
          properties: {
            timestamp: marker.timestamp
          }
        }));
        
        const selectedMarkerGeoJSON = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [selectedMarker.position[0], selectedMarker.position[1]]
          },
          properties: {
            timestamp: selectedMarker.timestamp
          }
        };
  
        // Add context to the input
        input = `${input}\n\nContext: There are ${markers.length} points on the map: ${JSON.stringify(markersGeoJSON)}.\nThe point selected by the user is ${JSON.stringify(selectedMarkerGeoJSON)}.`;
  
        console.log("Sending request to server...");
        const response = await fetch('http://localhost:5000/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ input: input })
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("Received response from server:", data.response);
        
        // Process the response and highlight markers
        if (data.response) {
          // Convert point strings to markers
          const newHighlightedMarkers = data.response
            .map((item: ServerResponsePoint) => {
              const coordinates = item.coordinates;
              if (!coordinates) return null;
              
              // Find the original marker with these coordinates
              return markers.find(marker => 
                marker.position[0] === coordinates[0] && 
                marker.position[1] === coordinates[1]
              ) || null;
            })
            .filter((marker: Marker | null): marker is Marker => marker !== null);
            console.log(highlightedMarkers)

          setHighlightedMarkers(newHighlightedMarkers);
        } else {
          // Clear highlights if no points were returned
          setHighlightedMarkers([]);
        }
        
      } catch (error) {
        console.error('Error sending message:', error);
        setHighlightedMarkers([]); // Clear highlights on error
      }
    }
  };

  const handleMapClick = useCallback((coordinate: [number, number] | null) => {
    if (!coordinate) return;

    const newMarker: Marker = {
      position: coordinate,
      timestamp: Date.now()
    };

    setMarkers(prevMarkers => [...prevMarkers, newMarker]);
    setSelectedMarker(newMarker);
    setHighlightedMarkers([])
  }, []);

  const handleMarkerClick = useCallback((marker: Marker) => {
    setSelectedMarker(prev => 
      prev?.timestamp === marker.timestamp ? null : marker //deselect/reselect
    );
    setHighlightedMarkers([])
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <CommandLine onSubmit={handleCommand} />
      <WorldMap 
        markers={markers}
        selectedMarker={selectedMarker}
        highlightedMarkers={highlightedMarkers}
        onMapClick={handleMapClick}
        onMarkerClick={handleMarkerClick}
      />
    </div>
  )
}