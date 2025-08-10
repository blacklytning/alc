import React, { useState, useEffect } from "react";
import ErrorFallback from "./ErrorFallback";
import {
    GraduationCap,
    Plus,
    RefreshCw,
    Search,
    Eye,
    Calendar,
    X,
} from "lucide-react";
import { formatDate } from "./utils.jsx";
import { Link } from "react-router";
import { toast } from "react-toastify";

import StudentDetailsModal from "./modals/StudentDetailsModal";
import LearnerCredentialsModal from "./modals/LearnerCredentialsModal";
import ExamDetailsModal from "./modals/ExamDetailsModal";

const StudentAdmissionsList = () => {
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAdmission, setSelectedAdmission] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCourse, setFilterCourse] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 12;

    // State for learner credentials modal
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [credentialsStudent, setCredentialsStudent] = useState(null);

    // State for exam details modal
    const [showExamModal, setShowExamModal] = useState(false);
    const [examStudent, setExamStudent] = useState(null);

    const API_BASE = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchAdmissions = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE}/admissions`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setAdmissions(data.admissions || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching admissions:", err);
                setError(
                    "Failed to fetch admissions. Please check if the server is running.",
                );
            } finally {
                setLoading(false);
            }
        };
        fetchAdmissions();
        // Attach fetchAdmissions to window for handleRefresh
        window._fetchAdmissions = fetchAdmissions;
    }, [API_BASE]);

    const handleViewDetails = async (admissionId) => {
        try {
            const response = await fetch(
                `${API_BASE}/admission/${admissionId}`,
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSelectedAdmission(data);
        } catch (err) {
            console.error("Error fetching admission details:", err);
            alert("Failed to fetch admission details.");
        }
    };

    // Helper function to check if two dates are the same day
    const isSameDay = (date1, date2) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        );
    };

    // Filter admissions based on search term, course, and date
    const filteredAdmissions = admissions.filter((admission) => {
        const matchesSearch =
            admission.firstName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            admission.lastName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            admission.mobileNumber.includes(searchTerm) ||
            admission.courseName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            admission.certificateName
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesCourse =
            filterCourse === "" || admission.courseName === filterCourse;

        const matchesDate =
            filterDate === "" || isSameDay(admission.createdAt, filterDate);

        return matchesSearch && matchesCourse && matchesDate;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredAdmissions.length / studentsPerPage);
    const paginatedAdmissions = filteredAdmissions.slice(
        (currentPage - 1) * studentsPerPage,
        currentPage * studentsPerPage,
    );

    // Reset to page 1 when search/filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCourse, filterDate]);

    const handleRefresh = async () => {
        if (window._fetchAdmissions) {
            await window._fetchAdmissions();
            toast.success("Student list refreshed!");
        }
    };

    const clearDateFilter = () => {
        setFilterDate("");
    };

    // Close modal on Escape key press
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") {
                setSelectedAdmission(null);
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-xs rounded-3xl shadow-sm p-8 border border-white/20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">
                                Loading admissions...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return <ErrorFallback onRetry={() => window.location.reload()} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-sm p-8 border border-white/20 mb-6">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">
                            Students List
                        </h1>
                        <p className="text-gray-600 text-lg">
                            View, search, and manage student admissions
                        </p>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col gap-4">
                        {/* First Row - Search and Course Filter */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex flex-1 gap-3">
                                <div className="relative w-full max-w-xs">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        id="search"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        placeholder="Search by name, mobile, course..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out bg-white text-sm h-12"
                                    />
                                </div>
                                <select
                                    id="courseFilter"
                                    value={filterCourse}
                                    onChange={(e) =>
                                        setFilterCourse(e.target.value)
                                    }
                                    className="w-full max-w-xs px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out bg-white text-sm h-12"
                                >
                                    <option value="">All Courses</option>
                                    {[
                                        ...new Set(
                                            admissions.map(
                                                (admission) =>
                                                    admission.courseName,
                                            ),
                                        ),
                                    ].map((course) => (
                                        <option key={course} value={course}>
                                            {course.replace("-", " ")}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="inline-flex items-center gap-2 bg-blue-50/80 border border-blue-100 rounded-xl px-4 py-3 text-sm font-medium text-blue-900 h-12">
                                    <GraduationCap className="w-4 h-4 text-blue-500" />
                                    <span>
                                        Total:{" "}
                                        <span className="font-semibold">
                                            {admissions.length}
                                        </span>
                                    </span>
                                </div>
                                <Link
                                    to="/admission"
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out h-12"
                                >
                                    <Plus className="w-5 h-5" />
                                    New Admission
                                </Link>
                                <button
                                    onClick={handleRefresh}
                                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold border border-gray-200 transition-all duration-200 ease-in-out h-12"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Refresh Data
                                </button>
                            </div>
                        </div>

                        {/* Second Row - Date Filter */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="date"
                                    id="dateFilter"
                                    value={filterDate}
                                    onChange={(e) =>
                                        setFilterDate(e.target.value)
                                    }
                                    className="pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out bg-white text-sm h-12"
                                />
                            </div>
                            {filterDate && (
                                <button
                                    onClick={clearDateFilter}
                                    className="inline-flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-3 rounded-xl font-medium border border-red-200 transition-all duration-200 ease-in-out h-12"
                                    title="Clear date filter"
                                >
                                    <X className="w-4 h-4" />
                                    Clear Date
                                </button>
                            )}
                            {(searchTerm || filterCourse || filterDate) && (
                                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                    Showing {filteredAdmissions.length} of{" "}
                                    {admissions.length} admissions
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Admissions List */}
                {paginatedAdmissions.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm p-8 border border-white/20 mb-6">
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">
                                📋
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No Admissions Found
                            </h3>
                            <p className="text-gray-600">
                                {searchTerm || filterCourse || filterDate
                                    ? "Try adjusting your search, course filter, or date filter criteria."
                                    : "No student admissions have been recorded yet."}
                            </p>
                            {(searchTerm || filterCourse || filterDate) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setFilterCourse("");
                                        setFilterDate("");
                                    }}
                                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {paginatedAdmissions.map((admission) => (
                            <div
                                key={admission.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center transition-all duration-200 h-full hover:shadow-md"
                            >
                                <img
                                    src={`${API_BASE.replace("/api", "")}/uploads/${admission.photoFilename}`}
                                    alt={
                                        admission.firstName +
                                        " " +
                                        admission.lastName
                                    }
                                    className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-white shadow-sm"
                                    onError={(e) => {
                                        e.target.src =
                                            "https://via.placeholder.com/80x80?text=No+Photo";
                                    }}
                                />
                                <div className="text-base font-medium text-gray-900 text-center mb-1 min-h-[2.5rem] flex items-center justify-center">
                                    {admission.firstName} {admission.lastName}
                                </div>
                                <div className="text-sm text-gray-600 mb-2 text-center capitalize">
                                    {admission.courseName.replace("-", " ")}
                                </div>
                                <div className="text-sm text-gray-500 mb-2 text-center">
                                    +91 {admission.mobileNumber}
                                </div>
                                <div className="text-xs text-gray-400 mb-4 text-center">
                                    Admission: {formatDate(admission.createdAt)}
                                </div>
                                <div className="mt-auto w-full flex flex-col gap-2">
                                    <button
                                        onClick={() =>
                                            handleViewDetails(admission.id)
                                        }
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 justify-center"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <nav className="inline-flex rounded-xl shadow-sm overflow-hidden border border-gray-200 bg-white">
                            <button
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, idx) => (
                                <button
                                    key={idx + 1}
                                    onClick={() => setCurrentPage(idx + 1)}
                                    className={`px-4 py-2 text-sm font-medium ${currentPage === idx + 1 ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50"}`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                            <button
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1),
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            {/* Modal for Detailed View */}
            <StudentDetailsModal
                selectedAdmission={selectedAdmission}
                onClose={() => setSelectedAdmission(null)}
                API_BASE={API_BASE}
                onEdit={() => {
                    if (selectedAdmission) {
                        window.location.href = `/admissions/edit/${selectedAdmission.id}`;
                    }
                }}
                onCredentials={() => {
                    if (selectedAdmission) {
                        setCredentialsStudent(selectedAdmission);
                        setShowCredentialsModal(true);
                    }
                }}
                onExam={() => {
                    if (selectedAdmission) {
                        setExamStudent(selectedAdmission);
                        setShowExamModal(true);
                    }
                }}
            />

            {/* Modal for Learner Credentials */}
            <LearnerCredentialsModal
                open={showCredentialsModal}
                onClose={() => {
                    setShowCredentialsModal(false);
                    setCredentialsStudent(null);
                }}
                student={credentialsStudent}
                onSave={async (credentials) => {
                    if (!credentialsStudent) return;
                    try {
                        const res = await fetch(
                            `${API_BASE}/admission/${credentialsStudent.id}/credentials`,
                            {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(credentials),
                            },
                        );
                        if (!res.ok)
                            throw new Error("Failed to save credentials");
                        toast.success("Learner credentials saved!");
                        setShowCredentialsModal(false);
                        setCredentialsStudent(null);
                        if (window._fetchAdmissions)
                            await window._fetchAdmissions();
                    } catch (err) {
                        toast.error("Error saving credentials");
                    }
                }}
            />

            {/* Modal for Exam Details */}
            <ExamDetailsModal
                open={showExamModal}
                onClose={() => {
                    setShowExamModal(false);
                    setExamStudent(null);
                }}
                student={examStudent}
                onSave={async (examDetails) => {
                    if (!examStudent) return;
                    try {
                        const res = await fetch(
                            `${API_BASE}/admission/${examStudent.id}/exam_result`,
                            {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(examDetails),
                            },
                        );
                        if (!res.ok)
                            throw new Error("Failed to save exam details");
                        toast.success("Exam details saved!");
                        setShowExamModal(false);
                        setExamStudent(null);
                        if (window._fetchAdmissions)
                            await window._fetchAdmissions();
                    } catch (err) {
                        toast.error("Error saving exam details");
                    }
                }}
            />
        </div>
    );
};

export default StudentAdmissionsList;
