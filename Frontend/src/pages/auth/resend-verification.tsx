import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui";
import toast from "react-hot-toast";
import { MailWarning, MailCheck, ArrowLeft } from "lucide-react";

export const ResendVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      await fetch("https://localhost:5001/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email),
      });
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-4 md:p-12">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] shadow-2xl p-10 md:p-16 relative z-10 transition-all duration-500 hover:shadow-indigo-500/5 animate-in fade-in slide-in-from-bottom-4">

        {!sent ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-amber-100 dark:border-amber-500/20">
              <MailWarning className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">Email Not Verified</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              Your account with the email <strong>{email}</strong> has not been verified yet. You need to verify your email address before you can sign in.
            </p>

            <Button
              className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-3 font-bold text-base shadow-lg shadow-amber-500/25 transition-transform hover:scale-105 active:scale-95 mb-6"
              onClick={handleResend}
              isLoading={loading}
            >
              Resend Verification Email
            </Button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to log in
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-100 dark:border-emerald-500/20">
              <MailCheck className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Check your inbox</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              We have sent a new verification link to <strong>{email}</strong>. Please check your inbox and spam folders to verify your account.
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