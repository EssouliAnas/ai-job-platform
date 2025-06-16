'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToAuthSignIn() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/sign-in');
  }, [router]);

  return <div className="min-h-screen flex items-center justify-center">Redirecting to sign-in...</div>;
} 
