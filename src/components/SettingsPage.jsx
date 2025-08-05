import { useState, useEffect, useRef } from "react";
import {
    Building2,
    Image,
    Database,
    Download,
    Save,
    Loader2,
    Camera,
    X,
} from "lucide-react";
import { toast } from "react-toastify";
import ErrorFallback from "./ErrorFallback";
import DatabaseManagement from "./DatabaseManagement";
import ExportData from "./ExportData";
import { formatDate } from "./utils.jsx";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal";

const SettingsPage = () => {
    // Get user role from token
    let userRole = null;
    try {
        const token = localStorage.getItem("access_token");
        if (token) {
            const payload = JSON.parse(atob(token.split(".")[1]));
            userRole = payload.role;
        }
    } catch (e) {
        userRole = null;
    }

    if (userRole === "staff") {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <X className="w-6 h-6 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-600">
                        You do not have permission to view system settings.
                    </p>
                </div>
            </div>
        );
    }
    const fileInputRef = useRef(null);
    const backupFileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [backupInProgress, setBackupInProgress] = useState(false);
    const [restoreInProgress, setRestoreInProgress] = useState(false);
    const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
    const [backupFileToRestore, setBackupFileToRestore] = useState(null);

    // Institute Settings State
    const [instituteSettings, setInstituteSettings] = useState({
        name: "",
        centerCode: "",
        logo: null,
        logoPreview: null,
        address: "",
        phone: "",
        email: "",
        website: "",
    });

    // Database Settings State
    const [dbStats, setDbStats] = useState({
        lastBackup: null,
        databaseSize: 0,
        totalRecords: 0,
        backupHistory: [],
    });

    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("institute");

    // API base URL
    const API_BASE = import.meta.env.VITE_API_URL;

    // Fetch current settings
    const fetchSettings = async () => {
        setError(null);
        try {
            setLoading(true);

            const [instituteResponse, dbStatsResponse] = await Promise.all([
                fetch(`${API_BASE}/settings/institute`).catch(() => ({
                    ok: false,
                })),
                fetch(`${API_BASE}/settings/database/stats`).catch(() => ({
                    ok: false,
                })),
            ]);

            // If either response is not OK, show error fallback
            if (!instituteResponse.ok || !dbStatsResponse.ok) {
                setError(
                    "Failed to load settings. Please check your connection.",
                );
                setLoading(false);
                return;
            }

            const instituteData = await instituteResponse.json();
            setInstituteSettings({
                name: instituteData.name || "",
                centerCode: instituteData.centerCode || "",
                address: instituteData.address || "",
                phone: instituteData.phone || "",
                email: instituteData.email || "",
                website: instituteData.website || "",
                logo: null,
                logoPreview: instituteData.logo
                    ? `${API_BASE.replace("/api", "")}/uploads/${instituteData.logo}`
                    : null,
            });

            const dbData = await dbStatsResponse.json();
            setDbStats(dbData);
        } catch (err) {
            console.error("Error fetching settings:", err);
            setError("Failed to load settings. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    // Handle logo file selection
    const handleLogoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                // 5MB limit
                toast.error("Logo file size should be less than 5MB");
                return;
            }

            if (!file.type.startsWith("image/")) {
                toast.error("Please select a valid image file");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setInstituteSettings((prev) => ({
                    ...prev,
                    logo: file,
                    logoPreview: e.target.result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove logo
    const removeLogo = () => {
        setInstituteSettings((prev) => ({
            ...prev,
            logo: null,
            logoPreview: null,
        }));
    };

    // Save institute settings
    const saveInstituteSettings = async () => {
        try {
            setSaving(true);

            const formData = new FormData();
            formData.append("name", instituteSettings.name);
            formData.append("centerCode", instituteSettings.centerCode);
            formData.append("address", instituteSettings.address);
            formData.append("phone", instituteSettings.phone);
            formData.append("email", instituteSettings.email);
            formData.append("website", instituteSettings.website);

            if (instituteSettings.logo instanceof File) {
                formData.append("logo", instituteSettings.logo);
            }

            const response = await fetch(`${API_BASE}/settings/institute`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                toast.success(
                    result.message || "Institute settings saved successfully!",
                );
                fetchSettings(); // Refresh settings
            } else {
                const errorData = await response.json();
                toast.error(errorData.detail || "Failed to save settings");
            }
        } catch (err) {
            console.error("Error saving settings:", err);
            toast.error("Failed to save settings. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // Database backup
    const createBackup = async () => {
        try {
            setBackupInProgress(true);

            const response = await fetch(
                `${API_BASE}/settings/database/backup`,
                {
                    method: "POST",
                },
            );

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;

                // Get filename from response headers or use default
                const contentDisposition = response.headers.get(
                    "content-disposition",
                );
                let filename = `edumanage_backup_${new Date().toISOString().split("T")[0]}.sql`;

                if (contentDisposition) {
                    const filenameMatch =
                        contentDisposition.match(/filename="?(.+)"?/);
                    if (filenameMatch) {
                        filename = filenameMatch[1];
                    }
                }

                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                toast.success("Database backup created successfully!");
                fetchSettings(); // Refresh stats
            } else {
                const errorData = await response.json();
                toast.error(errorData.detail || "Failed to create backup");
            }
        } catch (err) {
            console.error("Error creating backup:", err);
            toast.error("Failed to create backup. Please try again.");
        } finally {
            setBackupInProgress(false);
        }
    };

    // Database restore
    const restoreBackup = async (file) => {
        try {
            setRestoreInProgress(true);

            const formData = new FormData();
            formData.append("backup_file", file);

            const response = await fetch(
                `${API_BASE}/settings/database/restore`,
                {
                    method: "POST",
                    body: formData,
                },
            );

            if (response.ok) {
                const result = await response.json();
                toast.success(
                    result.message || "Database restored successfully!",
                );
                fetchSettings(); // Refresh stats
                // Optionally refresh the entire app
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                const errorData = await response.json();
                toast.error(errorData.detail || "Failed to restore backup");
            }
        } catch (err) {
            console.error("Error restoring backup:", err);
            toast.error("Failed to restore backup. Please try again.");
        } finally {
            setRestoreInProgress(false);
        }
    };

    // Handle backup file selection
    const handleBackupFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setBackupFileToRestore(file);
            setShowRestoreConfirm(true);
        }
        event.target.value = "";
    };

    const confirmRestoreBackup = () => {
        if (backupFileToRestore) {
            restoreBackup(backupFileToRestore);
            setShowRestoreConfirm(false);
            setBackupFileToRestore(null);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    return error ? (
        <ErrorFallback onRetry={fetchSettings} />
    ) : (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-white/20">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        System Settings
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Configure your institute settings and manage database
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-white/20">
                <div className="flex space-x-1 p-1">
                    <button
                        onClick={() => setActiveTab("institute")}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                            activeTab === "institute"
                                ? "bg-blue-500 text-white shadow-sm"
                                : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        <Building2 className="w-5 h-5" />
                        <span>Institute Settings</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("database")}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                            activeTab === "database"
                                ? "bg-blue-500 text-white shadow-sm"
                                : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        <Database className="w-5 h-5" />
                        <span>Database Management</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("export")}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                            activeTab === "export"
                                ? "bg-blue-500 text-white shadow-sm"
                                : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        <Download className="w-5 h-5" />
                        <span>Export Data</span>
                    </button>
                </div>
            </div>

            {/* Institute Settings Tab */}
            {activeTab === "institute" && (
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-white/20">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                        <Building2 className="w-6 h-6 mr-3 text-blue-600" />
                        Institute Information
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Form Fields */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Institute Name *
                                </label>
                                <input
                                    type="text"
                                    value={instituteSettings.name}
                                    onChange={(e) =>
                                        setInstituteSettings((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter institute name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Center Code
                                </label>
                                <input
                                    type="text"
                                    value={instituteSettings.centerCode}
                                    onChange={(e) =>
                                        setInstituteSettings((prev) => ({
                                            ...prev,
                                            centerCode: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter center code"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address
                                </label>
                                <textarea
                                    value={instituteSettings.address}
                                    onChange={(e) =>
                                        setInstituteSettings((prev) => ({
                                            ...prev,
                                            address: e.target.value,
                                        }))
                                    }
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter institute address"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={instituteSettings.phone}
                                        onChange={(e) =>
                                            setInstituteSettings((prev) => ({
                                                ...prev,
                                                phone: e.target.value,
                                            }))
                                        }
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Phone number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={instituteSettings.email}
                                        onChange={(e) =>
                                            setInstituteSettings((prev) => ({
                                                ...prev,
                                                email: e.target.value,
                                            }))
                                        }
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Email address"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Website
                                </label>
                                <input
                                    type="url"
                                    value={instituteSettings.website}
                                    onChange={(e) =>
                                        setInstituteSettings((prev) => ({
                                            ...prev,
                                            website: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                        </div>

                        {/* Right Column - Logo Upload */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    Institute Logo
                                </label>

                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                                    {instituteSettings.logoPreview ? (
                                        <div className="relative">
                                            <img
                                                src={
                                                    instituteSettings.logoPreview
                                                }
                                                alt="Institute Logo"
                                                className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
                                            />
                                            <button
                                                onClick={removeLogo}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                                <Image className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-600">
                                                    Click to upload logo
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    PNG, JPG up to 5MB
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleLogoChange}
                                        accept="image/*"
                                        className="hidden"
                                    />

                                    <button
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 mx-auto"
                                    >
                                        <Camera className="w-4 h-4" />
                                        <span>
                                            {instituteSettings.logoPreview
                                                ? "Change Logo"
                                                : "Upload Logo"}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={saveInstituteSettings}
                            disabled={saving || !instituteSettings.name.trim()}
                            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span>
                                {saving ? "Saving..." : "Save Settings"}
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* Database Management Tab */}
            {activeTab === "database" && (
                <DatabaseManagement
                    dbStats={dbStats}
                    formatFileSize={formatFileSize}
                    formatDate={formatDate}
                    createBackup={createBackup}
                    backupInProgress={backupInProgress}
                    restoreInProgress={restoreInProgress}
                    backupFileInputRef={backupFileInputRef}
                    handleBackupFileChange={handleBackupFileChange}
                />
            )}

            {/* Export Data Tab */}
            {activeTab === "export" && <ExportData />}

            {/* Restore Backup Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={showRestoreConfirm}
                onConfirm={confirmRestoreBackup}
                onCancel={() => {
                    setShowRestoreConfirm(false);
                    setBackupFileToRestore(null);
                }}
                title="Restore Backup"
                message="Are you sure you want to restore this backup? This will replace all current data. This action cannot be undone."
                itemName="backup"
            />
        </div>
    );
};

export default SettingsPage;
