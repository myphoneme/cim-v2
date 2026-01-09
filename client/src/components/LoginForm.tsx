import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-onyx">
      <div className="bg-white dark:bg-slate-900 p-12 rounded-[2rem] shadow-2xl w-full max-w-md mx-4 border border-slate-200 dark:border-white/5">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-slate-900 dark:text-white font-black text-3xl tracking-tighter">PHONEME</span>
            <span className="text-brand-500 font-black text-3xl tracking-tighter">OPS</span>
          </div>
          <p className="text-[10px] uppercase font-black text-brand-500 tracking-widest">Master Control Portal</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm">
            <i className="fa-solid fa-circle-exclamation mr-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-3 tracking-widest">
              Email Address
            </label>
            <div className="relative">
              <i className="fa-solid fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-5 py-4 bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl focus:border-brand-500 dark:focus:border-brand-500 focus:outline-none text-slate-900 dark:text-white transition-all font-medium"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-3 tracking-widest">
              Password
            </label>
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-5 py-4 bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl focus:border-brand-500 dark:focus:border-brand-500 focus:outline-none text-slate-900 dark:text-white transition-all font-medium"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all pill-shadow disabled:shadow-none flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Authenticating...
              </>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket"></i>
                Access Portal
              </>
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-widest mt-8">
          PhoneMe Cloud Infrastructure
        </p>
      </div>
    </div>
  );
}
