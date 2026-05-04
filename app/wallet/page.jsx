'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../lib/supabase';
import { Plus, ArrowDownLeft, ArrowUpRight, ShieldCheck, History, Loader2 } from 'lucide-react';

export default function WalletPage() {
  const { user, isLoaded } = useUser();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchWalletData();
    }
  }, [isLoaded, user]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      // Use the function we created to get or create wallet
      const { data: balanceData, error: balanceError } = await supabase
        .rpc('get_or_create_wallet', { target_user_id: user.id });
      
      if (balanceError) throw balanceError;
      setBalance(balanceData);

      // Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (txError) throw txError;
      setTransactions(txData || []);
    } catch (err) {
      console.error('Error fetching wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async (e) => {
    e.preventDefault();
    const amount = parseFloat(topupAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsSubmitting(true);
    try {
      // 1. Update wallet balance
      const { error: balanceError } = await supabase.rpc('increment_wallet', { 
        target_user_id: user.id, 
        amount: amount 
      });
      
      if (balanceError) {
        // Fallback if RPC doesn't exist yet (we'll add it)
        const { data: currentWallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();
        
        await supabase
          .from('wallets')
          .update({ balance: (currentWallet?.balance || 0) + amount })
          .eq('user_id', user.id);
      }

      // 2. Record transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        amount: amount,
        type: 'topup',
        description: 'Wallet Top-up'
      });

      setTopupAmount('');
      setShowTopup(false);
      fetchWalletData();
    } catch (err) {
      console.error('Topup error:', err);
      alert('Failed to process top-up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={32} color="var(--color-primary)" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 16px' }}>
      <h2 className="text-headline-md" style={{ marginBottom: '24px' }}>Butuan Go Wallet</h2>

      <div style={{ 
        background: 'linear-gradient(135deg, var(--color-inverse-surface) 0%, #0f172a 100%)',
        borderRadius: 'var(--rounded-xl)',
        padding: 'clamp(20px, 5vw, 32px)',
        color: 'white',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div className="text-body-sm" style={{ opacity: 0.8, marginBottom: '8px' }}>Available Balance</div>
            <div className="text-headline-lg" style={{ fontSize: 'clamp(32px, 8vw, 40px)', letterSpacing: '-0.03em' }}>
              ₱{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowTopup(true)}
              style={{ flex: 1, gap: '8px', height: '48px' }}
            >
              <Plus size={20} /> Top Up
            </button>
          </div>
        </div>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', opacity: 0.3 }} />
      </div>

      {showTopup && (
        <div className="card shadow-level-2" style={{ marginBottom: '32px', padding: '24px', animation: 'slideDown 0.3s ease-out' }}>
          <h3 className="text-label-lg" style={{ marginBottom: '16px' }}>Enter Top-up Amount</h3>
          <form onSubmit={handleTopup} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-variant)' }}>₱</span>
              <input 
                type="number" 
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                style={{ 
                  width: '100%', padding: '12px 12px 12px 28px', borderRadius: 'var(--rounded)', 
                  border: '1px solid var(--color-outline)', backgroundColor: 'var(--color-surface)',
                  fontSize: '16px', color: 'var(--color-on-surface)'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', flex: '1 1 200px' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmitting || !topupAmount}
                style={{ flex: 1, height: '48px' }}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Confirm'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowTopup(false)}
                style={{ flex: 1, height: '48px' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: '16px', backgroundColor: 'var(--color-surface-container-low)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-primary-container)' }}>
        <ShieldCheck size={24} color="var(--color-primary)" />
        <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
          Your transactions are secure and encrypted.
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="text-headline-sm">Recent Transactions</h3>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <History size={16} /> View All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-on-surface-variant)', fontStyle: 'italic' }}>
            No transaction history yet.
          </div>
        ) : (
          transactions.map(tx => (
            <div key={tx.id} className="card" style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '50%', 
                backgroundColor: tx.type === 'topup' || tx.type === 'earning' ? 'var(--color-surface-container-high)' : 'var(--color-error-container)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginRight: '16px'
              }}>
                {tx.type === 'topup' || tx.type === 'earning' ? 
                  <ArrowDownLeft size={20} color="var(--color-primary)" /> : 
                  <ArrowUpRight size={20} color="var(--color-error)" />
                }
              </div>
              <div style={{ flex: 1 }}>
                <div className="text-label-lg">{tx.description}</div>
                <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                  {new Date(tx.created_at).toLocaleDateString()} at {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="text-label-lg" style={{ color: tx.type === 'topup' || tx.type === 'earning' ? 'var(--color-primary)' : 'var(--color-on-surface)' }}>
                {tx.type === 'topup' || tx.type === 'earning' ? '+' : '-'}₱{Math.abs(tx.amount).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
