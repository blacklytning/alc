import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useNavigate } from "react-router";

const InstituteLogin = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const [showPassword, setShowPassword] = useState(false);
    const [instituteSettings, setInstituteSettings] = useState(null);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [locked, setLocked] = useState(false);
    const API_BASE = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInstituteSettings = async () => {
            try {
                setLoadingSettings(true);
                const response = await fetch(`${API_BASE}/settings/institute`);
                if (response.ok) {
                    const data = await response.json();
                    setInstituteSettings(data);
                } else {
                    setInstituteSettings(null);
                }
            } catch (error) {
                setInstituteSettings(null);
            } finally {
                setLoadingSettings(false);
            }
        };

        const checkSetup = async () => {
            try {
                const response = await fetch(
                    `${API_BASE.replace("/api", "")}/check-setup`,
                );
                if (response.status === 307) {
                    navigate("/signup");
                    return;
                }
            } catch (error) {
                // Continue to login page
            }
        };

        checkSetup();
        fetchInstituteSettings();
    }, [API_BASE, navigate]);

    const onSubmit = async (data) => {
        if (locked) return;
        try {
            const formData = new URLSearchParams();
            formData.append("username", data.username);
            formData.append("password", data.password);
            const res = await fetch(`${API_BASE.replace("/api", "")}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData.toString(),
            });
            if (!res.ok) {
                const result = await res.json();
                toast.error(result.detail || "Login failed");
                setFailedAttempts((prev) => {
                    const next = prev + 1;
                    if (next >= 4) setLocked(true);
                    return next;
                });
                return;
            }
            setFailedAttempts(0);
            const result = await res.json();
            localStorage.setItem("access_token", result.access_token);
            toast.success("Login successful! Welcome to the dashboard.");
            navigate("/");
        } catch (err) {
            toast.error("Login failed. Please try again.");
            setFailedAttempts((prev) => {
                const next = prev + 1;
                if (next >= 4) setLocked(true);
                return next;
            });
        }
    };

    if (locked) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-3xl shadow-sm p-8 border border-white/20 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Lock className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Account Locked</h2>
                        <p className="text-gray-700 mb-4 text-center">Too many failed login attempts.<br />Please contact your administrator to unlock your account.</p>
                    </div>
                    <div className="text-center mt-8">
                        <p className="text-sm text-gray-500">© 2025 blacklytning. All rights reserved.</p>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    {/* Logo/Header Section */}
                    <div className="text-center mb-8">
                        {loadingSettings ? (
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm animate-pulse" />
                        ) : instituteSettings &&
                          (instituteSettings.logo || instituteSettings.name) ? (
                            <>
                                {instituteSettings.logo ? (
                                    <div className="flex justify-center mb-4">
                                        <img
                                            src={`${API_BASE.replace("/api", "")}/uploads/${instituteSettings.logo}`}
                                            alt="Institute Logo"
                                            className="max-w-full h-auto max-h-24 object-contain rounded-lg"
                                        />
                                    </div>
                                ) : null}
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {instituteSettings.name}
                                </h1>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <Lock className="w-10 h-10 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Institute Portal
                                </h1>
                            </>
                        )}
                        <p className="text-gray-600">
                            Sign in to access your dashboard
                        </p>
                    </div>

                    {/* Login Form */}
                    <div className="bg-white rounded-3xl shadow-sm p-8 border border-white/20">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            {/* Username Field */}
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="username"
                                        {...register("username", {
                                            required: "Username is required",
                                        })}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 ease-in-out ${
                                            errors.username
                                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        }`}
                                        placeholder="Enter your username"
                                    />
                                </div>
                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        id="password"
                                        {...register("password", {
                                            required: "Password is required",
                                        })}
                                        className={`w-full pl-10 pr-12 py-3 rounded-xl border transition-all duration-200 ease-in-out ${
                                            errors.password
                                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                                : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        }`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:scale-[1.02] shadow-sm hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>
                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-600">
                                Don’t have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/signup")}
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    Sign Up
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8">
                        <p className="text-sm text-gray-500">
                            © 2025 blacklytning. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
};

export default InstituteLogin;
