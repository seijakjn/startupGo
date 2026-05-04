"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Car, Users, Search, Loader2, X } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

// Dynamically import the custom Map component with SSR disabled
const ButuanMap = dynamic(() => import('../components/ButuanMap'), { 
  ssr: false,
  loading: () => <div style={{ height: '100%', width: '100%', backgroundColor: 'var(--color-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span className="text-body-sm">Loading Butuan Maps...</span>
  </div>
});

const DEFAULT_CENTER = [8.9475, 125.5406];

// Debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function FetchMePage() {
  const [selectedVehicle, setSelectedVehicle] = useState('tricycle');
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [destination, setDestination] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const wrapperRef = useRef(null);

  const debouncedQuery = useDebounce(searchQuery, 400);

  // Fetch suggestions whenever the debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
        const response = await fetch(
          `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(debouncedQuery)}&boundary.circle.lat=8.9475&boundary.circle.lon=125.5406&boundary.circle.radius=50&size=8`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          setSuggestions(data.features);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (feature) => {
    const [lon, lat] = feature.geometry.coordinates;
    const newPos = [lat, lon];
    setMapCenter(newPos);
    setDestination({ name: feature.properties.label, pos: newPos });
    setSearchQuery(feature.properties.label);
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setDestination(null);
    setSuggestions([]);
    setShowDropdown(false);
    setMapCenter(DEFAULT_CENTER);
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
        <div className="chip active">ORS Geocoding Live</div>
      </div>
      
      <div className="shadow-level-1" style={{ position: 'relative', height: '300px', borderRadius: 'var(--rounded-lg)', overflow: 'visible', marginBottom: '24px', zIndex: 10 }}>
        {/* Map — needs its own clip */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 'var(--rounded-lg)', overflow: 'hidden', zIndex: 1 }}>
          <ButuanMap center={mapCenter} destination={destination} DEFAULT_CENTER={DEFAULT_CENTER} />
        </div>

        {/* Floating Search Bar + Dropdown */}
        <div ref={wrapperRef} style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', zIndex: 1000 }}>
          {/* Input */}
          <div
            className="card glass shadow-level-2"
            style={{
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: showDropdown ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.3)',
              borderRadius: showDropdown && suggestions.length > 0 ? 'var(--rounded-lg) var(--rounded-lg) 0 0' : 'var(--rounded-lg)',
              transition: 'border-color 0.2s, border-radius 0.15s'
            }}
          >
            {isSearching
              ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} color="var(--color-primary)" />
              : <Search size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            }
            <input
              type="text"
              placeholder="Search destination in Butuan..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (destination && e.target.value !== destination.name) setDestination(null);
              }}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', fontWeight: '500', color: 'var(--color-on-surface)', minWidth: 0 }}
            />
            {searchQuery && (
              <button onClick={handleClear} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', flexShrink: 0, color: 'var(--color-on-surface-variant)' }}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Dropdown suggestions */}
          {showDropdown && suggestions.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-primary)',
                borderTop: 'none',
                borderRadius: '0 0 var(--rounded-lg) var(--rounded-lg)',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}
            >
              {suggestions.map((feature, idx) => {
                const label = feature.properties.label;
                const locality = feature.properties.locality || feature.properties.county || '';
                const region = feature.properties.region || '';
                const sublabel = [locality, region].filter(Boolean).join(', ');

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(feature)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 16px',
                      border: 'none',
                      borderBottom: idx < suggestions.length - 1 ? '1px solid var(--color-surface-container)' : 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <MapPin size={16} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-on-surface)', lineHeight: '1.3' }}>
                        {label}
                      </div>
                      {sublabel && (
                        <div style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
                          {sublabel}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* No results state */}
          {showDropdown && !isSearching && suggestions.length === 0 && debouncedQuery.length >= 2 && (
            <div style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-outline)',
              borderTop: 'none',
              borderRadius: '0 0 var(--rounded-lg) var(--rounded-lg)',
              padding: '14px 16px',
              fontSize: '13px',
              color: 'var(--color-on-surface-variant)',
            }}>
              No locations found in Butuan. Try a different search.
            </div>
          )}
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
              <div className="text-body-md" style={{ fontWeight: destination ? '600' : '400', color: destination ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)' }}>
                {destination ? destination.name : 'Search above to select a destination'}
              </div>
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

      <button
        className="btn btn-primary"
        style={{ width: '100%', height: '56px' }}
        disabled={!destination}
        onClick={() => destination && setPaymentOpen(true)}
      >
        {destination ? `Request ${vehicles.find(v => v.id === selectedVehicle)?.name}` : 'Select a destination first'}
      </button>

      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        amount={parseFloat(vehicles.find(v => v.id === selectedVehicle)?.price.replace('₱', '').replace(',', '') || 0)}
        serviceLabel={`Fetch Me — ${vehicles.find(v => v.id === selectedVehicle)?.name}`}
      />

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
