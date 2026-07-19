"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-6 text-ivory">
      <div className="w-full max-w-md bg-[#1A1A1A] p-8 border border-dust/20 shadow-2xl rounded-sm">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-2">
            <Image src="/logo_no_slogan.png" alt="Flint & Copper" width={300} height={100} className="h-24 w-auto object-contain" />
          </div>
          <p className="uppercase tracking-widest text-xs text-dust">Admin Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 text-red-200 text-sm text-center rounded-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2 text-dust/80">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-dust/30 px-0 py-3 text-ivory focus:outline-none focus:border-copper transition-colors placeholder:text-dust/30"
              placeholder="admin@flintandcopper.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2 text-dust/80">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-dust/30 px-0 py-3 text-ivory focus:outline-none focus:border-copper transition-colors placeholder:text-dust/30"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 flex items-center justify-center gap-3 px-8 py-4 bg-copper text-ivory uppercase tracking-[0.2em] text-xs hover:bg-copper-deep transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <><Loader2 className="animate-spin" size={16} /> Authenticating...</>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
