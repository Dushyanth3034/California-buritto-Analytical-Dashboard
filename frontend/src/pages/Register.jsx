import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiMail, FiLock, FiLoader, FiCheckCircle, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';

// Email regex pattern meeting the user specifications
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Validation: Full Name required
    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    // 2. Validation: Email Validation
    if (!email.trim()) {
      setError('Email Address is required.');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // 3. Validation: Password min 8 characters
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    // 4. Validation: Confirm Password match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(fullName, email, password, confirmPassword);
      if (result.success) {
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-black font-extrabold shadow-lg shadow-primary/20 mb-3 animate-pulse">
            <FiTrendingUp className="w-6 h-6 text-zinc-950" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Create an Account</h2>
          <p className="text-xs text-text-darkSecondary mt-1">Get started with VoltAnalytics dashboard</p>
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Full Name input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-text-darkSecondary">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-darkSecondary">
                <FiUser className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-darkBorder bg-background-dark/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
              />
            </div>
          </div>

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
                placeholder="Min. 8 characters"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-darkBorder bg-background-dark/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Confirm Password input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-text-darkSecondary">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-darkSecondary">
                <FiLock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
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
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Register</span>
            )}
          </button>
        </form>

        {/* Login Page Footer link */}
        <div className="text-center mt-6 text-xs text-text-darkSecondary font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline hover:text-primary-light">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
