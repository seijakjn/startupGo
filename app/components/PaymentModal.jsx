'use client';
import React, { useState, useEffect } from 'react';
import { X, Banknote, CreditCard, Wallet, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../lib/supabase';

export default function PaymentModal({ isOpen, onClose, amount, serviceLabel, serviceType = 'fetch_me', details = {} }) {
  const { user } = useUser();
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [step, setStep] = useState('select'); // 'select' | 'processing' | 'success' | 'error'
  const [walletBalance, setWalletBalance] = useState(0);

  // Fetch real balance when modal opens
  useEffect(() => {
    if (isOpen && user) {
      const fetchBalance = async () => {
        const { data, error } = await supabase.rpc('get_or_create_wallet', { target_user_id: user.id });
        if (!error) {
          setWalletBalance(data);
          // Default to wallet if balance is sufficient
          if (data >= amount) {
            setSelectedMethod('wallet');
          }
        }
      };
      fetchBalance();
    }
  }, [isOpen, user, amount]);

  // Reset state when modal reopens
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const insufficientWallet = selectedMethod === 'wallet' && walletBalance < amount;

  const handlePay = async () => {
    if (insufficientWallet) return;
    setStep('processing');
    
    try {
      if (user) {
        // 1. If wallet, perform deduction BEFORE creating the job
        if (selectedMethod === 'wallet') {
          console.log('Deducting from wallet:', amount);
          const { data: newBalance, error: balanceError } = await supabase.rpc('increment_wallet', { 
            target_user_id: user.id, 
            amount: -Number(amount) 
          });
          
          if (balanceError) {
            console.error('Wallet deduction error:', balanceError);
            throw new Error('Wallet deduction failed: ' + balanceError.message);
          }

          // Record transaction record
          const { error: txError } = await supabase.from('transactions').insert({
            user_id: user.id,
            amount: -Number(amount),
            type: 'payment',
            description: `Payment for ${serviceLabel}`
          });
          
          if (txError) console.error('Transaction record error:', txError);
        }

        // 2. Insert job into Supabase
        const { error: jobError } = await supabase.from('jobs').insert({
          user_id: user.id,
          type: serviceType,
          status: 'pending',
          details: { ...details, amount: Number(amount), title: serviceLabel, method: selectedMethod }
        });
        
        if (jobError) {
          console.error('Job insertion error:', jobError);
          throw jobError;
        }
      }
      setStep('success');
    } catch (error) {
      console.error('CRITICAL: Payment flow error:', error);
      alert('Failed to process booking: ' + (error.message || 'Please check your connection.'));
      setStep('select');
    }
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
      sublabel: `Balance: ₱${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: Wallet,
      color: 'var(--color-primary)',
    },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 9998 }} />

      <div style={{
          position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
          width: '100%', maxWidth: '420px', backgroundColor: 'var(--color-surface-container-lowest)',
          borderRadius: 'var(--rounded-xl)', boxShadow: '0 24px 80px rgba(0,0,0,0.3)', zIndex: 9999, overflow: 'hidden',
        }}
      >
        {step === 'select' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--color-surface-container-highest)' }}>
              <div>
                <div className="text-headline-sm">Choose Payment</div>
                <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>{serviceLabel}</div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-on-surface-variant)', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ margin: '16px 24px', padding: '16px 20px', background: 'linear-gradient(135deg, var(--color-primary-container), var(--color-primary))', borderRadius: 'var(--rounded-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="text-body-sm" style={{ color: 'var(--color-on-primary-container)', opacity: 0.85 }}>Total Amount</div>
              <div className="text-headline-md" style={{ color: 'white', letterSpacing: '-0.02em' }}>₱{Number(amount).toFixed(2)}</div>
            </div>

            <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {methods.map((m) => {
                const Icon = m.icon;
                const isSelected = selectedMethod === m.id;
                return (
                  <button key={m.id} onClick={() => setSelectedMethod(m.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: 'var(--rounded-lg)',
                      border: isSelected ? `2px solid var(--color-primary)` : '2px solid var(--color-surface-container-highest)',
                      backgroundColor: isSelected ? 'var(--color-surface-container-low)' : 'transparent',
                      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', width: '100%',
                    }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--rounded)', backgroundColor: isSelected ? `${m.color}20` : 'var(--color-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} color={isSelected ? m.color : 'var(--color-on-surface-variant)'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="text-label-lg" style={{ color: 'var(--color-on-surface)' }}>{m.label}</div>
                      <div className="text-body-sm" style={{ color: m.id === 'wallet' && insufficientWallet ? 'var(--color-error)' : 'var(--color-on-surface-variant)', marginTop: '2px' }}>{m.sublabel}</div>
                    </div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: isSelected ? 'none' : '2px solid var(--color-outline)', backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent' }} />
                  </button>
                );
              })}
            </div>

            {insufficientWallet && (
              <div style={{ margin: '10px 24px 0', padding: '10px 14px', backgroundColor: 'var(--color-error-container)', borderRadius: 'var(--rounded)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} color="var(--color-error)" />
                <span className="text-body-sm" style={{ color: 'var(--color-error)' }}>Insufficient balance. Top up your wallet first.</span>
              </div>
            )}

            <div style={{ padding: '20px 24px 24px' }}>
              <button onClick={handlePay} disabled={insufficientWallet} className="btn btn-primary" style={{ width: '100%', height: '52px', fontSize: '16px', opacity: insufficientWallet ? 0.5 : 1 }}>
                {selectedMethod === 'cash' ? 'Confirm Booking' : `Pay ₱${Number(amount).toFixed(2)}`}
              </button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Loader2 size={32} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
            <div className="text-headline-sm">Processing...</div>
          </div>
        )}

        {step === 'success' && (
          <div style={{ padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
            <CheckCircle2 size={40} color="#16a34a" />
            <div className="text-headline-sm">Confirmed!</div>
            <button onClick={onClose} className="btn btn-primary" style={{ marginTop: '16px', width: '100%', height: '52px' }}>Done</button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </>
  );
}
