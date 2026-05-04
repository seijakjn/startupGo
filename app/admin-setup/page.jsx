'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function AdminSetupPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    const promoteToAdmin = async () => {
      try {
        const response = await fetch('/api/user/role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'admin' })
        });

        if (response.ok) {
          // Force Clerk token to refresh so new metadata is loaded
          await user.reload();
          setStatus('success');
          setTimeout(() => router.push('/admin'), 1500);
        } else {
          setStatus('error');
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };

    promoteToAdmin();
  }, [isLoaded, isSignedIn, router, user]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '24px' }}>
      {status === 'processing' && (
        <>
          <Loader2 size={48} className="animate-spin" color="var(--color-primary)" style={{ marginBottom: '16px' }} />
          <h2 className="text-headline-md">Promoting Account...</h2>
          <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>Setting your role to Admin. Please wait.</p>
        </>
      )}
      
      {status === 'success' && (
        <>
          <ShieldCheck size={48} color="var(--color-primary)" style={{ marginBottom: '16px' }} />
          <h2 className="text-headline-md">Success!</h2>
          <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>You are now an Admin. Redirecting to dashboard...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <ShieldAlert size={48} color="var(--color-error)" style={{ marginBottom: '16px' }} />
          <h2 className="text-headline-md">Error</h2>
          <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '24px' }}>Failed to promote account.</p>
          <button onClick={() => router.push('/')} className="btn btn-secondary">Return Home</button>
        </>
      )}
    </div>
  );
}
