import React from 'react';
import { Key, Calendar, Users, Map } from 'lucide-react';

export default function RentalPage() {
  const vehicles = [
    { name: 'Toyota HiAce Commuter', type: 'Van', capacity: 15, price: '₱3,500/day', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=300&q=80' },
    { name: 'Toyota Innova', type: 'SUV/MPV', capacity: 7, price: '₱2,500/day', image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=300&q=80' },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="text-headline-md">Vehicle Rental</h2>
        <div className="chip active">Caraga Region Only</div>
      </div>

      <div className="card shadow-level-1" style={{ marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1 1 200px' }}>
          <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>Pickup Date & Time</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--rounded-md)' }}>
            <Calendar size={18} color="var(--color-primary)" />
            <span>Select Date</span>
          </div>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>Destination / Route</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--rounded-md)' }}>
            <Map size={18} color="var(--color-primary)" />
            <input type="text" placeholder="e.g. Surigao City" style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent' }} />
          </div>
        </div>
      </div>

      <h3 className="text-headline-sm" style={{ marginBottom: '16px' }}>Available Vehicles (With Driver)</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {vehicles.map((v, i) => (
          <div key={i} className="card shadow-level-1" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '160px', backgroundImage: `url(${v.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div className="text-label-lg" style={{ fontSize: '16px' }}>{v.name}</div>
                <div className="text-headline-sm" style={{ color: 'var(--color-primary)', fontSize: '16px' }}>{v.price}</div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>
                  <Key size={16} /> {v.type}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>
                  <Users size={16} /> {v.capacity} pax
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>Book This Vehicle</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
