import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input } from "@/components/ui";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, MailCheck } from "lucide-react";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      setLoading(true);

      await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(email),
      });

      setSent(true);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-4 md:p-12">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] shadow-2xl p-10 md:p-16 relative z-10 transition-all duration-500 hover:shadow-indigo-500/5 animate-in fade-in slide-in-from-bottom-4">

        {!sent ? (
          <div className="flex flex-col">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
              <Mail className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">Forgot your password?</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              No worries! Enter the email address associated with your account, and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <Input
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:ring-indigo-500 py-3 rounded-xl shadow-sm"
              />

              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold text-base shadow-lg shadow-indigo-500/25 transition-transform hover:scale-105 active:scale-95 mb-6"
                isLoading={loading}
                onClick={() => handleSubmit()}
                type="button"
              >
                Send Reset Link
              </Button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to log in
              </Link>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-100 dark:border-emerald-500/20">
              <MailCheck className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Check your email</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              We have sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folders.
            </p>
            <Link to="/login" className="w-full">
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-gray-900 text-white rounded-xl py-3 font-bold text-base shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                Return to log in
              </Button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};