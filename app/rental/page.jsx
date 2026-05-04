"use client";
import React, { useState } from 'react';
import { Key, Calendar, Users, Clock, Phone } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

export default function RentalPage() {
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  
  // Booking modal state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showBookingPrompt, setShowBookingPrompt] = useState(false);
  const [purpose, setPurpose] = useState('Tourism/Leisure');
  const [duration, setDuration] = useState(1);
  const [paymentOpen, setPaymentOpen] = useState(false);
  
  const vehicles = [
    { id: 'hiace', name: 'Toyota HiAce Commuter', type: 'Van', capacity: 15, price: 3500, priceLabel: '₱3,500/day', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=300&q=80' },
    { id: 'innova', name: 'Toyota Innova', type: 'SUV/MPV', capacity: 7, price: 2500, priceLabel: '₱2,500/day', image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=300&q=80' },
    { id: 'fortuner', name: 'Toyota Fortuner', type: 'SUV', capacity: 7, price: 3000, priceLabel: '₱3,000/day', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=300&q=80' },
  ];

  const handleBookClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowBookingPrompt(true);
  };

  const handleProceedToPayment = () => {
    if (!pickupDate || !pickupTime || !contactNumber) {
      alert('Please fill in all details before proceeding.');
      return;
    }
    setShowBookingPrompt(false);
    setPaymentOpen(true);
  };

  const finalPrice = selectedVehicle ? selectedVehicle.price * duration : 0;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="text-headline-md">Vehicle Rental</h2>
        <div className="chip active">Self-Drive · Caraga Region</div>
      </div>

      <div className="card shadow-level-1" style={{ marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1 1 240px' }}>
          <label className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '8px', display: 'block' }}>Pickup Date</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--rounded-md)', backgroundColor: 'var(--color-surface)' }}>
            <Calendar size={20} color="var(--color-primary)" />
            <input 
              type="date" 
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', color: 'var(--color-on-surface)', fontSize: '15px' }}
            />
          </div>
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <label className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '8px', display: 'block' }}>Pickup Time</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--rounded-md)', backgroundColor: 'var(--color-surface)' }}>
            <Clock size={20} color="var(--color-primary)" />
            <input 
              type="time" 
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', color: 'var(--color-on-surface)', fontSize: '15px' }}
            />
          </div>
        </div>
        <div style={{ flex: '1 1 240px' }}>
          <label className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '8px', display: 'block' }}>Contact Number</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--rounded-md)', backgroundColor: 'var(--color-surface)' }}>
            <Phone size={20} color="var(--color-primary)" />
            <input 
              type="tel" 
              placeholder="0912 345 6789"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', color: 'var(--color-on-surface)', fontSize: '15px' }}
            />
          </div>
        </div>
      </div>

      <h3 className="text-headline-sm" style={{ marginBottom: '16px' }}>Available Vehicles</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {vehicles.map((v) => (
          <div key={v.id} className="card shadow-level-1" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
            <div style={{ height: '200px', backgroundImage: `url(${v.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div className="text-headline-sm">{v.name}</div>
                <div className="text-headline-sm" style={{ color: 'var(--color-primary)' }}>{v.priceLabel}</div>
              </div>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>
                  <Key size={18} /> {v.type}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>
                  <Users size={18} /> {v.capacity} pax
                </div>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: 'auto', height: '48px' }}
                onClick={() => handleBookClick(v)}
              >
                Rent This Vehicle
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Prompt Modal */}
      {showBookingPrompt && selectedVehicle && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card shadow-level-3" style={{ width: '100%', maxWidth: '440px', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 className="text-headline-sm">Confirm Rental</h3>
              <button onClick={() => setShowBookingPrompt(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>✕</button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label className="text-label-sm" style={{ display: 'block', marginBottom: '8px' }}>Purpose of Rental</label>
              <select 
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--rounded)', border: '1px solid var(--color-outline)', backgroundColor: 'var(--color-surface)', fontSize: '16px', color: 'var(--color-on-surface)' }}
              >
                <option value="Tourism/Leisure">Tourism/Leisure</option>
                <option value="Business/Corporate">Business/Corporate</option>
                <option value="Airport Transfer">Airport Transfer</option>
                <option value="Event/Wedding">Event/Wedding</option>
                <option value="Personal Use">Personal Use</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="text-label-sm" style={{ display: 'block', marginBottom: '8px' }}>Duration (Days)</label>
              <input 
                type="number" 
                min="1" 
                max="30"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--rounded)', border: '1px solid var(--color-outline)', backgroundColor: 'var(--color-surface)', fontSize: '16px', color: 'var(--color-on-surface)' }}
              />
            </div>

            <div style={{ padding: '20px', backgroundColor: 'var(--color-surface-container-low)', borderRadius: 'var(--rounded-lg)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>Vehicle</span>
                <span className="text-label-lg">{selectedVehicle.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>Rate</span>
                <span className="text-label-lg">₱{selectedVehicle.price}/day</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>Pickup</span>
                <span className="text-label-lg">{pickupDate} @ {pickupTime}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', marginTop: '12px', borderTop: '1px solid var(--color-outline-variant)' }}>
                <span className="text-label-lg">Total Amount</span>
                <span className="text-headline-sm" style={{ color: 'var(--color-primary)' }}>₱{finalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn btn-secondary" style={{ flex: 1, height: '48px' }} onClick={() => setShowBookingPrompt(false)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 1, height: '48px' }} onClick={handleProceedToPayment}>Pay Now</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedVehicle && (
        <PaymentModal
          isOpen={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          amount={finalPrice}
          serviceLabel={`Vehicle Rental — ${selectedVehicle.name}`}
          serviceType="rental"
          details={{
            vehicle: selectedVehicle.name,
            purpose: purpose,
            duration: duration,
            pickupDate: pickupDate,
            pickupTime: pickupTime,
            contactNumber: contactNumber,
            pickup: 'Caraga Region (Self-Drive)'
          }}
        />
      )}

      <style jsx>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
