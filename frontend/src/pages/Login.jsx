import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiLock, FiLoader, FiCheckCircle, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation 1: Email required
    if (!email.trim()) {
      setError('Email Address is required.');
      return;
    }

    // Validation 2: Password required
    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        setSuccess('Success! Logging you in...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark text-text-darkPrimary flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-surface-darkBorder bg-surface-darkCard/40 shadow-2xl relative z-10">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-black font-extrabold shadow-lg shadow-primary/20 mb-3">
            <FiTrendingUp className="w-6 h-6 text-zinc-950" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">VoltAnalytics</h2>
          <p className="text-xs text-text-darkSecondary mt-1">Sign in to your analytics dashboard</p>
        </div>

        {/* Form Alerts */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 border border-secondary/20 bg-secondary/5 text-secondary rounded-xl text-xs font-semibold mb-5 animate-shake">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3.5 border border-primary/20 bg-primary/5 text-primary rounded-xl text-xs font-semibold mb-5">
            <FiCheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-text-darkSecondary">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-darkSecondary">
                <FiMail className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@gmail.com"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-darkBorder bg-background-dark/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-text-darkSecondary">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-darkSecondary">
                <FiLock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-darkBorder bg-background-dark/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover text-zinc-950 py-3 text-xs font-bold transition-all duration-200 mt-2 shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin text-zinc-950" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Register link */}
        <div className="text-center mt-6 text-xs text-text-darkSecondary font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline hover:text-primary-light">
            Register now
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
