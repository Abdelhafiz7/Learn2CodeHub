import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button, LoadingSpinner } from "@/components/ui";
import toast from "react-hot-toast";
import { MailCheck, XCircle } from "lucide-react";

export const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const hasVerified = useRef(false);

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    useEffect(() => {
        if (!token || hasVerified.current) {
            if (!token) setLoading(false);
            return;
        }
        hasVerified.current = true;

        const verify = async () => {
            try {
                const res = await fetch(
                    `https://localhost:5001/api/auth/verify-email?token=${token}`
                );

                if (!res.ok) throw new Error();

                setSuccess(true);
                toast.success("Email verified successfully!");
            } catch {
                setSuccess(false);
                toast.error("Invalid or expired link");
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [token]);

    const handleResend = async () => {
        try {
            if (!email) {
                toast.error("Email not found");
                return;
            }

            const res = await fetch(
                "https://localhost:5001/api/auth/resend-verification",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(email),
                }
            );

            if (!res.ok) throw new Error();

            toast.success("Verification email sent again!");
        } catch {
            toast.error("Failed to resend email");
        }
    };

    if (loading) {
        return (
            <div className="flex w-full items-center justify-center p-4 min-h-screen">
                <LoadingSpinner text="Verifying your email..." />
            </div>
        );
    }

    return (
        <div className="flex w-full items-center justify-center p-4 md:p-12">
            <div className="w-full max-w-2xl bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] shadow-2xl p-10 md:p-16 relative z-10 transition-all duration-500 hover:shadow-indigo-500/5 animate-in fade-in slide-in-from-bottom-4">
                
                {success ? (
                    <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-100 dark:border-emerald-500/20">
                            <MailCheck className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Email Verified Successfully!</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                            Thank you for verifying your email address. Your account is now active and secure. Please sign in to access your dashboard.
                        </p>
                        
                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold text-base shadow-lg shadow-indigo-500/25 transition-transform hover:scale-105 active:scale-95"
                            onClick={() => navigate("/login")}
                        >
                            Sign In to Your Account
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-6 shadow-inner border border-rose-100 dark:border-rose-500/20">
                            <XCircle className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Verification Failed</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                            The verification link you used is either invalid or has expired. If you need a new link, you can resend the verification email.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <Button
                                className="w-full sm:w-1/2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-gray-900 text-white rounded-xl py-3 font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
                                onClick={() => navigate("/")}
                            >
                                Go Home
                            </Button>

                            <Button
                                className="w-full sm:w-1/2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-3 font-bold shadow-lg shadow-rose-500/25 transition-transform hover:scale-105 active:scale-95"
                                onClick={handleResend}
                            >
                                Resend Email
                            </Button>
                        </div>
                    </div>
                )}
                
            </div>
        </div>
    );
};