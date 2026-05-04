"use client";
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../../lib/supabase';
import { Search, Loader2, MapPin, X, Save } from 'lucide-react';

const ButuanMap = dynamic(() => import('../../components/ButuanMap'), { 
  ssr: false,
  loading: () => <div style={{ height: '100%', width: '100%', backgroundColor: 'var(--color-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span className="text-body-sm">Loading Butuan Maps...</span>
  </div>
});

const DEFAULT_CENTER = [8.9475, 125.5406];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function RiderLocationPage() {
  const { user } = useUser();
  const [currentPos, setCurrentPos] = useState(DEFAULT_CENTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const wrapperRef = useRef(null);

  const debouncedQuery = useDebounce(searchQuery, 400);

  // Fetch initial location
  useEffect(() => {
    if (!user) return;
    const fetchLocation = async () => {
      const { data } = await supabase
        .from('rider_locations')
        .select('lat, lon')
        .eq('rider_id', user.id)
        .single();
      if (data) {
        setCurrentPos([data.lat, data.lon]);
      }
    };
    fetchLocation();
  }, [user]);

  // ORS Search
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
          `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(debouncedQuery)}&boundary.circle.lat=8.9475&boundary.circle.lon=125.5406&boundary.circle.radius=100&size=5`
        );
        const data = await response.json();
        if (data.features) {
          setSuggestions(data.features);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

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
    setCurrentPos([lat, lon]);
    setSearchQuery(feature.properties.label);
    setSuggestions([]);
    setShowDropdown(false);
    setSaveSuccess(false);
  };

  const handleSaveLocation = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const { error } = await supabase
        .from('rider_locations')
        .upsert({
          rider_id: user.id,
          lat: currentPos[0],
          lon: currentPos[1],
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save location', err);
      alert('Failed to save location.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 className="text-headline-md" style={{ marginBottom: '24px' }}>My Location</h2>

      <div style={{ marginBottom: '24px' }} ref={wrapperRef}>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--rounded-md)', backgroundColor: 'var(--color-surface)' }}>
            {isSearching ? <Loader2 size={18} className="animate-spin" color="var(--color-primary)" /> : <Search size={18} color="var(--color-on-surface-variant)" />}
            <input 
              type="text" 
              placeholder="Search your current location..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSaveSuccess(false);
              }}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent' }} 
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSuggestions([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--color-on-surface-variant)' }}>
                <X size={16} />
              </button>
            )}
          </div>
          {/* Dropdown suggestions */}
          {showDropdown && suggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-primary)', borderRadius: 'var(--rounded-lg)', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 1000 }}>
              {suggestions.map((feature, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(feature)}
                  style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', border: 'none', borderBottom: idx < suggestions.length - 1 ? '1px solid var(--color-surface-container)' : 'none', backgroundColor: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <MapPin size={16} color="var(--color-primary)" style={{ marginTop: '2px' }} />
                  <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-on-surface)' }}>{feature.properties.label}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="shadow-level-1" style={{ position: 'relative', flex: 1, minHeight: '300px', borderRadius: 'var(--rounded-lg)', overflow: 'hidden', marginBottom: '24px', zIndex: 1 }}>
        <ButuanMap center={currentPos} destination={null} DEFAULT_CENTER={DEFAULT_CENTER} />
        {/* Fake marker in the center for the rider's position */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)', zIndex: 1000, pointerEvents: 'none' }}>
          <MapPin size={40} color="var(--color-primary)" fill="white" />
        </div>
      </div>

      <button 
        className="btn btn-primary" 
        onClick={handleSaveLocation}
        disabled={isSaving}
        style={{ height: '56px', fontSize: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}
      >
        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
        {saveSuccess ? 'Location Saved!' : 'Set as My Location'}
      </button>
      {saveSuccess && (
        <div style={{ textAlign: 'center', marginTop: '12px', color: 'var(--color-primary)', fontWeight: '500' }}>
          Your location is now visible to users.
        </div>
      )}
    </div>
  );
}
