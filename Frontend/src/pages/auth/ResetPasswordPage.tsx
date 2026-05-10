import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button, Input } from "@/components/ui";
import toast from "react-hot-toast";
import { KeyRound, ArrowLeft, ShieldCheck } from "lucide-react";

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!password || !confirm) {
      toast.error("All fields are required");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "https://localhost:5001/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            newPassword: password,
          }),
        }
      );

      if (!res.ok) throw new Error();

      setSuccess(true);
      toast.success("Password reset successful!");
    } catch {
      toast.error("Invalid or expired link. Please request a new reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-4 md:p-12">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] shadow-2xl p-10 md:p-16 relative z-10 transition-all duration-500 hover:shadow-indigo-500/5">
        
        {success ? (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-100 dark:border-emerald-500/20">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Password Secured</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              Your account password has been successfully updated. You can now use your new password to access your dashboard.
            </p>
            <Button
              className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-gray-900 text-white rounded-xl py-3 font-bold text-base shadow-lg transition-transform hover:scale-105 active:scale-95"
              onClick={() => navigate("/login")}
            >
              Sign In Now
            </Button>
          </div>
        ) : (
          <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
              <KeyRound className="w-8 h-8" />
            </div>
            
            <h1 className="text-[1.75rem] font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Create new p assword</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              Your new password must be uniquely yours. Please enter a strong password with at least 6 characters.
            </p>

            <div className="flex flex-col gap-5 mb-8">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:ring-indigo-500 py-3 rounded-xl shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:ring-indigo-500 py-3 rounded-xl shadow-sm"
                />
              </div>
            </div>

            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold text-base shadow-lg shadow-indigo-500/25 transition-transform hover:scale-105 active:scale-95 mb-6"
              isLoading={loading}
              onClick={handleReset}
            >
              Reset Password
            </Button>

            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to log in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};