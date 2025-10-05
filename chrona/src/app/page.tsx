'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    // Redirect based on authentication status
    if (status === 'authenticated') {
      router.push('/dashboard/space');
    } else {
      router.push('/launch');
    }
  }, [status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-space-bg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading Chrona...</p>
      </div>
    </div>
  );
}
