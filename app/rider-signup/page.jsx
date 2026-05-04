'use client';
import React, { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { Car, Utensils, Package, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RiderSignupPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { openSignUp } = useClerk();
  const router = useRouter();

  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-redirect if already a rider
  React.useEffect(() => {
    if (isLoaded && isSignedIn && user.publicMetadata?.role === 'rider') {
      router.push('/rider');
    }
  }, [isLoaded, isSignedIn, user?.publicMetadata?.role, router]);

  const categories = [
    { id: 'fetch_me', label: 'Fetch Me Driver', icon: Car, color: 'var(--color-primary)' },
    { id: 'food', label: 'Food Delivery Rider', icon: Utensils, color: '#f59e0b' },
    { id: 'parcel', label: 'Parcel Courier', icon: Package, color: '#3b82f6' },
  ];

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader2 size={32} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // If not signed in, show landing page to prompt sign-up
  if (!isSignedIn) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '0 24px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '24px',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-container))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
          boxShadow: '0 12px 32px rgba(52,211,153,0.3)',
        }}>
          <Car size={40} color="white" />
        </div>
        <h1 className="text-headline-lg" style={{ marginBottom: '16px' }}>Drive with Butuan Go</h1>
        <p className="text-body-lg" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '40px' }}>
          Turn your spare time into earnings. Join our fleet of drivers and riders delivering smiles across Butuan City.
        </p>

        <div style={{ display: 'grid', gap: '16px', marginBottom: '48px', textAlign: 'left' }}>
          <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-on-primary-container)' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-label-lg">Flexible Hours</div>
              <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Be your own boss and work when you want.</div>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-on-primary-container)' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-label-lg">Instant Earnings</div>
              <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Track your income easily and cash out fast.</div>
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', height: '56px', fontSize: '18px' }}
          onClick={() => openSignUp({ forceRedirectUrl: '/rider-signup' })}
        >
          Sign Up to Drive
        </button>
      </div>
    );
  }

  // If signed in, show category selection
  const handleCompleteSetup = async () => {
    if (!selectedSubcategory) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/user/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'rider', subcategory: selectedSubcategory }),
      });

      if (!res.ok) throw new Error('Failed to update role');

      // Small delay to allow Clerk metadata to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reload user to ensure Clerk sees the new metadata
      await user.reload();
      
      // Force redirect
      window.location.href = '/rider';
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      alert('There was an issue setting up your account. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 24px' }}>
      <h1 className="text-headline-lg" style={{ marginBottom: '8px' }}>Welcome, {user.firstName}!</h1>
      <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '32px' }}>
        What kind of deliveries do you want to do? You can change this later.
      </p>

      <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedSubcategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedSubcategory(cat.id)}
              className="card shadow-level-1"
              style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
                border: isSelected ? `2px solid var(--color-primary)` : '2px solid transparent',
                backgroundColor: isSelected ? 'var(--color-surface-container-low)' : 'var(--color-surface)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                backgroundColor: `${cat.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={28} color={cat.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="text-label-lg" style={{ fontSize: '18px', marginBottom: '4px' }}>{cat.label}</div>
                <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                  {cat.id === 'fetch_me' && 'Drive passengers to their destinations.'}
                  {cat.id === 'food' && 'Deliver hot meals from local restaurants.'}
                  {cat.id === 'parcel' && 'Transport packages across the city.'}
                </div>
              </div>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                border: isSelected ? 'none' : '2px solid var(--color-outline)',
                backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isSelected && <CheckCircle2 size={16} color="white" />}
              </div>
            </button>
          );
        })}
      </div>

      <button
        className="btn btn-primary"
        style={{ width: '100%', height: '56px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        disabled={!selectedSubcategory || isSubmitting}
        onClick={handleCompleteSetup}
      >
        {isSubmitting ? (
          <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Setting up your profile...</>
        ) : (
          <>Continue to Dashboard <ArrowRight size={20} /></>
        )}
      </button>

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}
