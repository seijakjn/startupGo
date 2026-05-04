'use client';
import React, { useState, useEffect } from 'react';
import { Car, Utensils, Package, Key, ArrowRight, Activity, Clock, CheckCircle2, History, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  const [activeJob, setActiveJob] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Redirection logic for special roles
    const role = user.publicMetadata?.role;
    if (role === 'admin') {
      router.push('/admin');
      return;
    }
    if (role === 'rider') {
      router.push('/rider');
      return;
    }

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

    // Fetch recent activity (transactions + completed jobs)
    const fetchRecentActivity = async () => {
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (!error) setRecentActivity(data || []);
      setLoadingHistory(false);
    };

    fetchActiveJob();
    fetchRecentActivity();

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
            if (activeJob?.id === newJob.id) setActiveJob(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeJob?.id, router]);

  const services = [
    { title: 'Fetch Me', desc: 'On-demand ride service', icon: Car, path: '/fetch-me', color: 'var(--color-primary)' },
    { title: 'Food Delivery', desc: 'Order from local restaurants', icon: Utensils, path: '/food', color: '#f59e0b' },
    { title: 'Parcel Delivery', desc: 'Same-day package sending', icon: Package, path: '/parcel', color: '#3b82f6' },
    { title: 'Vehicle Rental', desc: 'Vans & cars for group travel', icon: Key, path: '/rental', color: '#8b5cf6' }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
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
          <p className="text-body-lg" style={{ opacity: 0.9, marginBottom: '24px' }}>Your all-in-one super app.</p>
          <div className="glass" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '12px 24px', borderRadius: 'var(--rounded-lg)', border: 'none' }}>
            <Car size={24} color="var(--color-primary)" />
            <div>
              <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Current Location</div>
              <div className="text-body-md" style={{ color: 'var(--color-on-surface)', fontWeight: '600' }}>SM City Butuan</div>
            </div>
          </div>
        </div>
        <div style={{
          position: 'absolute', right: '-50px', bottom: '-50px', width: '200px', height: '200px',
          borderRadius: '50%', background: 'rgba(255,255,255,0.1)'
        }} />
      </div>

      {activeJob && (
        <>
          <h3 className="text-headline-sm" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--color-primary)" />
            Active Service
          </h3>
          <div className="card shadow-level-1" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeJob.type === 'food' ? <Utensils size={24} color="var(--color-primary)" /> : 
               activeJob.type === 'parcel' ? <Package size={24} color="var(--color-primary)" /> : 
               <Car size={24} color="var(--color-primary)" />}
            </div>
            <div style={{ flex: 1 }}>
              <div className="text-label-lg">{activeJob.details?.title || 'Your Request'}</div>
              <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                {activeJob.status === 'pending' ? 'Looking for a rider...' : 
                 activeJob.status === 'accepted' ? 'Rider has accepted!' : 'In progress...'}
              </div>
            </div>
            <div className="chip" style={{ backgroundColor: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)' }}>
              {activeJob.status.toUpperCase()}
            </div>
          </div>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        <div>
          <h3 className="text-headline-sm" style={{ marginBottom: '16px' }}>Services</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
            {services.map((service, idx) => (
              <Link href={service.path} key={idx} style={{ textDecoration: 'none' }}>
                <div className="card shadow-level-1" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--rounded)', backgroundColor: `${service.color}15`, color: service.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <service.icon size={20} />
                  </div>
                  <div className="text-label-lg" style={{ marginBottom: '4px', color: 'var(--color-on-surface)' }}>{service.title}</div>
                  <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{service.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="text-headline-sm">Recent Activity</h3>
            <Link href="/wallet" style={{ fontSize: '13px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '600' }}>See All</Link>
          </div>
          <div className="card shadow-level-1" style={{ padding: '0', overflow: 'hidden' }}>
            {loadingHistory ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>Loading...</div>
            ) : recentActivity.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-on-surface-variant)', fontStyle: 'italic' }}>
                <Clock size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <div>No recent activity</div>
              </div>
            ) : (
              recentActivity.map((tx, idx) => (
                <div key={tx.id} style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', 
                  borderBottom: idx < recentActivity.length - 1 ? '1px solid var(--color-surface-container-highest)' : 'none' 
                }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    backgroundColor: tx.type === 'payment' ? 'var(--color-error-container)' : 'var(--color-primary-container)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {tx.type === 'payment' ? <ArrowUpRight size={16} color="var(--color-error)" /> : <ArrowDownLeft size={16} color="var(--color-primary)" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-label-md" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</div>
                    <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{new Date(tx.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-label-md" style={{ color: tx.type === 'payment' ? 'var(--color-error)' : 'var(--color-primary)' }}>
                    {tx.type === 'payment' ? '-' : '+'}₱{Math.abs(tx.amount).toFixed(0)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
