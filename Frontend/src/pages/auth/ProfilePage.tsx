import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store";
import { Button, Input } from "@/components/ui";
import toast from "react-hot-toast";
import { authApi } from "@/api";
import { User, Shield, Image as ImageIcon, Lock, Save, Link2, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { uploadToCloudinary } from "@/api/cloudinary";
import { useMemo } from "react";

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

type Tab = "profile" | "photo" | "security";

// SVG Social Icons
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const ProfilePage: React.FC = () => {
  const { user, setAuth } = useAuthStore();
  const isInstructor = user?.role === "Instructor";
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImageUrl || "");
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [major, setMajor] = useState(user?.major || "");

  // Social links state (instructor only)
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || "");
  const [twitterUrl, setTwitterUrl] = useState(user?.twitterUrl || "");
  const [linkedInUrl, setLinkedInUrl] = useState(user?.linkedInUrl || "");
  const [youtubeUrl, setYoutubeUrl] = useState(user?.youtubeUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(user?.websiteUrl || "");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setBio(user.bio || "");
      setMajor(user.major || "");
      setGithubUrl(user.githubUrl || "");
      setTwitterUrl(user.twitterUrl || "");
      setLinkedInUrl(user.linkedInUrl || "");
      setYoutubeUrl(user.youtubeUrl || "");
      setWebsiteUrl(user.websiteUrl || "");
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const payload: any = {
        firstName,
        lastName,
        bio,
        profileImageUrl,
      };

      // Only include social links for instructors
      if (isInstructor) {
        payload.major = major;
        payload.githubUrl = githubUrl;
        payload.twitterUrl = twitterUrl;
        payload.linkedInUrl = linkedInUrl;
        payload.youtubeUrl = youtubeUrl;
        payload.websiteUrl = websiteUrl;
      }

      const updated = await authApi.updateProfile(payload);
      setAuth({ ...user!, ...updated }, localStorage.getItem("token")!);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const url = await uploadToCloudinary(file);
      setProfileImageUrl(url);
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    try {
      setLoading(true);
      await authApi.requestEmailChange(newEmail);
      toast.success("Check your new email to confirm");
      setNewEmail("");
    } catch (err: any) {
      toast.error(err.response?.data || "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  // Password Strength Logic
  const ruleResults = useMemo(
    () => PASSWORD_RULES.map(rule => ({ ...rule, passed: rule.test(newPassword) })),
    [newPassword]
  );
  const passedCount = ruleResults.filter(r => r.passed).length;
  const allPassed = passedCount === PASSWORD_RULES.length;
  const strength = getStrengthInfo(newPassword, passedCount);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!allPassed) {
      toast.error("Please meet all password security requirements");
      return;
    }

    try {
      setChanging(true);
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data || "Failed to update password");
    } finally {
      setChanging(false);
    }
  };

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const fresh = await authApi.getMe();
        setAuth(fresh, localStorage.getItem("token")!);
      } catch { }
    };
    refreshUser();
  }, []);

  const getInitials = () => {
    return `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full max-w-[1400px] mx-auto p-4 md:p-8 lg:p-12 min-h-[calc(100vh-64px)] justify-center">

      {/* LEFT SIDEBAR */}
      <div className="w-full md:w-[300px] shrink-0 flex flex-col gap-6">

        {/* User Badge Card */}
        <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group animate-in fade-in slide-in-from-left-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 pointer-events-none"></div>

          <div className="flex flex-col items-center relative z-10">
            <div className="relative group w-24 h-24">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-50 dark:border-indigo-500/20 shadow-lg transition-all duration-300">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl font-bold">
                    {getInitials()}
                  </div>
                )}
              </div>
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl cursor-pointer transition">
                <span className="text-white text-xs">Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            </div>
            <h2 className="text-center font-bold text-lg text-gray-900 dark:text-white mt-4">
              {user?.firstName} {user?.lastName}
            </h2>
            <span className="uppercase text-[10px] mt-2 font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] p-4 shadow-2xl flex flex-col gap-2 animate-in fade-in slide-in-from-left-4">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === "profile"
              ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            <User className="w-4 h-4" /> Personal Info
          </button>
          <button
            onClick={() => setActiveTab("photo")}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === "photo"
              ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            <ImageIcon className="w-4 h-4" /> Profile Photo
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === "security"
              ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            <Lock className="w-4 h-4" /> Security
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col gap-8">

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-full pointer-events-none -mr-10 -mt-10"></div>

            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Information</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your basic profile details and bio.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
              <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:ring-indigo-500 py-3 rounded-xl shadow-sm" />
              <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:ring-indigo-500 py-3 rounded-xl shadow-sm" />
            </div>

            <div className="mb-10 relative z-10 max-w-xl">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Email</h2>
              <Input
                label="New Email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
                className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:ring-rose-500 py-3 rounded-xl shadow-sm"
              />
              <Button onClick={handleChangeEmail} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl">
                Change Email
              </Button>
              <p className="text-xs text-gray-500 mt-2">You will receive a verification email to confirm the change.</p>
            </div>

            <div className="mb-8 relative z-10">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Biography</label>
              <textarea
                className="w-full px-4 py-3 bg-white dark:bg-[#13151A] border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 dark:text-white shadow-sm resize-none transition-all duration-200 placeholder:text-gray-400"
                rows={6}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a little bit about yourself..."
              />

              <Input
                label="Major / Specialization"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g. Full Stack Development, Data Science..."
                className="..."
              />
            </div>

            {/* ✅ SOCIAL LINKS — Instructor only */}
            {isInstructor && (
              <div className="mb-8 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Social Links</h2>
                    <p className="text-xs text-gray-500">These will appear on your public instructor profile.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* GitHub */}
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#13151A] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                    <span className="text-gray-500 shrink-0"><GithubIcon /></span>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none"
                    />
                  </div>

                  {/* Twitter / X */}
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#13151A] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                    <span className="text-gray-500 shrink-0"><TwitterIcon /></span>
                    <input
                      type="url"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="https://x.com/username"
                      className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#13151A] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                    <span className="text-gray-500 shrink-0"><LinkedInIcon /></span>
                    <input
                      type="url"
                      value={linkedInUrl}
                      onChange={(e) => setLinkedInUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none"
                    />
                  </div>

                  {/* YouTube */}
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#13151A] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                    <span className="text-gray-500 shrink-0"><YoutubeIcon /></span>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/@channel"
                      className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none"
                    />
                  </div>

                  {/* Website — full width */}
                  <div className="md:col-span-2 flex items-center gap-3 bg-gray-50 dark:bg-[#13151A] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                    <span className="text-gray-500 shrink-0">🌐</span>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-8 border-t border-gray-100 dark:border-gray-800 relative z-10">
              <Button
                onClick={handleUpdateProfile}
                isLoading={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 px-8 py-3 rounded-xl font-semibold transition-transform hover:scale-105 active:scale-95"
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* PHOTO TAB */}
        {activeTab === "photo" && (
          <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-full pointer-events-none -mr-10 -mt-10"></div>

            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Photo</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update your public avatar.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 mb-8 relative z-10">
              <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-gray-50 dark:border-gray-800/50 shadow-lg shrink-0">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                  </div>
                )}
              </div>
              <div className="flex-1 w-full flex flex-col gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload New Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-xs text-gray-500">Upload an image from your device (recommended)</p>
              </div>
            </div>

            <div className="flex justify-end pt-8 border-t border-gray-100 dark:border-gray-800 relative z-10">
              <Button
                onClick={handleUpdateProfile}
                isLoading={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 px-8 py-3 rounded-xl font-semibold transition-transform hover:scale-105 active:scale-95"
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <div className="bg-white dark:bg-[#1C1F26] border border-gray-200 dark:border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-500/5 to-transparent rounded-full pointer-events-none -mr-10 -mt-10"></div>

            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Security</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Keep your account safe by updating your password.</p>
              </div>
            </div>

            <div className="flex flex-col gap-6 mb-8 relative z-10 max-w-xl">
              <Input
                label="Current Password"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                rightIcon={
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="text-gray-400 hover:text-gray-600">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:ring-rose-500 py-3 rounded-xl shadow-sm"
              />

              <div className="flex flex-col gap-2">
                <Input
                  label="New Password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  rightIcon={
                    <button type="button" onClick={() => setShowNew(!showNew)} className="text-gray-400 hover:text-gray-600">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:ring-rose-500 py-3 rounded-xl shadow-sm"
                />

                {/* Strength bar */}
                {newPassword.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <span className={`ml-3 text-[10px] font-black uppercase tracking-widest ${passedCount <= 1 ? 'text-red-500' :
                          passedCount === 2 ? 'text-orange-400' :
                            passedCount === 3 ? 'text-yellow-500' :
                              passedCount === 4 ? 'text-blue-500' : 'text-green-500'
                        }`}>
                        {strength.label}
                      </span>
                    </div>

                    {/* Rule checklist */}
                    {(passwordFocused || !allPassed) && (
                      <ul className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                        {ruleResults.map(rule => (
                          <li key={rule.id} className="flex items-center gap-1.5 text-[10px] font-bold">
                            {rule.passed
                              ? <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                              : <XCircle className="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0" />}
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
                label="Confirm New Password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                rightIcon={
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                className="bg-gray-50 dark:bg-[#13151A] border-gray-200 dark:border-gray-800 focus:ring-rose-500 py-3 rounded-xl shadow-sm"
              />
            </div>

            <div className="flex justify-start pt-8 border-t border-gray-100 dark:border-gray-800 relative z-10">
              <Button
                onClick={handleChangePassword}
                isLoading={changing}
                className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-gray-900 text-white shadow-lg px-8 py-3 rounded-xl font-semibold transition-transform hover:scale-105 active:scale-95"
                leftIcon={<Shield className="w-4 h-4" />}
              >
                Change Password
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};