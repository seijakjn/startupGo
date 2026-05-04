"use client";
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Component to handle map centering
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  return null;
}

const ButuanMap = ({ center, destination, DEFAULT_CENTER, riders = [] }) => {
  useEffect(() => {
    // Fix Leaflet icons
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  const riderIcon = typeof window !== 'undefined' ? new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }) : null;

  return (
    <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={DEFAULT_CENTER}>
        <Popup>Pickup: SM City Butuan</Popup>
      </Marker>
      {destination && (
        <Marker position={destination.pos}>
          <Popup>Drop-off: {destination.name}</Popup>
        </Marker>
      )}
      {riders && riders.map((rider, idx) => (
        <Marker key={idx} position={[rider.lat, rider.lon]} icon={riderIcon}>
          <Popup>Nearby Driver</Popup>
        </Marker>
      ))}
      <ChangeView center={center} zoom={15} />
    </MapContainer>
  );
};

export default ButuanMap;
