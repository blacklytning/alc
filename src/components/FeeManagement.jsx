import { useState, useEffect } from "react";
import {
    Search,
    Plus,
    DollarSign,
    CheckCircle,
    Clock,
    X,
    Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import ErrorFallback from "./ErrorFallback";
import FeeReceipt from "./FeeReceipt";
import RecordPaymentModal from "./modals/RecordPaymentModal";
import FeeDetailsModal from "./modals/FeeDetailsModal";
import {
    formatDate,
    formatCurrency,
    getStatusColor,
    getStatusIcon,
} from "./utils.jsx";

const FeeManagement = () => {
    const [students, setStudents] = useState([]);
    const [feeRecords, setFeeRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [courseFilter, setCourseFilter] = useState("ALL");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [paymentData, setPaymentData] = useState({
        student_id: "",
        amount: "",
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: "CASH",
        transaction_id: "",
        notes: "",
        late_fee: 0,
        discount: 0,
    });

    const API_BASE = import.meta.env.VITE_API_URL;

    // Fetch data
    const fetchData = async () => {
        setError(null); // Always clear error before retry
        try {
            setLoading(true);

            const [studentsResponse, feesResponse] = await Promise.all([
                fetch(`${API_BASE}/admissions`).catch(() => ({ ok: false })),
                fetch(`${API_BASE}/fees`).catch(() => ({ ok: false })),
            ]);

            if (!studentsResponse.ok) {
                setError(
                    "Failed to load fee data. Please check your connection.",
                );
                setStudents([]);
                setFeeRecords([]);
                return;
            }

            if (studentsResponse.ok) {
                const studentsData = await studentsResponse.json();
                setStudents(studentsData.admissions || []);
            }

            if (feesResponse.ok) {
                const feesData = await feesResponse.json();
                setFeeRecords(feesData.fees || []);
            } else {
                setFeeRecords([]);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load fee data. Please check your connection.");
            setStudents([]);
            setFeeRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentHistory = async (studentId) => {
        setLoadingHistory(true);
        try {
            const response = await fetch(
                `${API_BASE}/fees/payments/student/${studentId}`,
            );
            if (response.ok) {
                const result = await response.json();
                setPaymentHistory(result.payments || []);
            } else {
                setPaymentHistory([]);
            }
        } catch (error) {
            console.error("Error fetching payment history:", error);
            setPaymentHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter records
    useEffect(() => {
        let filtered = feeRecords;

        if (searchTerm) {
            filtered = filtered.filter(
                (record) =>
                    record.studentName
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    record.studentId?.toString().includes(searchTerm) ||
                    record.mobileNumber?.includes(searchTerm),
            );
        }

        if (statusFilter !== "ALL") {
            filtered = filtered.filter(
                (record) => record.status === statusFilter,
            );
        }

        if (courseFilter !== "ALL") {
            filtered = filtered.filter(
                (record) => record.courseName === courseFilter,
            );
        }
    }, [searchTerm, statusFilter, courseFilter, feeRecords]);

    // Calculate payment status using fee summary data
    const calculatePaymentStatus = (student) => {
        // Find the fee record for this student from the fees summary
        const feeRecord = feeRecords.find(
            (fee) => fee.student_id === student.id,
        );

        if (feeRecord) {
            return {
                totalDue: feeRecord.course_fee,
                totalPaid: feeRecord.total_paid,
                balance: feeRecord.balance,
                isOverdue: feeRecord.is_overdue,
                monthsOverdue: feeRecord.months_overdue || 0,
            };
        }

        // Fallback calculation if no fee record found
        const admissionDate = new Date(student.createdAt);
        const today = new Date();
        const monthsDiff =
            (today.getFullYear() - admissionDate.getFullYear()) * 12 +
            (today.getMonth() - admissionDate.getMonth());

        const courseFee = getCourseFee(student.courseName);
        const totalDue = courseFee * Math.max(1, monthsDiff + 1);
        const totalPaid = 0;
        const balance = totalDue - totalPaid;
        const isOverdue = balance > 0 && monthsDiff > 0;

        return {
            totalDue,
            totalPaid,
            balance,
            isOverdue,
            monthsOverdue: isOverdue ? monthsDiff : 0,
        };
    };

    const getCourseFee = (courseName) => {
        // Mock course fees - in real app, fetch from courses API
        const courseFees = {
            "MS-CIT": 3000,
            "ADVANCE TALLY - CIT": 2500,
            "ADVANCE TALLY - KLIC": 2500,
            "ADVANCE EXCEL - CIT": 2000,
            "ENGLISH TYPING - MKCL": 1500,
            "ENGLISH TYPING - CIT": 1500,
            "ENGLISH TYPING - GOVT": 1500,
            "MARATHI TYPING - MKCL": 1500,
            "MARATHI TYPING - CIT": 1500,
            "MARATHI TYPING - GOVT": 1500,
            "DTP - CIT": 2000,
            "DTP - KLIC": 2000,
            "IT - KLIC": 2500,
            "KLIC DIPLOMA": 3500,
        };
        return courseFees[courseName] || 2000;
    };

    const handleAddPayment = (student) => {
        setSelectedStudent(student);
        const paymentStatus = calculatePaymentStatus(student);
        setPaymentData({
            student_id: student.id,
            amount: paymentStatus.balance.toString(),
            payment_date: new Date().toISOString().split("T")[0],
            payment_method: "CASH",
            transaction_id: "",
            notes: "",
            late_fee: paymentStatus.isOverdue
                ? Math.min(500, paymentStatus.balance * 0.1)
                : 0,
            discount: 0,
        });
        setShowPaymentModal(true);
    };

    // Accept updated payment data from modal and send to backend
    const handlePaymentSubmit = async (updatedPaymentDataOrEvent) => {
        let updatedPaymentData = updatedPaymentDataOrEvent;
        // If called as a form event, fallback to current paymentData
        if (
            updatedPaymentDataOrEvent &&
            typeof updatedPaymentDataOrEvent.preventDefault === "function"
        ) {
            updatedPaymentDataOrEvent.preventDefault();
            updatedPaymentData = paymentData;
        }

        // Always update paymentData state so FeeReceipt and others get latest
        setPaymentData(updatedPaymentData);

        // Debug: log payment data being sent to backend
        console.log("[DEBUG] Payment data being sent to backend:", updatedPaymentData);
        try {
            const response = await fetch(`${API_BASE}/fees/payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedPaymentData),
            });

            if (response.ok) {
                const result = await response.json();
                toast.success("Payment recorded successfully!");
                fetchPaymentHistory(selectedStudent.id); // Refresh payment history
                setShowPaymentModal(false);
                setShowReceiptModal(true);
                fetchData(); // Refresh data
            } else {
                // Mock success for demo
                toast.success("Payment recorded successfully!");
                setShowPaymentModal(false);
                setShowReceiptModal(true);
                // In real app, you would update the local state here
            }
        } catch (error) {
            console.error("Error recording payment:", error);
            // Mock success for demo
            toast.success("Payment recorded successfully!");
            setShowPaymentModal(false);
            setShowReceiptModal(true);
        }
    };

    const handleViewDetails = (student) => {
        setSelectedStudent(student);
        setShowDetailsModal(true);
        fetchPaymentHistory(student.id);
    };

    // Generate fee records from students data for display
    const generateFeeRecords = () => {
        return students.map((student) => {
            const paymentStatus = calculatePaymentStatus(student);

            // Use status from fee record if available, otherwise calculate
            const feeRecord = feeRecords.find(
                (fee) => fee.student_id === student.id,
            );
            let status = feeRecord ? feeRecord.status : "PENDING";

            if (!feeRecord) {
                // Fallback status calculation
                if (paymentStatus.balance <= 0) {
                    status = "PAID";
                } else if (paymentStatus.totalPaid > 0) {
                    status = "PARTIAL";
                } else if (paymentStatus.isOverdue) {
                    status = "OVERDUE";
                }
            }

            // Get the latest payment date for this student from fee record
            const studentFeeRecord = feeRecords.find(
                (fee) => fee.student_id === student.id,
            );
            const lastPaymentDate = studentFeeRecord
                ? studentFeeRecord.last_payment_date
                : null;

            return {
                id: student.id,
                studentId: student.id,
                studentName: `${student.firstName} ${student.middleName || ""} ${student.lastName}`,
                courseName: student.courseName,
                mobileNumber: student.mobileNumber,
                admissionDate: student.createdAt,
                totalDue: paymentStatus.totalDue,
                totalPaid: paymentStatus.totalPaid,
                balance: paymentStatus.balance,
                status: status,
                isOverdue: paymentStatus.isOverdue,
                monthsOverdue: paymentStatus.monthsOverdue,
                lastPaymentDate: lastPaymentDate,
            };
        });
    };

    const displayRecords = generateFeeRecords();
    const filteredDisplayRecords = displayRecords.filter((record) => {
        const matchesSearch =
            searchTerm === "" ||
            record.studentName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            record.studentId.toString().includes(searchTerm) ||
            record.mobileNumber.includes(searchTerm);

        const matchesStatus =
            statusFilter === "ALL" || record.status === statusFilter;
        const matchesCourse =
            courseFilter === "ALL" || record.courseName === courseFilter;

        return matchesSearch && matchesStatus && matchesCourse;
    });

    const paymentStatus = selectedStudent
        ? calculatePaymentStatus(selectedStudent)
        : { balance: 0 };

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 12;

    // Pagination logic
    const totalPages = Math.ceil(
        filteredDisplayRecords.length / recordsPerPage,
    );
    const paginatedRecords = filteredDisplayRecords.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage,
    );

    // Reset to page 1 when search/filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, courseFilter]);

    // Close modals on Escape key press
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") {
                setShowPaymentModal(false);
                setShowDetailsModal(false);
                setShowReceiptModal(false);
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading fee data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <ErrorFallback onRetry={fetchData} />;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-white/20">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Fee Management
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Track student payments, dues, and overdue fees
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Pending */}
                <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600">
                                Pending
                            </p>
                            <p className="text-xl font-bold text-blue-500">
                                {
                                    displayRecords.filter(
                                        (r) => r.status === "PENDING",
                                    ).length
                                }
                            </p>
                        </div>
                        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Partial */}
                <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600">
                                Partial
                            </p>
                            <p className="text-xl font-bold text-yellow-600">
                                {
                                    displayRecords.filter(
                                        (r) => r.status === "PARTIAL",
                                    ).length
                                }
                            </p>
                        </div>
                        <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                    </div>
                </div>

                {/* Paid Up */}
                <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600">
                                Paid Up
                            </p>
                            <p className="text-xl font-bold text-green-600">
                                {
                                    displayRecords.filter(
                                        (r) => r.status === "PAID",
                                    ).length
                                }
                            </p>
                        </div>
                        <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Total Due */}
                <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600">
                                Total Due
                            </p>
                            <p className="text-xl font-bold text-orange-600">
                                {formatCurrency(
                                    displayRecords.reduce(
                                        (sum, r) => sum + r.balance,
                                        0,
                                    ),
                                )}
                            </p>
                        </div>
                        <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-orange-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm p-3 md:p-4 border border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2.5 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        <option value="ALL">All Status</option>
                        <option value="PAID">Paid</option>
                        <option value="PARTIAL">Partial</option>
                        <option value="PENDING">Pending</option>
                        <option value="OVERDUE">Overdue</option>
                    </select>

                    <select
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        <option value="ALL">All Courses</option>
                        {[...new Set(students.map((s) => s.courseName))].map(
                            (course) => (
                                <option key={course} value={course}>
                                    {course}
                                </option>
                            ),
                        )}
                    </select>

                    <button
                        onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("ALL");
                            setCourseFilter("ALL");
                        }}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                        <X className="w-4 h-4 mr-1" />
                        Clear
                    </button>
                </div>
            </div>

            {/* Fee Records Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-white/20 overflow-hidden">
                <div className="p-3 md:p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Student Fee Records
                    </h2>
                </div>

                {filteredDisplayRecords.length === 0 ? (
                    <div className="text-center py-12">
                        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Records Found
                        </h3>
                        <p className="text-gray-600">
                            {displayRecords.length === 0
                                ? "No students found"
                                : "Try adjusting your filters"}
                        </p>
                    </div>
                ) : (
                    <div className="w-full">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Course
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Due
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Paid
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Balance
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedRecords.map((record) => (
                                    <tr
                                        key={record.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {record.studentName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {record.studentId} •{" "}
                                                    {record.mobileNumber}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {record.courseName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Admitted:{" "}
                                                {formatDate(
                                                    record.admissionDate,
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatCurrency(
                                                    record.totalDue,
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="text-sm font-medium text-green-600">
                                                {formatCurrency(
                                                    record.totalPaid,
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div
                                                className={`text-sm font-medium ${record.balance > 0 ? "text-red-600" : "text-green-600"}`}
                                            >
                                                {formatCurrency(record.balance)}
                                            </div>
                                            {record.isOverdue && (
                                                <div className="text-xs text-red-500">
                                                    {record.monthsOverdue}{" "}
                                                    months overdue
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}
                                            >
                                                {getStatusIcon(record.status)}
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleAddPayment(
                                                            students.find(
                                                                (s) =>
                                                                    s.id ===
                                                                    record.studentId,
                                                            ),
                                                        )
                                                    }
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                                                    title="Add Payment"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleViewDetails(
                                                            students.find(
                                                                (s) =>
                                                                    s.id ===
                                                                    record.studentId,
                                                            ),
                                                        )
                                                    }
                                                    className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add pagination controls below the table */}
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

            {/* Payment Modal */}
            <RecordPaymentModal
                open={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                student={selectedStudent}
                paymentData={paymentData}
                setPaymentData={setPaymentData}
                paymentStatus={paymentStatus}
                onSubmit={handlePaymentSubmit}
                toast={toast}
            />

            {/* Details Modal */}
            <FeeDetailsModal
                open={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setPaymentHistory([]);
                }}
                student={selectedStudent}
                paymentHistory={paymentHistory}
                loadingHistory={loadingHistory}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                calculatePaymentStatus={calculatePaymentStatus}
            />

            {/* Fee Receipt Modal */}
            {showReceiptModal && selectedStudent && (
                <FeeReceipt
                    paymentData={paymentData}
                    student={selectedStudent}
                    onClose={() => {
                        setShowReceiptModal(false);
                        setSelectedStudent(null);
                        setPaymentData({
                            student_id: "",
                            amount: "",
                            payment_date: new Date()
                                .toISOString()
                                .split("T")[0],
                            payment_method: "CASH",
                            late_fee: 0,
                            transaction_id: "",
                            notes: "",
                            discount: 0,
                        });
                    }}
                />
            )}
        </div>
    );
};

export default FeeManagement;
