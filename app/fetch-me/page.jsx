"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Car, Users, Search, Info, Loader2 } from 'lucide-react';

// Dynamically import the custom Map component with SSR disabled
const ButuanMap = dynamic(() => import('../components/ButuanMap'), { 
  ssr: false,
  loading: () => <div style={{ height: '100%', width: '100%', backgroundColor: 'var(--color-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span className="text-body-sm">Loading Butuan Maps...</span>
  </div>
});

const DEFAULT_CENTER = [8.9475, 125.5406];

export default function FetchMePage() {
  const [selectedVehicle, setSelectedVehicle] = useState('tricycle');
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [destination, setDestination] = useState(null);

  const handleSearch = async (e) => {
    if (e.key !== 'Enter' || !searchQuery) return;
    
    setIsSearching(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
      // Search restricted to Butuan area
      const response = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${searchQuery}&boundary.circle.lat=8.9475&boundary.circle.lon=125.5406&boundary.circle.radius=50`);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].geometry.coordinates;
        const newPos = [lat, lon];
        setMapCenter(newPos);
        setDestination({
          name: data.features[0].properties.label,
          pos: newPos
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const vehicles = [
    { id: 'tricycle', name: 'Tricycle', capacity: 3, price: '₱50', icon: Car, desc: 'Fastest for short trips' },
    { id: 'jeepney', name: 'Jeepney (Charter)', capacity: 15, price: '₱350', icon: Users, desc: 'Great for groups' },
    { id: 'van', name: 'Van', capacity: 10, price: '₱500', icon: Car, desc: 'Premium comfort' }
  ];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="text-headline-md">Fetch Me</h2>
        <div className="chip active">
          ORS Geocoding Live
        </div>
      </div>
      
      <div className="shadow-level-1" style={{ position: 'relative', height: '300px', borderRadius: 'var(--rounded-lg)', overflow: 'hidden', marginBottom: '24px' }}>
        <ButuanMap center={mapCenter} destination={destination} DEFAULT_CENTER={DEFAULT_CENTER} />
        
        {/* Floating Search Bar */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', zIndex: 1000 }}>
          <div className="card glass shadow-level-2" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.3)' }}>
            {isSearching ? <Loader2 size={18} className="animate-spin" color="var(--color-primary)" /> : <Search size={18} color="var(--color-primary)" />}
            <input 
              type="text" 
              placeholder="Search destination (Press Enter)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', fontWeight: '500' }} 
            />
          </div>
        </div>
      </div>

      <div className="card shadow-level-1" style={{ marginBottom: '24px', border: '1px solid var(--color-surface-container-highest)' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--color-primary)' }}></div>
            <div style={{ width: '2px', height: '40px', backgroundColor: 'var(--color-surface-container-high)', margin: '4px 0' }}></div>
            <MapPin size={16} color="var(--color-error)" />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid var(--color-surface-container-highest)', paddingBottom: '16px' }}>
              <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '4px' }}>Pickup Location</div>
              <div className="text-body-md" style={{ fontWeight: '600' }}>SM City Butuan</div>
            </div>
            <div>
              <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '4px' }}>Drop-off Location</div>
              <div className="text-body-md" style={{ fontWeight: '500' }}>{destination ? destination.name : 'Search above...'}</div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-headline-sm" style={{ marginBottom: '16px' }}>Select Vehicle</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {vehicles.map(v => (
          <div 
            key={v.id}
            className={`card ${selectedVehicle === v.id ? 'shadow-level-1' : ''}`}
            style={{ 
              display: 'flex', alignItems: 'center', cursor: 'pointer',
              border: selectedVehicle === v.id ? '2px solid var(--color-primary)' : '1px solid var(--color-surface-container-highest)',
              backgroundColor: selectedVehicle === v.id ? 'var(--color-surface-container-low)' : 'var(--color-surface-container-lowest)',
              padding: '16px'
            }}
            onClick={() => setSelectedVehicle(v.id)}
          >
            <div style={{ 
              width: '56px', height: '56px', borderRadius: 'var(--rounded-md)', 
              backgroundColor: selectedVehicle === v.id ? 'var(--color-primary-container)' : 'var(--color-surface-container)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: selectedVehicle === v.id ? 'var(--color-on-primary-container)' : 'var(--color-primary)'
            }}>
              <v.icon size={28} />
            </div>
            <div style={{ flex: 1, marginLeft: '16px' }}>
              <div className="text-label-lg" style={{ fontSize: '16px' }}>{v.name}</div>
              <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{v.desc}</div>
            </div>
            <div className="text-headline-sm" style={{ color: 'var(--color-primary)' }}>{v.price}</div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" style={{ width: '100%', height: '56px' }} disabled={!destination}>
        {destination ? `Request ${vehicles.find(v => v.id === selectedVehicle)?.name}` : 'Select a destination first'}
      </button>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
