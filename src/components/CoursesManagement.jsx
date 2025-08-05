import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    BookOpen,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import ErrorFallback from "./ErrorFallback";

const CoursesManagement = () => {
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
                        You do not have permission to view or manage courses.
                    </p>
                </div>
            </div>
        );
    }
    const [courses, setCourses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [totalCourses, setTotalCourses] = useState(0);

    // API base URL from environment
    const API_BASE = import.meta.env.VITE_API_URL;
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setValue,
    } = useForm({
        defaultValues: {
            courseName: "",
            fees: "",
        },
    });

    // Fetch courses from API
    const fetchCourses = async (search = "") => {
        setIsLoading(true);
        setApiError("");
        try {
            const url = search
                ? `${API_BASE}/courses?search=${encodeURIComponent(search)}`
                : `${API_BASE}/courses`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setCourses(data.courses || []);
            // If not searching, update totalCourses
            if (!search) {
                setTotalCourses((data.courses && data.courses.length) || 0);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            setApiError(
                "Failed to fetch courses. Please check your connection.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch course statistics
    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_BASE}/courses/stats/overview`);
            if (response.ok) {
                const data = await response.json();
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    // Initial load
    useEffect(() => {
        fetchCourses();
        fetchStats();
    }, []);

    // Search functionality
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm) {
                fetchCourses(searchTerm);
            } else {
                fetchCourses();
            }
        }, 300); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Close modal on Escape key press
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") {
                if (isModalOpen) {
                    closeModal();
                }
                if (courseToDelete) {
                    setCourseToDelete(null);
                }
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isModalOpen, courseToDelete]);

    const openModal = (course = null) => {
        setEditingCourse(course);
        setApiError("");
        if (course) {
            setValue("courseName", course.courseName);
            setValue("fees", course.fees);
        } else {
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCourse(null);
        setApiError("");
        reset();
    };

    const onSubmit = async (data) => {
        setApiError("");
        try {
            const courseData = {
                courseName: data.courseName.trim(),
                fees: parseInt(data.fees),
            };

            let response;
            if (editingCourse) {
                // Update existing course
                response = await fetch(
                    `${API_BASE}/courses/${editingCourse.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(courseData),
                    },
                );
            } else {
                // Create new course
                response = await fetch(`${API_BASE}/courses`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(courseData),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to save course");
            }

            const result = await response.json();

            // Show success message
            toast.success(
                result.message ||
                (editingCourse
                    ? "Course updated successfully!"
                    : "Course created successfully!"),
            );

            // Refresh courses list and stats
            fetchCourses(searchTerm);
            fetchStats();
            closeModal();
        } catch (error) {
            console.error("Error saving course:", error);
            setApiError(
                error.message || "Error saving course. Please try again.",
            );
        }
    };

    const confirmDeleteCourse = (course) => {
        setCourseToDelete(course);
    };

    const handleDeleteCourse = async () => {
        if (!courseToDelete) return;
        setIsDeleting(true);
        setApiError("");
        try {
            const response = await fetch(
                `${API_BASE}/courses/${courseToDelete.id}`,
                {
                    method: "DELETE",
                },
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to delete course");
            }
            const result = await response.json();
            toast.success(result.message || "Course deleted successfully!");
            fetchCourses(searchTerm);
            fetchStats();
            setCourseToDelete(null);
        } catch (error) {
            console.error("Error deleting course:", error);
            setApiError(
                error.message || "Error deleting course. Please try again.",
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRefresh = async () => {
        await Promise.all([fetchCourses(), fetchStats()]);
        toast.success("Courses refreshed!");
    };

    const FormInput = ({
        name,
        label,
        type = "text",
        placeholder,
        required = false,
        ...props
    }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                {...register(name, {
                    required: required ? `${label} is required` : false,
                    ...(name === "courseName" && {
                        minLength: {
                            value: 1,
                            message: "Course name cannot be empty",
                        },
                        maxLength: {
                            value: 255,
                            message: "Course name is too long",
                        },
                    }),
                    ...(type === "number" && {
                        min: {
                            value: 1,
                            message: "Fees must be greater than 0",
                        },
                        pattern: {
                            value: /^\d+$/,
                            message: "Please enter a valid amount",
                        },
                    }),
                })}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ease-in-out bg-white/50 backdrop-blur-xs ${errors[name]
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                {...props}
            />
            {errors[name] && (
                <p className="mt-1 text-sm text-red-600">
                    {errors[name].message}
                </p>
            )}
        </div>
    );

    return apiError ? (
        <ErrorFallback onRetry={fetchCourses} />
    ) : (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-white/20">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Course Management
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Create, update or delete courses
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                id="search"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out bg-white text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 bg-blue-50/80 border border-blue-100 rounded-xl px-4 py-3 text-sm font-medium text-blue-900 h-12">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                            <span>
                                Total:{" "}
                                <span className="font-semibold">
                                    {totalCourses}
                                </span>
                            </span>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out h-12"
                        >
                            <Plus className="w-5 h-5" />
                            Add Course
                        </button>
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold border border-gray-200 transition-all duration-200 ease-in-out h-12"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Refresh Data
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white/80 backdrop-blur-xs rounded-2xl shadow-sm border border-white/20 text-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading courses...</p>
                </div>
            )}

            {/* Courses Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-white/20">
                <div className="p-3 md:p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Course Management
                    </h2>
                </div>

                {!isLoading && courses.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Courses Found
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm
                                ? "Try adjusting your search terms"
                                : "Start by adding your first course"}
                        </p>
                    </div>
                ) : (
                    !isLoading && (
                        <div className="w-full">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            #
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Course Name
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fees (₹)
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Added Date
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {courses.map((course, index) => {
                                        const isLast =
                                            index === courses.length - 1;
                                        return (
                                            <tr
                                                key={course.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td
                                                    className={`px-3 py-2 whitespace-nowrap${isLast ? " rounded-bl-2xl" : ""}`}
                                                >
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {index + 1}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {course.courseName}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-green-600">
                                                        ₹
                                                        {course.fees?.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {course.createdAt
                                                            ? new Date(
                                                                course.createdAt,
                                                            ).toLocaleDateString()
                                                            : "-"}
                                                    </div>
                                                </td>
                                                <td
                                                    className={`px-3 py-2 whitespace-nowrap text-sm font-medium${isLast ? " rounded-br-2xl" : ""}`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() =>
                                                                openModal(
                                                                    course,
                                                                )
                                                            }
                                                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                                                            title="Edit course"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                confirmDeleteCourse(
                                                                    course,
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                                                            title="Delete course"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-sm max-w-md w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingCourse
                                        ? "Edit Course"
                                        : "Add New Course"}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* API Error in Modal */}
                            {apiError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                    <div className="flex items-center text-red-700 text-sm">
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        {apiError}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <FormInput
                                    name="courseName"
                                    label="Course Name"
                                    placeholder="Enter course name"
                                    required
                                />
                                <FormInput
                                    name="fees"
                                    label="Fees (₹)"
                                    type="number"
                                    placeholder="Enter course fees"
                                    required
                                    min="1"
                                />

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit(onSubmit)}
                                        disabled={isSubmitting}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                                {editingCourse
                                                    ? "Updating..."
                                                    : "Creating..."}
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                {editingCourse
                                                    ? "Update Course"
                                                    : "Create Course"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {courseToDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-sm max-w-md w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Delete Course
                                </h2>
                                <button
                                    onClick={() => setCourseToDelete(null)}
                                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="mb-6 text-gray-700 text-lg">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-red-600">
                                    "{courseToDelete.courseName}"
                                </span>
                                ?
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setCourseToDelete(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteCourse}
                                    disabled={isDeleting}
                                    className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-2 px-6 rounded-lg font-medium hover:from-red-700 hover:to-pink-700 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoursesManagement;
