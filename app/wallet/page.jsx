import React from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, ShieldCheck, History } from 'lucide-react';

export default function WalletPage() {
  const transactions = [
    { id: 1, title: 'Fetch Me Ride', date: 'Today, 2:30 PM', amount: '-₱85.00', type: 'expense' },
    { id: 2, title: 'Wallet Top-up', date: 'Yesterday, 10:00 AM', amount: '+₱500.00', type: 'income' },
    { id: 3, title: 'Food Delivery - Jollibee', date: 'May 1, 1:15 PM', amount: '-₱320.00', type: 'expense' },
  ];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="text-headline-md" style={{ marginBottom: '24px' }}>Butuan Go Wallet</h2>

      <div style={{ 
        background: 'linear-gradient(135deg, var(--color-inverse-surface) 0%, #0f172a 100%)',
        borderRadius: 'var(--rounded-xl)',
        padding: '32px',
        color: 'white',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div className="text-body-sm" style={{ opacity: 0.8, marginBottom: '8px' }}>Available Balance</div>
            <div className="text-headline-lg" style={{ fontSize: '40px', letterSpacing: '-0.03em' }}>₱1,250.00</div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn btn-primary" style={{ flex: 1, gap: '8px' }}>
              <Plus size={20} /> Top Up
            </button>
            <button className="btn" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', gap: '8px', border: 'none', cursor: 'pointer' }}>
              <ArrowUpRight size={20} /> Transfer
            </button>
          </div>
        </div>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', opacity: 0.3 }} />
      </div>

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
        {transactions.map(tx => (
          <div key={tx.id} className="card" style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              backgroundColor: tx.type === 'income' ? 'var(--color-surface-container-high)' : 'var(--color-error-container)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginRight: '16px'
            }}>
              {tx.type === 'income' ? <ArrowDownLeft size={20} color="var(--color-primary)" /> : <ArrowUpRight size={20} color="var(--color-error)" />}
            </div>
            <div style={{ flex: 1 }}>
              <div className="text-label-lg">{tx.title}</div>
              <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{tx.date}</div>
            </div>
            <div className="text-label-lg" style={{ color: tx.type === 'income' ? 'var(--color-primary)' : 'var(--color-on-surface)' }}>
              {tx.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
