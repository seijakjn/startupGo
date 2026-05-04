'use client';
import React, { useState, useEffect } from 'react';
import { Activity, Car, Utensils, Package, TrendingUp, Users, XCircle, RefreshCcw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setJobs(data);
    };

    fetchJobs();

    const channel = supabase
      .channel('admin_jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setJobs(prev => [payload.new, ...prev].slice(0, 20));
        } else if (payload.eventType === 'UPDATE') {
          setJobs(prev => prev.map(j => j.id === payload.new.id ? payload.new : j));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleCancelJob = async (id) => {
    if (!confirm('Are you sure you want to cancel this job? This will simulate reimbursing the user and rider.')) return;
    await supabase.from('jobs').update({ status: 'cancelled' }).eq('id', id);
  };

  const handleReassignJob = async (id) => {
    if (!confirm('Reassign this job? It will be put back into the pending pool for another rider.')) return;
    await supabase.from('jobs').update({ status: 'pending', rider_id: null }).eq('id', id);
  };

  const stats = [
    { label: 'Active Jobs', value: jobs.filter(j => ['accepted', 'in_progress'].includes(j.status)).length.toString(), icon: Car, color: '#3b82f6', trend: '+12%' },
    { label: 'Pending Requests', value: jobs.filter(j => j.status === 'pending').length.toString(), icon: Utensils, color: '#f59e0b', trend: '+5%' },
    { label: 'Completed Today', value: jobs.filter(j => j.status === 'completed').length.toString(), icon: Package, color: '#10b981', trend: '-2%' },
    { label: 'Cancelled', value: jobs.filter(j => j.status === 'cancelled').length.toString(), icon: Users, color: '#f87171', trend: '+1%' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="text-headline-lg" style={{ marginBottom: '8px' }}>Dashboard Overview</h1>
      <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '32px' }}>
        Monitor real-time activities across all Butuan Go services.
      </p>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const isPositive = stat.trend.startsWith('+');
          return (
            <div key={idx} className="card shadow-level-1" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={24} color={stat.color} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isPositive ? 'var(--color-primary)' : 'var(--color-error)', fontSize: '14px', fontWeight: '600' }}>
                  {isPositive ? <TrendingUp size={16} /> : <TrendingUp size={16} style={{ transform: 'rotate(180deg)' }} />}
                  {stat.trend}
                </div>
              </div>
              <div className="text-headline-lg" style={{ marginBottom: '4px' }}>{stat.value}</div>
              <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Table */}
      <div className="card shadow-level-1" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-surface-container-highest)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--color-error)" />
            <h3 className="text-headline-sm" style={{ margin: 0 }}>Live Activity Feed</h3>
          </div>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '14px' }}>View All</button>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
              <tr>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--color-on-surface-variant)' }}>Type</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--color-on-surface-variant)' }}>Details</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--color-on-surface-variant)' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--color-on-surface-variant)' }}>Amount</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--color-on-surface-variant)' }}>Time</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--color-on-surface-variant)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>No active jobs yet.</td></tr>
              ) : jobs.map((job) => (
                <tr key={job.id} style={{ borderBottom: '1px solid var(--color-surface-container-highest)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '500', textTransform: 'capitalize' }}>{job.type.replace('_', ' ')}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-on-surface-variant)' }}>{job.details?.title}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                      backgroundColor: ['completed'].includes(job.status) ? 'var(--color-primary-container)' : 
                                      ['cancelled'].includes(job.status) ? 'var(--color-error-container)' : 'var(--color-surface-container)',
                      color: ['completed'].includes(job.status) ? 'var(--color-on-primary-container)' : 
                             ['cancelled'].includes(job.status) ? 'var(--color-error)' : 'var(--color-on-surface)'
                    }}>
                      {job.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: '600' }}>₱{job.details?.amount || '0.00'}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>
                    {new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '16px 24px', display: 'flex', gap: '8px' }}>
                    {['pending', 'accepted', 'in_progress'].includes(job.status) && (
                      <>
                        <button onClick={() => handleCancelJob(job.id)} title="Cancel Job & Reimburse" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}>
                          <XCircle size={18} />
                        </button>
                        {['accepted', 'in_progress'].includes(job.status) && (
                          <button onClick={() => handleReassignJob(job.id)} title="Reassign to new Rider" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}>
                            <RefreshCcw size={18} />
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
