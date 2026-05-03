import React from 'react';
import { MapPin, Truck, Calendar } from 'lucide-react';

export default function ParcelPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="text-headline-md" style={{ marginBottom: '24px' }}>Parcel Delivery</h2>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button className="btn btn-primary" style={{ flex: 1 }}>Send Package</button>
        <button className="btn btn-secondary" style={{ flex: 1 }}>Track Package</button>
      </div>

      <div className="card shadow-level-1" style={{ marginBottom: '24px' }}>
        <h3 className="text-headline-sm" style={{ marginBottom: '16px' }}>Sender Details</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '4px' }}>Pickup Address</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '8px' }}>
              <MapPin size={18} color="var(--color-primary)" />
              <input type="text" defaultValue="SM City Butuan" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent' }} />
            </div>
          </div>
          <div>
            <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '4px' }}>Sender Name</div>
            <input type="text" placeholder="Your name" style={{ width: '100%', padding: '8px 0', border: 'none', borderBottom: '1px solid var(--color-outline-variant)', outline: 'none', background: 'transparent' }} />
          </div>
        </div>
      </div>

      <div className="card shadow-level-1" style={{ marginBottom: '32px' }}>
        <h3 className="text-headline-sm" style={{ marginBottom: '16px' }}>Recipient Details</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '4px' }}>Delivery Address</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '8px' }}>
              <MapPin size={18} color="var(--color-error)" />
              <input type="text" placeholder="Where to deliver?" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent' }} />
            </div>
          </div>
          <div>
            <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '4px' }}>Recipient Name</div>
            <input type="text" placeholder="Receiver's name" style={{ width: '100%', padding: '8px 0', border: 'none', borderBottom: '1px solid var(--color-outline-variant)', outline: 'none', background: 'transparent' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', border: '2px solid var(--color-primary)', backgroundColor: 'var(--color-surface-container-low)' }}>
          <Truck size={24} color="var(--color-primary)" />
          <div>
            <div className="text-label-md">Same Day</div>
            <div className="text-body-sm">₱80 flat rate</div>
          </div>
        </div>
        <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar size={24} color="var(--color-on-surface-variant)" />
          <div>
            <div className="text-label-md">Scheduled</div>
            <div className="text-body-sm">Select date</div>
          </div>
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: '100%' }}>Continue to Payment</button>
    </div>
  );
}
