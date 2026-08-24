'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          redirect: false,
          csrfToken: await getCsrfToken(),
        }),
      });

      if (res.ok || res.redirected) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Invalid email or password');
      }
    } catch {
      // Fallback: direct credential POST
      try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        const csrfRes = await fetch('/api/auth/csrf');
        const { csrfToken } = await csrfRes.json();
        formData.append('csrfToken', csrfToken);
        formData.append('callbackUrl', '/dashboard');
        formData.append('json', 'true');

        const signInRes = await fetch('/api/auth/callback/credentials', {
          method: 'POST',
          body: formData,
        });

        if (signInRes.ok) {
          router.push('/dashboard');
          router.refresh();
        } else {
          setError('Invalid email or password');
        }
      } catch {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[#0B1C30] text-lg">GrammarFlow</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#0B1C30]">Welcome back</h1>
          <p className="text-sm text-[#76777D] mt-1">Sign in to continue your learning journey</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#45464D] mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#45464D] mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="input-field pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76777D] hover:text-[#0B1C30]"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-[#76777D] mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#4F46E5] font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-center mt-4">
          <Link href="/dashboard" className="text-sm text-[#76777D] hover:text-[#4F46E5]">
            Continue as guest →
          </Link>
        </p>
      </div>
    </div>
  );
}

async function getCsrfToken(): Promise<string> {
  try {
    const res = await fetch('/api/auth/csrf');
    const data = await res.json();
    return data.csrfToken || '';
  } catch {
    return '';
  }
}
