import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Briefcase, CheckCircle2, XCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks';
import type { RegisterRequest } from '@/types';
import toast from 'react-hot-toast';

interface FormData extends RegisterRequest {
  confirmPassword: string;
}

interface FormErrors extends Partial<FormData> { }

// Password rules matching backend RegisterDto exactly
const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter (a–z)', test: (p: string) => /[a-z]/.test(p) },
  { id: 'digit', label: 'One number (0–9)', test: (p: string) => /\d/.test(p) },
  { id: 'special', label: 'One special character (!@#$…)', test: (p: string) => /[\W_]/.test(p) },
];

function getStrengthInfo(password: string, passedCount: number) {
  if (!password) return { label: '', color: '', width: '0%' };
  if (passedCount <= 1) return { label: 'Weak', color: 'bg-red-500', width: '20%' };
  if (passedCount === 2) return { label: 'Fair', color: 'bg-orange-400', width: '40%' };
  if (passedCount === 3) return { label: 'Good', color: 'bg-yellow-400', width: '60%' };
  if (passedCount === 4) return { label: 'Strong', color: 'bg-blue-500', width: '80%' };
  return { label: 'Excellent', color: 'bg-green-500', width: '100%' };
}

export const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Evaluate every rule against the current password
  const ruleResults = useMemo(
    () => PASSWORD_RULES.map(rule => ({ ...rule, passed: rule.test(formData.password) })),
    [formData.password]
  );
  const passedCount = ruleResults.filter(r => r.passed).length;
  const allPassed = passedCount === PASSWORD_RULES.length;
  const strength = getStrengthInfo(formData.password, passedCount);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';

    const pw = formData.password;
    if (!pw) {
      newErrors.password = 'Password is required';
    } else if (pw.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(pw)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(pw)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/\d/.test(pw)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[\W_]/.test(pw)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const { confirmPassword, ...registerData } = formData;
      void confirmPassword;
      await register(registerData);
    } catch (err: any) {
      const data = err?.response?.data;
      if (typeof data === 'string' && data.length < 100) {
        toast.error(data);
      } else if (data?.message) {
        toast.error(data.message);
      } else if (data?.errors && Object.keys(data.errors).length > 0) {
        const firstErrorKey = Object.keys(data.errors)[0];
        toast.error(data.errors[firstErrorKey][0]);
      } else {
        toast.error('An error occurred during registration. Please try again.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-4 md:p-12">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] shadow-2xl p-10 md:p-16 relative z-10 transition-all duration-500 hover:shadow-indigo-500/5 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex flex-col mb-8">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Create your account</h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Start learning today — it's free</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="First Name"
              name="firstName"
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              leftIcon={<User className="h-4 w-4" />}
              required
              className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:ring-indigo-500 py-3 rounded-xl shadow-sm"
            />
            <Input
              label="Last Name"
              name="lastName"
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              required
              className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:ring-indigo-500 py-3 rounded-xl shadow-sm"
            />
          </div>

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

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">I want to join as</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Student Card */}
              <div
                onClick={() => setFormData(prev => ({ ...prev, role: 'Student' }))}
                className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${formData.role === 'Student'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-md'
                    : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#13151A] hover:border-indigo-300 dark:hover:border-indigo-500/50'
                  }`}
              >
                <div className={`p-2 rounded-lg shrink-0 transition-colors duration-300 ${formData.role === 'Student' ? 'bg-indigo-500 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className={`font-bold text-sm ${formData.role === 'Student' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>Student</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">I want to learn new skills</span>
                </div>
                {formData.role === 'Student' && (
                  <div className="absolute top-4 right-4 text-indigo-500 animate-in zoom-in duration-200">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Instructor Card */}
              <div
                onClick={() => setFormData(prev => ({ ...prev, role: 'Instructor' }))}
                className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${formData.role === 'Instructor'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-md'
                    : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#13151A] hover:border-indigo-300 dark:hover:border-indigo-500/50'
                  }`}
              >
                <div className={`p-2 rounded-lg shrink-0 transition-colors duration-300 ${formData.role === 'Instructor' ? 'bg-indigo-500 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className={`font-bold text-sm ${formData.role === 'Instructor' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>Instructor</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">I want to teach courses</span>
                </div>
                {formData.role === 'Instructor' && (
                  <div className="absolute top-4 right-4 text-indigo-500 animate-in zoom-in duration-200">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Password field + strength indicator */}
          <div className="flex flex-col gap-2">
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
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
              autoComplete="new-password"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:ring-indigo-500 py-3 rounded-xl shadow-sm"
            />

            {/* Strength bar — shown once the user starts typing */}
            {formData.password.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-1">
                <div className="flex items-center justify-between">
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <span className={`ml-3 text-xs font-semibold ${passedCount <= 1 ? 'text-red-500' :
                      passedCount === 2 ? 'text-orange-400' :
                        passedCount === 3 ? 'text-yellow-500' :
                          passedCount === 4 ? 'text-blue-500' : 'text-green-500'
                    }`}>
                    {strength.label}
                  </span>
                </div>

                {/* Rule checklist — shown while field is focused or not all rules pass */}
                {(passwordFocused || !allPassed) && (
                  <ul className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    {ruleResults.map(rule => (
                      <li key={rule.id} className="flex items-center gap-1.5 text-xs">
                        {rule.passed
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          : <XCircle className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" />}
                        <span className={rule.passed ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}>
                          {rule.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            required
            autoComplete="new-password"
            className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:ring-indigo-500 py-3 rounded-xl shadow-sm"
          />

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-2">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</a>.
          </p>

          <Button type="submit" isLoading={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold text-base shadow-lg shadow-indigo-500/25 transition-transform hover:scale-105 active:scale-95">
            Create Account
          </Button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};