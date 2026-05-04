"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Truck, Calendar, Search, Package as PackageIcon, CheckCircle, Clock } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import { supabase } from '../../lib/supabase';

import { useSearchParams } from 'next/navigation';

// Dynamically import Map
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

export default function ParcelPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('send'); // 'send' or 'track'
  const [deliveryType, setDeliveryType] = useState('sameday');
  const [paymentOpen, setPaymentOpen] = useState(false);
  
  // Tracking state
  const [trackingId, setTrackingId] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackedJob, setTrackedJob] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [destinationPos, setDestinationPos] = useState(null);
  const [riderPos, setRiderPos] = useState(null);
  
  // Send state
  const [pickup, setPickup] = useState('SM City Butuan');
  const [dropoff, setDropoff] = useState('');
  const [nearbyRiders, setNearbyRiders] = useState([]);
  
  // Autocomplete state
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);
  
  const [isFocusedPickup, setIsFocusedPickup] = useState(false);
  const [isFocusedDropoff, setIsFocusedDropoff] = useState(false);

  const debouncedPickup = useDebounce(pickup, 400);
  const debouncedDropoff = useDebounce(dropoff, 400);

  const price = deliveryType === 'sameday' ? 80 : 60;

  // Fetch Nearby Riders
  useEffect(() => {
    const fetchRiders = async () => {
      const { data } = await supabase.from('rider_locations').select('lat, lon').limit(20);
      if (data) setNearbyRiders(data);
    };
    fetchRiders();
  }, []);

  // Fetch Pickup Suggestions
  useEffect(() => {
    if (!debouncedPickup || debouncedPickup.length < 3 || !isFocusedPickup) {
      if (!isFocusedPickup) setShowPickupDropdown(false);
      return;
    }
    const fetchSuggestions = async () => {
      const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
      const res = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(debouncedPickup)}&boundary.circle.lat=8.9475&boundary.circle.lon=125.5406&boundary.circle.radius=50&size=5`);
      const data = await res.json();
      if (data.features && isFocusedPickup) {
        setPickupSuggestions(data.features);
        setShowPickupDropdown(true);
      }
    };
    fetchSuggestions();
  }, [debouncedPickup, isFocusedPickup]);

  // Fetch Dropoff Suggestions
  useEffect(() => {
    if (!debouncedDropoff || debouncedDropoff.length < 3 || !isFocusedDropoff) {
      if (!isFocusedDropoff) setShowDropoffDropdown(false);
      return;
    }
    const fetchSuggestions = async () => {
      const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
      const res = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(debouncedDropoff)}&boundary.circle.lat=8.9475&boundary.circle.lon=125.5406&boundary.circle.radius=50&size=5`);
      const data = await res.json();
      if (data.features && isFocusedDropoff) {
        setDropoffSuggestions(data.features);
        setShowDropoffDropdown(true);
      }
    };
    fetchSuggestions();
  }, [debouncedDropoff, isFocusedDropoff]);

  // Handle auto-tracking from URL
  useEffect(() => {
    const id = searchParams.get('track');
    if (id) {
      setTrackingId(id);
      setActiveTab('track');
      performTrack(id);
    }
  }, [searchParams]);

  // Subscribe to rider location if job is active
  useEffect(() => {
    if (!trackedJob || !trackedJob.rider_id || ['completed', 'cancelled'].includes(trackedJob.status)) {
      setRiderPos(null);
      return;
    }

    let channel;

    const init = async () => {
      // Initial fetch
      const { data } = await supabase
        .from('rider_locations')
        .select('lat, lon')
        .eq('rider_id', trackedJob.rider_id)
        .single();
      
      if (data) setRiderPos({ lat: data.lat, lon: data.lon });

      // Subscribe
      channel = supabase.channel(`rider_loc_${trackedJob.rider_id}`);
      
      channel
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'rider_locations', filter: `rider_id=eq.${trackedJob.rider_id}` },
          (payload) => {
            setRiderPos({ lat: payload.new.lat, lon: payload.new.lon });
          }
        )
        .subscribe();
    };

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [trackedJob?.id, trackedJob?.rider_id, trackedJob?.status]);

  const performTrack = async (id) => {
    setIsTracking(true);
    setTrackError('');
    setTrackedJob(null);
    setDestinationPos(null);

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id.trim())
        .single();

      if (error || !data) {
        throw new Error('Package not found. Please check your Tracking ID.');
      }
      
      setTrackedJob(data);

      if (data.details?.dropoff) {
        const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
        const res = await fetch(
          `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(data.details.dropoff)}&boundary.circle.lat=8.9475&boundary.circle.lon=125.5406&boundary.circle.radius=50&size=1`
        );
        const geoData = await res.json();
        if (geoData.features && geoData.features.length > 0) {
          const [lon, lat] = geoData.features[0].geometry.coordinates;
          setDestinationPos({ name: data.details.dropoff, pos: [lat, lon] });
        }
      }
    } catch (err) {
      setTrackError(err.message || 'Failed to track package.');
    } finally {
      setIsTracking(false);
    }
  };

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    performTrack(trackingId);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="text-headline-md" style={{ marginBottom: '24px' }}>Parcel Delivery</h2>

      <div className="glass" style={{ display: 'flex', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('send')}
          style={{ 
            flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            backgroundColor: activeTab === 'send' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'send' ? 'white' : 'var(--color-on-surface)',
            fontWeight: '600', transition: 'all 0.2s'
          }}
        >
          Send Package
        </button>
        <button 
          onClick={() => setActiveTab('track')}
          style={{ 
            flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            backgroundColor: activeTab === 'track' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'track' ? 'white' : 'var(--color-on-surface)',
            fontWeight: '600', transition: 'all 0.2s'
          }}
        >
          Track Package
        </button>
      </div>

      {activeTab === 'send' ? (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div className="shadow-level-1" style={{ position: 'relative', height: '240px', borderRadius: 'var(--rounded-lg)', overflow: 'hidden', marginBottom: '24px', zIndex: 1 }}>
            <ButuanMap center={DEFAULT_CENTER} DEFAULT_CENTER={DEFAULT_CENTER} riders={nearbyRiders} />
            <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
              <div className="chip" style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'var(--color-primary)', fontWeight: '700', fontSize: '11px', backdropFilter: 'blur(4px)' }}>
                {nearbyRiders.length} RIDERS NEARBY
              </div>
            </div>
          </div>

          <div className="card shadow-level-1" style={{ marginBottom: '24px' }}>
            <h3 className="text-headline-sm" style={{ marginBottom: '16px' }}>Sender Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '4px' }}>Pickup Address</div>
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '8px' }}>
                    <MapPin size={18} color="var(--color-primary)" />
                    <input 
                      type="text" 
                      value={pickup} 
                      onChange={e => setPickup(e.target.value)} 
                      onFocus={() => setIsFocusedPickup(true)}
                      onBlur={() => setTimeout(() => setIsFocusedPickup(false), 200)}
                      style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--color-on-surface)' }} 
                    />
                  </div>
                  {showPickupDropdown && pickupSuggestions.length > 0 && (
                    <div className="card shadow-level-3" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, padding: '8px', marginTop: '4px', maxHeight: '250px', overflowY: 'auto', backgroundColor: 'var(--color-surface-container-high)', border: '1px solid var(--color-outline-variant)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
                        <span className="text-label-sm" style={{ opacity: 0.7 }}>Suggestions</span>
                        <button onClick={() => setShowPickupDropdown(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '11px', fontWeight: '700' }}>CLOSE</button>
                      </div>
                      {pickupSuggestions.map((s, i) => (
                        <button 
                          key={i} 
                          onMouseDown={() => { setPickup(s.properties.label); setShowPickupDropdown(false); }} 
                          style={{ width: '100%', padding: '12px 10px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '8px', fontSize: '13px', color: 'var(--color-on-surface)', display: 'block' }} 
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-container-highest)'} 
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {s.properties.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '4px' }}>Sender Name</div>
                <input type="text" placeholder="Your name" style={{ width: '100%', padding: '8px 0', border: 'none', borderBottom: '1px solid var(--color-outline-variant)', outline: 'none', background: 'transparent', color: 'var(--color-on-surface)' }} />
              </div>
            </div>
          </div>

          <div className="card shadow-level-1" style={{ marginBottom: '32px' }}>
            <h3 className="text-headline-sm" style={{ marginBottom: '16px' }}>Recipient Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '4px' }}>Delivery Address</div>
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '8px' }}>
                    <MapPin size={18} color="var(--color-error)" />
                    <input 
                      type="text" 
                      value={dropoff} 
                      onChange={e => setDropoff(e.target.value)} 
                      onFocus={() => setIsFocusedDropoff(true)}
                      onBlur={() => setTimeout(() => setIsFocusedDropoff(false), 200)}
                      placeholder="Where to deliver?" 
                      style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--color-on-surface)' }} 
                    />
                  </div>
                  {showDropoffDropdown && dropoffSuggestions.length > 0 && (
                    <div className="card shadow-level-3" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, padding: '8px', marginTop: '4px', maxHeight: '250px', overflowY: 'auto', backgroundColor: 'var(--color-surface-container-high)', border: '1px solid var(--color-outline-variant)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
                        <span className="text-label-sm" style={{ opacity: 0.7 }}>Suggestions</span>
                        <button onClick={() => setShowDropoffDropdown(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '11px', fontWeight: '700' }}>CLOSE</button>
                      </div>
                      {dropoffSuggestions.map((s, i) => (
                        <button 
                          key={i} 
                          onMouseDown={() => { setDropoff(s.properties.label); setShowDropoffDropdown(false); }} 
                          style={{ width: '100%', padding: '12px 10px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '8px', fontSize: '13px', color: 'var(--color-on-surface)', display: 'block' }} 
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-container-highest)'} 
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {s.properties.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '4px' }}>Recipient Name</div>
                <input type="text" placeholder="Receiver's name" style={{ width: '100%', padding: '8px 0', border: 'none', borderBottom: '1px solid var(--color-outline-variant)', outline: 'none' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <button
              onClick={() => setDeliveryType('sameday')}
              className="card"
              style={{
                flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '12px',
                border: deliveryType === 'sameday' ? '2px solid var(--color-primary)' : '2px solid var(--color-surface-container-highest)',
                backgroundColor: deliveryType === 'sameday' ? 'var(--color-surface-container-low)' : 'transparent',
                cursor: 'pointer', textAlign: 'left', padding: '16px'
              }}
            >
              <Truck size={24} color={deliveryType === 'sameday' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)'} />
              <div>
                <div className="text-label-md">Same Day</div>
                <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>₱80 flat rate</div>
              </div>
            </button>
            <button
              onClick={() => setDeliveryType('scheduled')}
              className="card"
              style={{
                flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '12px',
                border: deliveryType === 'scheduled' ? '2px solid var(--color-primary)' : '2px solid var(--color-surface-container-highest)',
                backgroundColor: deliveryType === 'scheduled' ? 'var(--color-surface-container-low)' : 'transparent',
                cursor: 'pointer', textAlign: 'left', padding: '16px'
              }}
            >
              <Calendar size={24} color={deliveryType === 'scheduled' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)'} />
              <div>
                <div className="text-label-md">Scheduled</div>
                <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>₱60 flat rate</div>
              </div>
            </button>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', height: '52px' }}
            disabled={!dropoff}
            onClick={() => dropoff && setPaymentOpen(true)}
          >
            {dropoff ? `Continue to Payment — ₱${price}` : 'Enter destination first'}
          </button>
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <form onSubmit={handleTrack} className="card shadow-level-1" style={{ marginBottom: '24px' }}>
            <h3 className="text-headline-sm" style={{ marginBottom: '16px' }}>Track Your Package</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid var(--color-outline)', borderRadius: 'var(--rounded)', backgroundColor: 'var(--color-surface)' }}>
                <Search size={20} color="var(--color-on-surface-variant)" />
                <input 
                  type="text" 
                  placeholder="Enter Tracking ID (Job ID)" 
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent' }} 
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isTracking || !trackingId}>
                {isTracking ? 'Searching...' : 'Track'}
              </button>
            </div>
            {trackError && <div className="text-body-sm" style={{ color: 'var(--color-error)', marginTop: '12px' }}>{trackError}</div>}
          </form>

          {trackedJob && (
            <div className="card shadow-level-2" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ height: '300px', width: '100%', position: 'relative', zIndex: 1 }}>
                <ButuanMap 
                  center={riderPos ? [riderPos.lat, riderPos.lon] : DEFAULT_CENTER} 
                  destination={destinationPos} 
                  DEFAULT_CENTER={DEFAULT_CENTER} 
                  riders={riderPos ? [riderPos] : []}
                />
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div>
                    <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Tracking ID</div>
                    <div className="text-body-md" style={{ fontFamily: 'monospace' }}>{trackedJob.id.split('-')[0].toUpperCase()}</div>
                  </div>
                  <div className="chip" style={{ 
                    backgroundColor: trackedJob.status === 'completed' ? 'var(--color-primary-container)' : 
                                     trackedJob.status === 'in_progress' ? '#fef3c7' : 'var(--color-surface-container)',
                    color: trackedJob.status === 'completed' ? 'var(--color-primary)' : 
                           trackedJob.status === 'in_progress' ? '#92400e' : 'var(--color-on-surface)'
                  }}>
                    {trackedJob.status.toUpperCase()}
                  </div>
                </div>

                {trackedJob.rider_id && (
                  <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--color-surface-container-low)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <Truck size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Your Rider</div>
                      <div className="text-body-md" style={{ fontWeight: '600' }}>Rider #{trackedJob.rider_id.substring(0, 5)}</div>
                    </div>
                    {riderPos && (
                      <div className="chip" style={{ backgroundColor: 'var(--color-primary-container)', color: 'var(--color-primary)', fontSize: '11px' }}>
                        LIVE ON MAP
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ marginTop: '4px' }}><PackageIcon size={20} color="var(--color-primary)" /></div>
                    <div>
                      <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Origin</div>
                      <div className="text-body-md">{trackedJob.details?.pickup || 'SM City Butuan'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ marginTop: '4px' }}><MapPin size={20} color="var(--color-error)" /></div>
                    <div>
                      <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Destination</div>
                      <div className="text-body-md">{trackedJob.details?.dropoff || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-surface-container-highest)' }}>
                  <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>Status Updates</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                    <CheckCircle size={16} /> <span className="text-body-sm">Order Placed</span>
                  </div>
                  {['accepted', 'in_progress', 'completed'].includes(trackedJob.status) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginTop: '8px' }}>
                      <CheckCircle size={16} /> <span className="text-body-sm">Rider Accepted</span>
                    </div>
                  )}
                  {['in_progress', 'completed'].includes(trackedJob.status) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginTop: '8px' }}>
                      <CheckCircle size={16} /> <span className="text-body-sm">Package Picked Up</span>
                    </div>
                  )}
                  {trackedJob.status === 'completed' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginTop: '8px' }}>
                      <CheckCircle size={16} /> <span className="text-body-sm">Delivered</span>
                    </div>
                  )}
                  {!['completed', 'cancelled'].includes(trackedJob.status) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-on-surface-variant)', marginTop: '8px' }}>
                      <Clock size={16} /> <span className="text-body-sm">Awaiting next update...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        amount={price}
        serviceLabel={`Parcel Delivery — ${deliveryType === 'sameday' ? 'Same Day' : 'Scheduled'}`}
        serviceType="parcel"
        details={{
          pickup: pickup,
          dropoff: dropoff
        }}
      />

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
