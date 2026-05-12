import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { Button, LoadingSpinner } from "@/components/ui";
import { MailCheck, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export const ConfirmEmailChangePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const hasConfirmed = useRef(false);

    const token = searchParams.get("token");

    useEffect(() => {
        if (!token || hasConfirmed.current) {
            if (!token) setLoading(false);
            return;
        }
        hasConfirmed.current = true;

        const confirm = async () => {
            try {
                const res = await fetch(`https://localhost:5001/api/auth/confirm-email-change?token=${token}`);
                if (!res.ok) throw new Error("Failed to confirm");

                setSuccess(true);
                toast.success("Email updated successfully!");
            } catch {
                setSuccess(false);
                toast.error("Invalid or expired link");
            } finally {
                setLoading(false);
            }
        };

        confirm();
    }, [token]);

    const handleReturn = () => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (user.role === "Admin") navigate("/admin/profile");
        else if (user.role === "Instructor") navigate("/instructor/profile");
        else navigate("/student/profile");
    };

    if (loading) {
        return (
            <div className="flex w-full items-center justify-center p-4 min-h-screen">
                <LoadingSpinner text="Updating your email..." />
            </div>
        );
    }

    return (
        <div className="flex w-full items-center justify-center p-4 md:p-12 min-h-[calc(100vh-64px)]">
            <div className="w-full max-w-2xl bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] shadow-2xl p-10 md:p-16 relative z-10 transition-all duration-500 hover:shadow-indigo-500/5 animate-in fade-in slide-in-from-bottom-4">

                {success ? (
                    <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-100 dark:border-emerald-500/20">
                            <MailCheck className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Email Updated!</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                            Your email address has been successfully updated. Your account is now secured with your new email.
                        </p>

                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold text-base shadow-lg shadow-indigo-500/25 transition-transform hover:scale-105 active:scale-95"
                            onClick={handleReturn}
                        >
                            Return to Profile
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-6 shadow-inner border border-rose-100 dark:border-rose-500/20">
                            <XCircle className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Update Failed</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                            The email update link you used is either invalid or has expired. Please try requesting a new email change from your profile.
                        </p>

                        <Button
                            className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-gray-900 text-white rounded-xl py-3 font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
                            onClick={handleReturn}
                        >
                            Back to Profile
                        </Button>
                    </div>
                )}

            </div>
        </div>
    );
};