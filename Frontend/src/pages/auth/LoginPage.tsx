import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks';
import type { LoginRequest } from '@/types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginRequest>>({});
  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: Partial<LoginRequest> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!validate()) return;

    try {
      await login(formData);
    } catch (err: any) {
      const data = err?.response?.data;
      const message = typeof data === 'string' ? data : data?.message;

      if (message === "Email not verified") {
        navigate(`/resend-verification?email=${encodeURIComponent(data.email)}`);
        return;
      }

      if (message?.includes('deactivated')) {
        toast.error('Your account has been deactivated. Please contact support.', {
          duration: 6000,
          icon: '🚫',
        });
        return;
      }

      toast.error("Invalid email or password");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginRequest]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-4 md:p-12">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] shadow-2xl p-10 md:p-16 relative z-10 transition-all duration-500 hover:shadow-indigo-500/5 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex flex-col mb-8">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome back</h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Sign in to continue your learning journey</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            leftIcon={<Mail className="h-4 w-4" />}
            required
            autoComplete="email"
            className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:ring-indigo-500 py-3 rounded-xl shadow-sm"
          />

          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            required
            autoComplete="current-password"
            className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:ring-indigo-500 py-3 rounded-xl shadow-sm"
          />

          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-[#13151A] text-indigo-600 focus:ring-indigo-500"
              />
              Remember me
            </label>

            <Link
              to="/forgot-password"
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold text-base shadow-lg shadow-indigo-500/25 transition-transform hover:scale-105 active:scale-95">
            Sign In
          </Button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
            Create one for free
          </Link>
        </p>
      </div>
    </div>
  );
};
