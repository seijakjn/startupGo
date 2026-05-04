'use client';
import React from 'react';
import { Activity, Car, Utensils, Package, TrendingUp, Users } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Active Rides', value: '24', icon: Car, color: '#3b82f6', trend: '+12%' },
    { label: 'Food Orders', value: '56', icon: Utensils, color: '#f59e0b', trend: '+5%' },
    { label: 'Pending Parcels', value: '18', icon: Package, color: '#10b981', trend: '-2%' },
    { label: 'Total Users', value: '1,204', icon: Users, color: '#8b5cf6', trend: '+24%' },
  ];

  const recentActivity = [
    { id: 1, type: 'Fetch Me', user: 'Maria Santos', status: 'In Transit', time: '2 mins ago', amount: '₱120.00' },
    { id: 2, type: 'Food', user: 'Juan Dela Cruz', status: 'Preparing', time: '5 mins ago', amount: '₱350.00' },
    { id: 3, type: 'Parcel', user: 'Ana Reyes', status: 'Assigned', time: '12 mins ago', amount: '₱80.00' },
    { id: 4, type: 'Food', user: 'Mark Bautista', status: 'Delivered', time: '18 mins ago', amount: '₱420.00' },
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
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--color-on-surface-variant)' }}>Service</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--color-on-surface-variant)' }}>User</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--color-on-surface-variant)' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--color-on-surface-variant)' }}>Amount</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'var(--color-on-surface-variant)' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity) => (
                <tr key={activity.id} style={{ borderBottom: '1px solid var(--color-surface-container-highest)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '500' }}>{activity.type}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-on-surface-variant)' }}>{activity.user}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                      backgroundColor: activity.status === 'Delivered' ? 'var(--color-primary-container)' : 'var(--color-surface-container)',
                      color: activity.status === 'Delivered' ? 'var(--color-on-primary-container)' : 'var(--color-on-surface)'
                    }}>
                      {activity.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: '600' }}>{activity.amount}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>{activity.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
