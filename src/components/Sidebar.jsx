import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Tooltip } from "react-tooltip";
import {
    ChevronLeft,
    ChevronRight,
    Home,
    Users,
    GraduationCap,
    BookOpen,
    UserCheck,
    Settings,
    DollarSign,
    ClipboardList,
    FileText,
    LogOut,
    KeyRound,
    UserPlus,
} from "lucide-react";
import ChangePasswordModal from "./modals/ChangePasswordModal";
import { toast } from "react-toastify";

const Sidebar = () => {
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const [showMenu, setShowMenu] = useState(false);
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const adminRef = useRef(null);

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: Home, path: "/" },
        {
            id: "enquiries",
            label: "Enquiries List",
            icon: Users,
            path: "/enquiries",
        },
        {
            id: "admissions",
            label: "Students List",
            icon: UserCheck,
            path: "/admissions",
        },
        {
            id: "attendance",
            label: "Attendance Management",
            icon: ClipboardList,
            path: "/attendance",
        },
        {
            id: "courses",
            label: "Course Management",
            icon: BookOpen,
            path: "/courses",
        },
        {
            id: "fees",
            label: "Fee Management",
            icon: DollarSign,
            path: "/fees",
        },
        {
            id: "documents",
            label: "Document Upload",
            icon: FileText,
            path: "/documents",
        },
        {
            id: "settings",
            label: "Settings",
            icon: Settings,
            path: "/settings",
        },
    ];

    // Filter out Settings and Course Management for staff users
    let filteredMenuItems = menuItems;
    if (user && user.role === "staff") {
        filteredMenuItems = menuItems.filter(
            (item) => item.id !== "settings" && item.id !== "courses",
        );
    }

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        toast.success("Logged out successfully.");
        navigate("/login");
    };
    const handleAdminClick = () => {
        setShowMenu((prev) => !prev);
    };
    useEffect(() => {
        const fetchUser = async () => {
            setUserLoading(true);
            try {
                const token = localStorage.getItem("access_token");
                if (!token) {
                    setUser(null);
                    setUserLoading(false);
                    return;
                }
                const API_BASE = import.meta.env.VITE_API_URL;
                const res = await fetch(`${API_BASE.replace("/api", "")}/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setUserLoading(false);
            }
        };
        fetchUser();
    }, []);
    useEffect(() => {
        if (!showMenu) return;
        function handleClickOutside(event) {
            if (adminRef.current && !adminRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [showMenu]);

    return (
        <div
            className={`${isCollapsed ? "w-20" : "w-70"} transition-all duration-500 ease-in-out bg-white border-r border-gray-200/50 shadow-sm flex flex-col h-screen relative`}
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-200/50 flex-shrink-0">
                <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3 w-full">
                        <div className="w-10 h-10 bg-gradient-to-br -ml-[5px] from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ease-in-out">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <div
                            className={`flex-1 min-w-0 transition-all duration-500 ease-in-out overflow-hidden ${
                                isCollapsed
                                    ? "opacity-0 transform translate-x-4 pointer-events-none w-0"
                                    : "opacity-100 transform translate-x-0"
                            }`}
                        >
                            <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                                EduManage
                            </h1>
                            <p className="text-sm text-gray-500 whitespace-nowrap">
                                Institute Management
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {filteredMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <div key={item.id}>
                            <Tooltip id="sidebar-tip" place="right" />
                            <Link
                                to={item.path}
                                data-tooltip-id="sidebar-tip"
                                data-tooltip-content={item.label}
                                data-tooltip-hidden={!isCollapsed}
                                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 ease-in-out group relative overflow-hidden ${
                                    isActive
                                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm transform scale-[1.02]"
                                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:transform hover:scale-[1.01]"
                                } ${isCollapsed ? "justify-center" : "space-x-3"}`}
                            >
                                <Icon
                                    className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ease-in-out ${
                                        isActive
                                            ? "text-white"
                                            : "text-gray-500 group-hover:text-gray-700"
                                    }`}
                                />

                                <span
                                    className={`font-medium text-sm whitespace-nowrap transition-all duration-500 ease-in-out ${
                                        isCollapsed
                                            ? "opacity-0 transform translate-x-4 pointer-events-none w-0"
                                            : "opacity-100 transform translate-x-0 w-auto"
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200/50 flex-shrink-0">
                {isCollapsed ? (
                    <div className="flex justify-center">
                        {/* Tooltip for collapsed state */}
                        <Tooltip id="admin-tooltip" place="right" />
                        <div
                            data-tooltip-id="admin-tooltip"
                            data-tooltip-content={
                                user && user.username ? user.username : "User"
                            }
                            className="z-20 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center group relative transition-all duration-300 ease-in-out"
                        >
                            <span className="text-white font-semibold text-sm">
                                {userLoading
                                    ? "U"
                                    : user && user.username
                                      ? user.username.charAt(0).toUpperCase()
                                      : "U"}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div ref={adminRef} className="relative">
                        <div
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 transition-all duration-500 ease-in-out cursor-pointer select-none"
                            onClick={handleAdminClick}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-semibold text-sm">
                                        {user && user.username
                                            ? user.username
                                                  .charAt(0)
                                                  .toUpperCase()
                                            : "U"}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    {userLoading ? (
                                        <>
                                            <p className="text-sm font-medium text-gray-400 truncate animate-pulse">
                                                Loading...
                                            </p>
                                            <p className="text-xs text-gray-300 truncate animate-pulse">
                                                &nbsp;
                                            </p>
                                        </>
                                    ) : user ? (
                                        <>
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {user.username}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate capitalize">
                                                {user.role}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm font-medium text-gray-400 truncate">
                                                Unknown User
                                            </p>
                                            <p className="text-xs text-gray-300 truncate">
                                                &nbsp;
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        {showMenu && (
                            <div className="absolute bottom-20 left-0 w-full z-50 bg-white border border-gray-200 rounded-xl shadow-xl py-2 animate-fade-in">
                                <button
                                    onClick={() => {
                                        navigate("/signup");
                                        setShowMenu(false);
                                    }}
                                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors duration-150"
                                >
                                    <UserPlus className="w-5 h-5 text-gray-400 group-hover:text-blue-700 transition-colors duration-150" />
                                    <span className="font-medium">
                                        Add New User
                                    </span>
                                </button>
                                <button
                                    onClick={() => {
                                        setShowChangePassword(true);
                                        setShowMenu(false);
                                    }}
                                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors duration-150"
                                >
                                    <KeyRound className="w-5 h-5 text-gray-400 group-hover:text-blue-700 transition-colors duration-150" />
                                    <span className="font-medium">
                                        Change Password
                                    </span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors duration-150"
                                >
                                    <LogOut className="w-5 h-5 text-gray-400 group-hover:text-blue-700 transition-colors duration-150" />
                                    <span className="font-medium">Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Collapse Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-4 top-20 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 z-10 group"
            >
                <div className="transition-transform duration-300 ease-in-out">
                    {isCollapsed ? (
                        <ChevronRight className="h-5 w-5 text-gray-600 transition-all duration-300 ease-in-out" />
                    ) : (
                        <ChevronLeft className="h-5 w-5 text-gray-600 transition-all duration-300 ease-in-out" />
                    )}
                </div>
            </button>
            <ChangePasswordModal
                open={showChangePassword}
                onClose={() => setShowChangePassword(false)}
            />
        </div>
    );
};

export default Sidebar;
