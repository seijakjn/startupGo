'use client';
import React, { useState } from 'react';
import { MapPin, Truck, Calendar } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

export default function ParcelPage() {
  const [deliveryType, setDeliveryType] = useState('sameday');
  const [paymentOpen, setPaymentOpen] = useState(false);

  const price = deliveryType === 'sameday' ? 80 : 60;

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
              <input type="text" defaultValue="SM City Butuan" style={{ flex: 1, border: 'none', outline: 'none' }} />
            </div>
          </div>
          <div>
            <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '4px' }}>Sender Name</div>
            <input type="text" placeholder="Your name" style={{ width: '100%', padding: '8px 0', border: 'none', borderBottom: '1px solid var(--color-outline-variant)', outline: 'none' }} />
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
              <input type="text" placeholder="Where to deliver?" style={{ flex: 1, border: 'none', outline: 'none' }} />
            </div>
          </div>
          <div>
            <div className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '4px' }}>Recipient Name</div>
            <input type="text" placeholder="Receiver's name" style={{ width: '100%', padding: '8px 0', border: 'none', borderBottom: '1px solid var(--color-outline-variant)', outline: 'none' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button
          onClick={() => setDeliveryType('sameday')}
          className="card"
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '12px',
            border: deliveryType === 'sameday' ? '2px solid var(--color-primary)' : '2px solid var(--color-surface-container-highest)',
            backgroundColor: deliveryType === 'sameday' ? 'var(--color-surface-container-low)' : 'transparent',
            cursor: 'pointer', textAlign: 'left',
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
            flex: 1, display: 'flex', alignItems: 'center', gap: '12px',
            border: deliveryType === 'scheduled' ? '2px solid var(--color-primary)' : '2px solid var(--color-surface-container-highest)',
            backgroundColor: deliveryType === 'scheduled' ? 'var(--color-surface-container-low)' : 'transparent',
            cursor: 'pointer', textAlign: 'left',
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
        onClick={() => setPaymentOpen(true)}
      >
        Continue to Payment — ₱{price}
      </button>

      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        amount={price}
        serviceLabel={`Parcel Delivery — ${deliveryType === 'sameday' ? 'Same Day' : 'Scheduled'}`}
      />
    </div>
  );
}
