'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authenticateAdmin } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShieldAlert, KeyRound, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter a password');
      return;
    }

    setLoading(true);
    try {
      const success = await authenticateAdmin(password);
      if (success) {
        toast.success('Successfully authenticated!');
        router.push('/admin/dashboard');
      } else {
        toast.error('Invalid admin password. Try again.');
      }
    } catch (error) {
      toast.error('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black text-neutral-100 overflow-hidden font-sans">
      <div className="w-full max-w-md px-4 relative z-10">
        <Card className="rounded-2xl border border-white/5 bg-neutral-900/60 backdrop-blur-md shadow-2xl">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto w-12 h-12 rounded-full border border-neutral-600 bg-neutral-800 flex items-center justify-center text-neutral-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Admin Gate</CardTitle>
            <CardDescription className="text-neutral-400 font-light">
              Enter your administration password to edit the portfolio contents.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5 relative">
                <KeyRound className="absolute left-3 top-3.5 w-4 h-4 text-neutral-500" />
                <Input
                  type="password"
                  placeholder="Admin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-neutral-950 border-white/5 focus-visible:ring-neutral-500 rounded-xl"
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full rounded-xl bg-white text-black hover:bg-neutral-200 font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...
                  </>
                ) : (
                  'Access Dashboard'
                )}
              </Button>
              <Link href="/" className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors">
                Return to Portfolio
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
