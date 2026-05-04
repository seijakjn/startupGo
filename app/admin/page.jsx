'use client';
import React, { useState, useEffect } from 'react';
import { Activity, Car, Utensils, Package, TrendingUp, Users, XCircle, RefreshCcw, Shield, User as UserIcon, Search, Check, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users'
  const [jobs, setJobs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingRole, setEditingRole] = useState('');

  // Fetch jobs for overview
  useEffect(() => {
    if (activeTab === 'overview') {
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
    }
  }, [activeTab]);

  // Fetch users for management
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) setUsersList(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUpdateRole = async (targetUserId) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, role: editingRole })
      });
      if (res.ok) {
        setUsersList(prev => prev.map(u => u.id === targetUserId ? { ...u, role: editingRole } : u));
        setEditingUserId(null);
        alert('Role updated successfully!');
      }
    } catch (error) {
      alert('Failed to update role');
    }
  };

  const handleCancelJob = async (id) => {
    if (!confirm('Cancel this job?')) return;
    await supabase.from('jobs').update({ status: 'cancelled' }).eq('id', id);
  };

  const stats = [
    { label: 'Active Jobs', value: jobs.filter(j => ['accepted', 'in_progress'].includes(j.status)).length.toString(), icon: Car, color: '#3b82f6', trend: '+12%' },
    { label: 'Pending Requests', value: jobs.filter(j => j.status === 'pending').length.toString(), icon: Utensils, color: '#f59e0b', trend: '+5%' },
    { label: 'Total Users', value: usersList.length > 0 ? usersList.length.toString() : '...', icon: Users, color: '#8b5cf6', trend: '+3%' },
    { label: 'Completed', value: jobs.filter(j => j.status === 'completed').length.toString(), icon: Check, color: '#10b981', trend: '+8%' },
  ];

  const filteredUsers = usersList.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 className="text-headline-lg" style={{ marginBottom: '8px' }}>Admin Portal</h1>
          <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
            System-wide oversight and user management.
          </p>
        </div>
        <div className="glass" style={{ display: 'flex', padding: '4px', borderRadius: '12px' }}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{ 
              padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              backgroundColor: activeTab === 'overview' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'overview' ? 'white' : 'var(--color-on-surface)',
              fontWeight: '600', transition: 'all 0.2s'
            }}
          >Overview</button>
          <button 
            onClick={() => setActiveTab('users')}
            style={{ 
              padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              backgroundColor: activeTab === 'users' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'users' ? 'white' : 'var(--color-on-surface)',
              fontWeight: '600', transition: 'all 0.2s'
            }}
          >Users</button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            {stats.map((stat, idx) => (
              <div key={idx} className="card shadow-level-1" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <stat.icon size={24} color={stat.color} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: stat.trend.startsWith('+') ? 'var(--color-primary)' : 'var(--color-error)' }}>{stat.trend}</div>
                </div>
                <div className="text-headline-lg">{stat.value}</div>
                <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Activity Feed */}
          <div className="card shadow-level-1" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-surface-container-highest)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="var(--color-error)" />
              <h3 className="text-headline-sm" style={{ margin: 0 }}>Live Activity Feed</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', fontSize: '14px' }}>Type</th>
                    <th style={{ padding: '16px 24px', fontSize: '14px' }}>Details</th>
                    <th style={{ padding: '16px 24px', fontSize: '14px' }}>Status</th>
                    <th style={{ padding: '16px 24px', fontSize: '14px' }}>Amount</th>
                    <th style={{ padding: '16px 24px', fontSize: '14px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} style={{ borderBottom: '1px solid var(--color-surface-container-highest)' }}>
                      <td style={{ padding: '16px 24px', textTransform: 'capitalize' }}>{job.type}</td>
                      <td style={{ padding: '16px 24px' }}>{job.details?.title}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span className="chip" style={{ backgroundColor: job.status === 'completed' ? 'var(--color-primary-container)' : 'var(--color-surface-container)' }}>
                          {job.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontWeight: '600' }}>₱{job.details?.amount}</td>
                      <td style={{ padding: '16px 24px' }}>
                        {['pending', 'accepted'].includes(job.status) && (
                          <button onClick={() => handleCancelJob(job.id)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}>
                            <XCircle size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card shadow-level-1" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--color-surface-container-highest)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div className="glass" style={{ flex: 1, maxWidth: '400px', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderRadius: '12px' }}>
              <Search size={20} color="var(--color-on-surface-variant)" />
              <input 
                type="text" 
                placeholder="Search users by name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '14px' }}
              />
            </div>
            <button onClick={fetchUsers} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCcw size={16} style={{ animation: loadingUsers ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
                <tr>
                  <th style={{ padding: '16px 24px', fontSize: '14px' }}>User</th>
                  <th style={{ padding: '16px 24px', fontSize: '14px' }}>Email</th>
                  <th style={{ padding: '16px 24px', fontSize: '14px' }}>Role</th>
                  <th style={{ padding: '16px 24px', fontSize: '14px' }}>Joined</th>
                  <th style={{ padding: '16px 24px', fontSize: '14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>Loading user directory...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>No users found.</td></tr>
                ) : filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--color-surface-container-highest)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={u.imageUrl} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
                        <span style={{ fontWeight: '600' }}>{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--color-on-surface-variant)' }}>{u.email}</td>
                    <td style={{ padding: '16px 24px' }}>
                      {editingUserId === u.id ? (
                        <select 
                          value={editingRole} 
                          onChange={(e) => setEditingRole(e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-primary)' }}
                        >
                          <option value="user">User</option>
                          <option value="rider">Rider</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className="chip" style={{ 
                          backgroundColor: u.role === 'admin' ? 'var(--color-primary-container)' : 
                                          u.role === 'rider' ? '#fef3c7' : 'var(--color-surface-container)',
                          color: u.role === 'admin' ? 'var(--color-primary)' : 
                                 u.role === 'rider' ? '#92400e' : 'var(--color-on-surface)',
                          fontWeight: '700'
                        }}>
                          {u.role.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {editingUserId === u.id ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleUpdateRole(u.id)} className="btn btn-primary" style={{ padding: '4px 8px' }}>
                            <Save size={16} />
                          </button>
                          <button onClick={() => setEditingUserId(null)} className="btn btn-secondary" style={{ padding: '4px 8px' }}>
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setEditingUserId(u.id); setEditingRole(u.role); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
                        >
                          <Shield size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}
