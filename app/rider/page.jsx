'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../lib/supabase';
import { MapPin, Navigation, Clock, CheckCircle2, Car, Utensils, Package, Key } from 'lucide-react';

const DEFAULT_CENTER = [8.9475, 125.5406]; // SM City Butuan

// Haversine formula to calculate distance between two lat/lon points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;  
  const dLon = (lon2 - lon1) * Math.PI / 180; 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

export default function RiderDashboard() {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  
  // Cache to avoid re-geocoding the same strings repeatedly
  const [geocodeCache, setGeocodeCache] = useState({});

  useEffect(() => {
    if (!user) return;

    // 1. Fetch Rider Location
    const fetchLocation = async () => {
      const { data } = await supabase
        .from('rider_locations')
        .select('lat, lon')
        .eq('rider_id', user.id)
        .single();
      if (data) {
        setRiderLocation([data.lat, data.lon]);
      } else {
        // Fallback to default if not set
        setRiderLocation(DEFAULT_CENTER);
      }
    };

    // 2. Fetch Jobs
    const fetchJobs = async () => {
      const { data: pendingData } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      const { data: activeData } = await supabase
        .from('jobs')
        .select('*')
        .eq('rider_id', user.id)
        .in('status', ['accepted', 'in_progress']);

      if (pendingData) {
        setJobs(pendingData);
      }
      if (activeData && activeData.length > 0) setActiveJob(activeData[0]);
    };

    fetchLocation();
    fetchJobs();

    // Subscribe to realtime inserts and updates
    const channel = supabase
      .channel('jobs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        (payload) => {
          const newJob = payload.new;
          if (payload.eventType === 'INSERT' && newJob.status === 'pending') {
            setJobs((prev) => [newJob, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            if (newJob.status !== 'pending') {
              setJobs((prev) => prev.filter((j) => j.id !== newJob.id));
            }
            if (newJob.rider_id === user.id && ['accepted', 'in_progress'].includes(newJob.status)) {
              setActiveJob(newJob);
            }
            if (newJob.rider_id === user.id && ['completed', 'cancelled'].includes(newJob.status)) {
              if (activeJob?.id === newJob.id) setActiveJob(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeJob?.id]);

  // Async geocoding effect for jobs without coordinates
  useEffect(() => {
    if (!riderLocation || jobs.length === 0) return;

    const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
    if (!apiKey) return;

    jobs.forEach(async (job) => {
      const pickupString = job.details?.pickup;
      if (!pickupString || geocodeCache[pickupString]) return;

      try {
        const response = await fetch(
          `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(pickupString)}&boundary.circle.lat=8.9475&boundary.circle.lon=125.5406&boundary.circle.radius=50&size=1`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const [lon, lat] = data.features[0].geometry.coordinates;
          setGeocodeCache(prev => ({ ...prev, [pickupString]: [lat, lon] }));
        }
      } catch (err) {
        console.error("Geocoding failed for", pickupString, err);
      }
    });
  }, [jobs, riderLocation, geocodeCache]);


  const handleAcceptJob = async (jobId) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update({ status: 'accepted', rider_id: user.id })
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;
      setActiveJob(data);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      console.error('Error accepting job:', err);
      alert('Failed to accept job. Someone else may have taken it.');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!activeJob) return;
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', activeJob.id)
        .select()
        .single();

      if (error) throw error;

      // Logic for Rider Earnings upon completion
      if (newStatus === 'completed') {
        const amount = parseFloat(activeJob.details?.amount || 0);
        if (amount > 0) {
          await supabase.rpc('increment_wallet', { target_user_id: user.id, amount: amount });
          await supabase.from('transactions').insert({
            user_id: user.id, amount: amount, type: 'earning',
            description: `Earned from Job: ${activeJob.details?.title || 'Delivery'}`
          });
        }
      }

      if (['completed', 'cancelled'].includes(newStatus)) {
        setActiveJob(null);
      } else {
        setActiveJob(data);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const categories = ['All', 'Fetch Me', 'Food', 'Parcel', 'Rental'];
  
  const getJobIcon = (type) => {
    switch (type) {
      case 'food': return <Utensils size={18} color="var(--color-primary)" />;
      case 'parcel': return <Package size={18} color="var(--color-primary)" />;
      case 'rental': return <Key size={18} color="var(--color-primary)" />;
      default: return <Car size={18} color="var(--color-primary)" />;
    }
  };

  const getJobDistance = (pickupString) => {
    if (!riderLocation) return null;
    
    // Check if we have geocoded coordinates
    let targetCoords = null;
    if (pickupString === 'SM City Butuan') {
      targetCoords = DEFAULT_CENTER;
    } else if (geocodeCache[pickupString]) {
      targetCoords = geocodeCache[pickupString];
    }

    if (targetCoords) {
      const dist = calculateDistance(riderLocation[0], riderLocation[1], targetCoords[0], targetCoords[1]);
      return dist.toFixed(1) + ' km away';
    }

    return 'Calculating distance...';
  };

  const filteredJobs = activeTab === 'All' 
    ? jobs 
    : jobs.filter(j => {
        if (activeTab === 'Fetch Me') return j.type === 'fetch_me';
        if (activeTab === 'Food') return j.type === 'food';
        if (activeTab === 'Parcel') return j.type === 'parcel';
        if (activeTab === 'Rental') return j.type === 'rental';
        return true;
      });

  if (activeJob) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h2 className="text-headline-md" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', animation: 'pulse 2s infinite' }} />
          Active Job
        </h2>
        
        <div className="card shadow-level-1" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--color-surface-container-highest)' }}>
            <div className="chip" style={{ backgroundColor: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)' }}>
              {activeJob.status === 'accepted' ? 'En route to pickup' : 'In Progress'}
            </div>
            <div className="text-label-lg" style={{ color: 'var(--color-primary)' }}>₱{activeJob.details?.amount || '0.00'}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <MapPin size={24} color="var(--color-primary)" />
                <div style={{ width: '2px', height: '40px', backgroundColor: 'var(--color-surface-container-highest)', margin: '4px 0' }} />
                <Navigation size={24} color="var(--color-error)" />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Pickup</div>
                  <div className="text-body-lg">{activeJob.details?.pickup || 'Customer Location'}</div>
                </div>
                <div>
                  <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Dropoff</div>
                  <div className="text-body-lg">{activeJob.details?.dropoff || 'Destination'}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
            {activeJob.status === 'accepted' ? (
              <button onClick={() => handleUpdateStatus('in_progress')} className="btn btn-primary" style={{ flex: 1, height: '56px', fontSize: '16px' }}>
                Mark as In Progress
              </button>
            ) : (
              <button onClick={() => handleUpdateStatus('completed')} className="btn btn-primary" style={{ flex: 1, height: '56px', fontSize: '16px' }}>
                Complete Job
              </button>
            )}
          </div>
        </div>
        <style jsx>{`
          @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(52,211,153, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(52,211,153, 0); } 100% { box-shadow: 0 0 0 0 rgba(52,211,153, 0); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="text-headline-md" style={{ marginBottom: '16px' }}>Available Requests</h2>
      
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '16px' }}>
        {categories.map((c) => (
          <div
            key={c}
            className={`chip ${activeTab === c ? 'active' : ''}`}
            style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}
            onClick={() => setActiveTab(c)}
          >
            {c}
          </div>
        ))}
      </div>
      
      {filteredJobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-on-surface-variant)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Clock size={32} />
          </div>
          <p>No nearby jobs found in this category.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredJobs.map((job) => (
            <div key={job.id} className="card shadow-level-1" style={{ animation: 'slideIn 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div className="text-label-lg" style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getJobIcon(job.type)} {job.details?.title || 'New Request'}
                  </div>
                  <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{new Date(job.created_at).toLocaleTimeString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="text-headline-sm" style={{ color: 'var(--color-primary)' }}>
                    ₱{job.details?.amount || '0.00'}
                  </div>
                  {riderLocation && (
                    <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', fontWeight: '600' }}>
                      {getJobDistance(job.details?.pickup)}
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', color: 'var(--color-on-surface)' }}>
                <MapPin size={18} color="var(--color-on-surface-variant)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div className="text-body-md" style={{ lineHeight: '1.4' }}>
                  {job.details?.pickup || 'Pickup location not specified'}
                </div>
              </div>

              <button 
                onClick={() => handleAcceptJob(job.id)}
                className="btn btn-primary" 
                style={{ width: '100%', height: '48px', display: 'flex', justifyContent: 'center', gap: '8px' }}
              >
                <CheckCircle2 size={20} />
                Accept Job
              </button>
            </div>
          ))}
        </div>
      )}
      <style jsx>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
