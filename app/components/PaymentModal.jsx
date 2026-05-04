'use client';
import React, { useState, useEffect } from 'react';
import { X, Banknote, CreditCard, Wallet, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../lib/supabase';

const WALLET_BALANCE = 1250.00; // TODO: pull from Supabase/global state

export default function PaymentModal({ isOpen, onClose, amount, serviceLabel, serviceType = 'fetch_me', details = {} }) {
  const { user } = useUser();
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [step, setStep] = useState('select'); // 'select' | 'processing' | 'success' | 'error'

  // Reset state when modal reopens
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('cash');
      setStep('select');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
    }
  }, [isOpen]);

  // Trap focus & close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const insufficientWallet = selectedMethod === 'wallet' && WALLET_BALANCE < amount;

  const handlePay = async () => {
    if (insufficientWallet) return;
    setStep('processing');
    
    try {
      if (user) {
        // Insert into Supabase
        const { error } = await supabase.from('jobs').insert({
          user_id: user.id,
          type: serviceType,
          status: 'pending',
          details: { ...details, amount, title: serviceLabel, method: selectedMethod }
        });
        if (error) throw error;
      } else {
        // Simulate network call if not signed in (for testing without auth)
        await new Promise(r => setTimeout(r, 1800));
      }
      setStep('success');
    } catch (error) {
      console.error('Error inserting job:', error);
      alert('Failed to process booking. Please try again.');
      setStep('select');
    }
  };

  const formatCard = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const methods = [
    {
      id: 'cash',
      label: 'Cash on Delivery',
      sublabel: 'Pay in cash when your service arrives',
      icon: Banknote,
      color: '#16a34a',
    },
    {
      id: 'card',
      label: 'Debit / Credit Card',
      sublabel: 'Visa, Mastercard, GCash QR',
      icon: CreditCard,
      color: '#2563eb',
    },
    {
      id: 'wallet',
      label: 'Butuan Go Wallet',
      sublabel: `Balance: ₱${WALLET_BALANCE.toFixed(2)}`,
      icon: Wallet,
      color: 'var(--color-primary)',
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%', maxWidth: '420px',
          backgroundColor: 'var(--color-surface-container-lowest)',
          borderRadius: 'var(--rounded-xl)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
          zIndex: 9999,
          animation: 'slideUp 0.25s cubic-bezier(0.16,1,0.3,1)',
          overflow: 'hidden',
        }}
      >
        {step === 'select' && (
          <>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px 16px',
              borderBottom: '1px solid var(--color-surface-container-highest)',
            }}>
              <div>
                <div className="text-headline-sm">Choose Payment</div>
                <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
                  {serviceLabel}
                </div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-on-surface-variant)', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            {/* Amount banner */}
            <div style={{
              margin: '16px 24px',
              padding: '16px 20px',
              background: 'linear-gradient(135deg, var(--color-primary-container), var(--color-primary))',
              borderRadius: 'var(--rounded-lg)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div className="text-body-sm" style={{ color: 'var(--color-on-primary-container)', opacity: 0.85 }}>Total Amount</div>
              <div className="text-headline-md" style={{ color: 'white', letterSpacing: '-0.02em' }}>₱{amount.toFixed(2)}</div>
            </div>

            {/* Payment methods */}
            <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {methods.map((m) => {
                const Icon = m.icon;
                const isSelected = selectedMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '14px 16px',
                      borderRadius: 'var(--rounded-lg)',
                      border: isSelected ? `2px solid var(--color-primary)` : '2px solid var(--color-surface-container-highest)',
                      backgroundColor: isSelected ? 'var(--color-surface-container-low)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <div style={{
                      width: '44px', height: '44px', borderRadius: 'var(--rounded)',
                      backgroundColor: isSelected ? `${m.color}20` : 'var(--color-surface-container)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'background-color 0.15s',
                    }}>
                      <Icon size={22} color={isSelected ? m.color : 'var(--color-on-surface-variant)'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="text-label-lg" style={{ color: 'var(--color-on-surface)' }}>{m.label}</div>
                      <div className="text-body-sm" style={{ color: m.id === 'wallet' && insufficientWallet ? 'var(--color-error)' : 'var(--color-on-surface-variant)', marginTop: '2px' }}>
                        {m.sublabel}
                      </div>
                    </div>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      border: isSelected ? 'none' : '2px solid var(--color-outline)',
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                      flexShrink: 0,
                      transition: 'all 0.15s',
                    }} />
                  </button>
                );
              })}
            </div>

            {/* Card fields */}
            {selectedMethod === 'card' && (
              <div style={{ margin: '14px 24px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCard(e.target.value))}
                    style={{
                      width: '100%', padding: '11px 14px',
                      border: '1px solid var(--color-outline-variant)',
                      borderRadius: 'var(--rounded)', outline: 'none',
                      background: 'var(--color-surface-container-low)',
                      fontSize: '14px', letterSpacing: '0.05em',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                    style={{
                      flex: 1, padding: '11px 14px',
                      border: '1px solid var(--color-outline-variant)',
                      borderRadius: 'var(--rounded)', outline: 'none',
                      background: 'var(--color-surface-container-low)',
                      fontSize: '14px',
                    }}
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    style={{
                      width: '90px', padding: '11px 14px',
                      border: '1px solid var(--color-outline-variant)',
                      borderRadius: 'var(--rounded)', outline: 'none',
                      background: 'var(--color-surface-container-low)',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Wallet insufficient */}
            {insufficientWallet && (
              <div style={{
                margin: '10px 24px 0',
                padding: '10px 14px',
                backgroundColor: 'var(--color-error-container)',
                borderRadius: 'var(--rounded)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <AlertCircle size={16} color="var(--color-error)" />
                <span className="text-body-sm" style={{ color: 'var(--color-error)' }}>
                  Insufficient balance. Top up your wallet first.
                </span>
              </div>
            )}

            {/* Action */}
            <div style={{ padding: '20px 24px 24px' }}>
              <button
                onClick={handlePay}
                disabled={insufficientWallet || (selectedMethod === 'card' && (cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3))}
                className="btn btn-primary"
                style={{ width: '100%', height: '52px', fontSize: '16px', opacity: (insufficientWallet || (selectedMethod === 'card' && (cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3))) ? 0.5 : 1 }}
              >
                {selectedMethod === 'cash' ? 'Confirm Booking' : `Pay ₱${amount.toFixed(2)}`}
              </button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={32} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <div className="text-headline-sm">Processing Payment...</div>
            <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Please wait a moment.</div>
          </div>
        )}

        {step === 'success' && (
          <div style={{ padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
              <CheckCircle2 size={40} color="#16a34a" />
            </div>
            <div className="text-headline-sm">Booking Confirmed!</div>
            <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', maxWidth: '280px' }}>
              Your {serviceLabel} has been booked successfully. You will receive a confirmation shortly.
            </div>
            <div className="chip" style={{ marginTop: '8px', padding: '8px 16px' }}>
              ₱{amount.toFixed(2)} via {methods.find(m => m.id === selectedMethod)?.label}
            </div>
            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ marginTop: '16px', width: '100%', height: '52px' }}
            >
              Done
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)) } to { opacity: 1; transform: translate(-50%, -50%) } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </>
  );
}
