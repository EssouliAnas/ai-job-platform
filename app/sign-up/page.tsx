'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToAuthSignUp() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/sign-up');
  }, [router]);

  return <div className="min-h-screen flex items-center justify-center">Redirecting to sign-up...</div>;
} 
