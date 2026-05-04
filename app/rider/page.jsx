'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../lib/supabase';
import { MapPin, Navigation, Clock, CheckCircle2 } from 'lucide-react';

export default function RiderDashboard() {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);

  useEffect(() => {
    if (!user) return;

    const subcategory = user.publicMetadata?.subcategory;
    
    // Fetch initial pending jobs and any active job for this rider
    const fetchJobs = async () => {
      const { data: pendingData } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'pending')
        .eq('type', subcategory || 'fetch_me')
        .order('created_at', { ascending: false });

      const { data: activeData } = await supabase
        .from('jobs')
        .select('*')
        .eq('rider_id', user.id)
        .in('status', ['accepted', 'in_progress']);

      if (pendingData) setJobs(pendingData);
      if (activeData && activeData.length > 0) setActiveJob(activeData[0]);
    };

    fetchJobs();

    // Subscribe to realtime inserts and updates
    const channel = supabase
      .channel('jobs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        (payload) => {
          const newJob = payload.new;
          if (payload.eventType === 'INSERT' && newJob.status === 'pending' && newJob.type === subcategory) {
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
          // Add to rider's wallet
          await supabase.rpc('increment_wallet', { 
            target_user_id: user.id, 
            amount: amount 
          });
          
          // Record earning transaction
          await supabase.from('transactions').insert({
            user_id: user.id,
            amount: amount,
            type: 'earning',
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
      <h2 className="text-headline-md" style={{ marginBottom: '24px' }}>Available Requests</h2>
      
      {jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-on-surface-variant)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Clock size={32} />
          </div>
          <p>Searching for nearby jobs...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {jobs.map((job) => (
            <div key={job.id} className="card shadow-level-1" style={{ animation: 'slideIn 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div className="text-label-lg" style={{ marginBottom: '4px' }}>{job.details?.title || 'New Request'}</div>
                  <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{new Date(job.created_at).toLocaleTimeString()}</div>
                </div>
                <div className="text-headline-sm" style={{ color: 'var(--color-primary)' }}>
                  ₱{job.details?.amount || '0.00'}
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
