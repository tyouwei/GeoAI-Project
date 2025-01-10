'use client'

import { useState, useCallback } from 'react'
import WorldMap from './components/WorldMap'
import CommandLine from './components/CommandLine'
import { Marker, MarkerArray, Polygon, PolygonArray, GeoJSON } from "./types/types";

export default function Home() {
  const [markers, setMarkers] = useState<MarkerArray>([]);
  const [selectedMarkers, setSelectedMarkers] = useState<MarkerArray>([]);
  const [highlightedMarkers, setHighlightedMarkers] = useState<MarkerArray>([]);
  const [polygons, setPolygons] = useState<PolygonArray>([]);

  const handleCommand = async (input: string) => {
    if (selectedMarkers.length === 0) {
      return;
    }
  
    // Convert markers to WKT POINT format
    const unselectedMarkers = markers.filter(marker => 
      !selectedMarkers.some(selected => 
        selected.position[0] === marker.position[0] && 
        selected.position[1] === marker.position[1]
      )
    );
    
    // Convert filtered markers to WKT POINT format
    const markerPoints = unselectedMarkers.map(marker => 
      `POINT(${marker.position[0]} ${marker.position[1]})`
    );
  
    // Convert selected points to WKT POINT format
    const selectedPoints = selectedMarkers.map(marker => 
      `POINT(${marker.position[0]} ${marker.position[1]})`
    );
  
    // Convert polygons to WKT POLYGON format
    const polygonWKTs = polygons.map(polygon => {
      // Add first point at the end to close the polygon
      const points = [...polygon.polygon, polygon.polygon[0]]
        .map(pos => `${pos[0]} ${pos[1]}`)
        .join(', ');
      return `POLYGON((${points}))`;
    });
  
    // Construct the context string
    const context = [
      selectedPoints.length > 0 ? `User's Point: ${selectedPoints.join(', ')}` : '',
      markerPoints.length > 0 ? `The Points that are to be calculated with the user's Point: ${markerPoints.join(', ')}` : '',
      polygonWKTs.length > 0 ? `Polygons that are to be calculated with the user's Point: ${polygonWKTs.join(', ')}` : ''
    ].filter(Boolean).join('. ');
  
    // Combine user input with context
    const fullInput = `User Input:${input}. \n\nContext: ${context}`;
  
    try {
      const response = await fetch('http://localhost:5000/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: fullInput })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Received data:", data); // Log the received data
  
      const newHighlightedMarkers: MarkerArray = [];
  
      if (data.type === 'Feature') {
        handleFeature(data as GeoJSON, newHighlightedMarkers);
      } else if (data.type === 'FeatureCollection') {
        data.features.forEach((feature:GeoJSON) => handleFeature(feature as GeoJSON, newHighlightedMarkers));
      }
  
      setHighlightedMarkers(newHighlightedMarkers);
      console.log("useState polygon: ", polygons) //length of highlightedMarker is always 0
    } catch (error) {
      console.error('Error sending command:', error);
    }
  };
  
  const handleFeature = (feature: GeoJSON, newHighlightedMarkers: MarkerArray): void => {
    if (!feature.geometry) {
      return;
    }
    
    switch (feature.geometry.type) {
      case 'Point': {
        // Find the existing marker with matching coordinates
        const existingMarker = markers.find(marker => 
          marker.position[0] === feature.geometry.coordinates[0] && 
          marker.position[1] === feature.geometry.coordinates[1]
        );
        
        if (existingMarker) {
          newHighlightedMarkers.push(existingMarker);
        }
        break;
      }
      case 'Polygon': {
        const outerRing = feature.geometry.coordinates[0];
        if (outerRing?.length < 3) return;
        
        const newPolygon: Polygon = {
          polygon: outerRing,
          timestamp: Date.now()
        };
        // console.log(outerRing)
        setPolygons(prev => [...prev, newPolygon]);
        break;
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
  }, []);

  const handleMarkerClick = useCallback((marker: Marker) => {
    setSelectedMarkers(prevSelectedMarkers => {
      // Check if the marker is already in the array
      const markerIndex = prevSelectedMarkers.findIndex(m => 
        m.position[0] === marker.position[0] && 
        m.position[1] === marker.position[1] && 
        m.timestamp === marker.timestamp
      );
      
      if (markerIndex === -1) {
        // Marker not in array, add it
        return [...prevSelectedMarkers, marker];
      } else {
        // Marker already in array, remove it
        return prevSelectedMarkers.filter((_, index) => index !== markerIndex);
      }
    });
  }, []);

  const createPolygon = (polygonPoints: MarkerArray) => {
    if (polygonPoints.length < 3) {
      alert("Please select at least 3 markers to create a polygon");
      return;
    }

    const newPolygon: Polygon = {
      polygon: polygonPoints.map((point: Marker) => point.position),
      timestamp: Date.now()
    };
    // console.log(newPolygon)
    setPolygons([...polygons, newPolygon]);
    setSelectedMarkers([]);
  };

  return (
    <div className="flex flex-col h-screen">
      <CommandLine onSubmit={handleCommand} />
      <WorldMap 
        markers={markers}
        selectedMarkers={selectedMarkers}
        highlightedMarkers={highlightedMarkers}
        polygons={polygons}
        onMapClick={handleMapClick}
        onMarkerClick={handleMarkerClick}
        onPolygonCreate={createPolygon}
      />
    </div>
  )
}