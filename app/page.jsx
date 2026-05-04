'use client';
import React, { useState, useEffect } from 'react';
import { Car, Utensils, Package, Key, ArrowRight, Activity, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../lib/supabase';

export default function Home() {
  const { user } = useUser();
  const [activeJob, setActiveJob] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Fetch user's active job
    const fetchActiveJob = async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'accepted', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data) setActiveJob(data);
    };

    fetchActiveJob();

    // Subscribe to realtime updates for user's jobs
    const channel = supabase
      .channel('user_jobs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newJob = payload.new;
          if (['pending', 'accepted', 'in_progress'].includes(newJob.status)) {
            setActiveJob(newJob);
          } else {
            // Completed or cancelled
            if (activeJob?.id === newJob.id) setActiveJob(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeJob?.id]);
  const services = [
    { title: 'Fetch Me', desc: 'On-demand ride service', icon: Car, path: '/fetch-me', color: 'var(--color-primary)' },
    { title: 'Food Delivery', desc: 'Order from local restaurants', icon: Utensils, path: '/food', color: '#f59e0b' },
    { title: 'Parcel Delivery', desc: 'Same-day package sending', icon: Package, path: '/parcel', color: '#3b82f6' },
    { title: 'Vehicle Rental', desc: 'Vans & cars for group travel', icon: Key, path: '/rental', color: '#8b5cf6' }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)',
        borderRadius: 'var(--rounded-xl)',
        padding: '32px',
        color: 'white',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="text-headline-lg" style={{ color: 'white', marginBottom: '8px' }}>Where to, Butuan?</h2>
          <p className="text-body-lg" style={{ opacity: 0.9, marginBottom: '24px' }}>Your all-in-one mobility and delivery super app.</p>
          <div className="glass" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '12px 24px', borderRadius: 'var(--rounded-lg)', border: 'none' }}>
            <Car size={24} color="var(--color-primary)" />
            <div>
              <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Current Location</div>
              <div className="text-body-md" style={{ color: 'var(--color-on-surface)', fontWeight: '600' }}>SM City Butuan</div>
            </div>
          </div>
        </div>
        <div style={{
          position: 'absolute',
          right: '-50px',
          bottom: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)'
        }} />
      </div>

      {/* Active Service Status Tracker */}
      {activeJob && (
        <>
          <h3 className="text-headline-sm" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--color-primary)" />
            Active Service
          </h3>
          <div className="card shadow-level-1" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--color-primary)', animation: 'slideDown 0.3s ease' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '50%', 
              backgroundColor: 'var(--color-surface-container)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              {activeJob.type === 'food' ? <Utensils size={24} color="var(--color-primary)" /> : 
               activeJob.type === 'parcel' ? <Package size={24} color="var(--color-primary)" /> : 
               <Car size={24} color="var(--color-primary)" />}
            </div>
            <div style={{ flex: 1 }}>
              <div className="text-label-lg">{activeJob.details?.title || 'Your Request'}</div>
              <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                {activeJob.status === 'pending' ? 'Looking for a rider...' : 
                 activeJob.status === 'accepted' ? 'Rider has accepted and is on the way!' : 
                 'Job is in progress...'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <div className="chip" style={{ 
                backgroundColor: activeJob.status === 'pending' ? 'var(--color-surface-container-highest)' : 'var(--color-primary-container)', 
                color: activeJob.status === 'pending' ? 'var(--color-on-surface)' : 'var(--color-on-primary-container)' 
              }}>
                {activeJob.status === 'pending' ? 'Pending' : 
                 activeJob.status === 'accepted' ? 'Accepted' : 'In Progress'}
              </div>
              <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {activeJob.status !== 'pending' && <CheckCircle2 size={12} color="var(--color-primary)" />}
              </div>
            </div>
          </div>
          <style jsx>{`
            @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
        </>
      )}

      <h3 className="text-headline-sm" style={{ marginBottom: '16px' }}>Core Services</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        {services.map((service, idx) => {
          const Icon = service.icon;
          return (
            <Link href={service.path} key={idx} style={{ textDecoration: 'none' }}>
              <div className="card shadow-level-1" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                  width: '48px', height: '48px', 
                  borderRadius: 'var(--rounded-lg)', 
                  backgroundColor: `${service.color}15`, 
                  color: service.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Icon size={24} />
                </div>
                <div className="text-label-lg" style={{ marginBottom: '4px', color: 'var(--color-on-surface)' }}>{service.title}</div>
                <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', flex: 1 }}>{service.desc}</div>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', color: 'var(--color-primary)' }}>
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <h3 className="text-headline-sm" style={{ marginBottom: '16px' }}>Local Offers</h3>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: 'var(--rounded)', backgroundColor: 'var(--color-surface-container)' }}></div>
        <div>
          <div className="chip" style={{ marginBottom: '8px' }}>Promo</div>
          <div className="text-label-lg">50% off your first Fetch Me ride!</div>
          <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Valid until May 31 for Butuan City trips.</div>
        </div>
      </div>
    </div>
  );
}
