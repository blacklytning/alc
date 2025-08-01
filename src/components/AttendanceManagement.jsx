import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    CheckCircle,
    XCircle,
    Users,
    Filter,
    Save,
    RefreshCw,
    Calendar,
    AlertCircle,
} from "lucide-react";

const AttendanceManagement = () => {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState("");
    const [date, setDate] = useState(() =>
        new Date().toISOString().slice(0, 10),
    );
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Attendance history state
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL", "PRESENT", "ABSENT"

    // Defaulters state
    const [defaulters, setDefaulters] = useState([]);
    const [checkingDefaulters, setCheckingDefaulters] = useState(false);

    const API_BASE = import.meta.env.VITE_API_URL;

    // Fetch batches on mount
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const response = await fetch(`${API_BASE}/admissions`);
                if (response.ok) {
                    const data = await response.json();
                    const batchSet = new Set(
                        (data.admissions || []).map((s) => s.timing),
                    );
                    setBatches([...batchSet].filter(Boolean));
                }
            } catch (error) {
                console.error("Error fetching batches:", error);
                toast.error("Failed to fetch batches");
            }
        };
        fetchBatches();
    }, [API_BASE]);

    // Fetch students for selected batch
    const fetchStudents = async () => {
        if (!selectedBatch) {
            setStudents([]);
            setAttendance({});
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/admissions`);
            if (response.ok) {
                const data = await response.json();
                const filteredStudents = (data.admissions || []).filter(
                    (s) => s.timing === selectedBatch,
                );
                setStudents(filteredStudents);
                const att = {};
                filteredStudents.forEach((s) => (att[s.id] = "PRESENT"));
                setAttendance(att);
            } else {
                toast.error("Failed to fetch students");
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to fetch students");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
        // eslint-disable-next-line
    }, [selectedBatch, API_BASE]);

    // Mark all present
    const markAllPresent = () => {
        const att = {};
        students.forEach((s) => (att[s.id] = "PRESENT"));
        setAttendance(att);
        toast.success("All students marked as present");
    };

    // Mark all absent
    const markAllAbsent = () => {
        const att = {};
        students.forEach((s) => (att[s.id] = "ABSENT"));
        setAttendance(att);
        toast.success("All students marked as absent");
    };

    // Toggle present/absent
    const toggleAttendance = (student_id) => {
        setAttendance((prev) => ({
            ...prev,
            [student_id]: prev[student_id] === "ABSENT" ? "PRESENT" : "ABSENT",
        }));
    };

    // Refresh students
    const handleRefresh = () => {
        fetchStudents();
        toast.success("Student list refreshed!");
    };

    // Submit attendance
    const handleSubmit = async () => {
        if (!selectedBatch || students.length === 0) {
            toast.error("Please select a batch and ensure students are loaded");
            return;
        }
        setSaving(true);
        try {
            const records = students.map((s) => ({
                student_id: s.id,
                date,
                batch_timing: selectedBatch,
                status: attendance[s.id] || "PRESENT",
            }));
            const response = await fetch(`${API_BASE}/attendance/mark`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(records),
            });
            if (response.ok) {
                toast.success("Attendance saved successfully!");
                // Also refresh attendance history after marking
                fetchAttendanceHistory();
            } else {
                const errorData = await response.json();
                toast.error(errorData.detail || "Failed to save attendance");
            }
        } catch (error) {
            console.error("Error saving attendance:", error);
            toast.error("Failed to save attendance");
        } finally {
            setSaving(false);
        }
    };

    // Fetch attendance history for the selected date and batch
    const fetchAttendanceHistory = async () => {
        if (!selectedBatch || !date) {
            setAttendanceHistory([]);
            return;
        }
        setHistoryLoading(true);
        try {
            const response = await fetch(
                `${API_BASE}/attendance/by-date?date_str=${date}&batch_timing=${encodeURIComponent(selectedBatch)}`,
            );
            if (response.ok) {
                const data = await response.json();
                setAttendanceHistory(data.attendance || []);
            } else {
                setAttendanceHistory([]);
                toast.error("Failed to fetch attendance history");
            }
        } catch (error) {
            setAttendanceHistory([]);
            toast.error("Failed to fetch attendance history");
        } finally {
            setHistoryLoading(false);
        }
    };

    // Fetch attendance history when batch/date changes
    useEffect(() => {
        fetchAttendanceHistory();
        // eslint-disable-next-line
    }, [selectedBatch, date, API_BASE]);

    // Filtering attendance history
    const filteredAttendanceHistory =
        statusFilter === "ALL"
            ? attendanceHistory
            : attendanceHistory.filter(
                  (record) => record.status === statusFilter,
              );

    // Badge component for status
    const StatusBadge = ({ status }) => {
        if (status === "PRESENT")
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Present
                </span>
            );
        if (status === "ABSENT")
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Absent
                </span>
            );
        return <span>{status}</span>;
    };

    // --------- Defaulters logic (frontend only) ----------
    const fetchDefaulters = async () => {
        if (!selectedBatch || students.length === 0) {
            setDefaulters([]);
            return;
        }
        setCheckingDefaulters(true);
        const result = [];
        for (const student of students) {
            try {
                const res = await fetch(
                    `${API_BASE}/attendance/student/${student.id}`,
                );
                if (res.ok) {
                    const data = await res.json();
                    // Sort by date ascending
                    const sorted = [...(data.attendance || [])].sort((a, b) =>
                        a.date.localeCompare(b.date),
                    );
                    // Find max consecutive absences
                    let maxStreak = 0;
                    let currentStreak = 0;
                    let streakDates = [];
                    let tempStreakDates = [];
                    for (const record of sorted) {
                        if (record.status === "ABSENT") {
                            currentStreak++;
                            tempStreakDates.push(record.date);
                            if (currentStreak > maxStreak) {
                                maxStreak = currentStreak;
                                streakDates = [...tempStreakDates];
                            }
                        } else {
                            currentStreak = 0;
                            tempStreakDates = [];
                        }
                    }
                    if (maxStreak >= 3) {
                        result.push({
                            ...student,
                            absentStreak: maxStreak,
                            absentDates: streakDates,
                        });
                    }
                }
            } catch (e) {
                // ignore error for single student
            }
        }
        setDefaulters(result);
        setCheckingDefaulters(false);
    };

    // Option: Automatically check for defaulters when students list changes
    useEffect(() => {
        if (selectedBatch) {
            fetchDefaulters();
        } else {
            setDefaulters([]);
        }
        // eslint-disable-next-line
    }, [students, selectedBatch]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-sm p-8 border border-white/20 mb-6">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Attendance Management
                        </h1>
                        <p className="text-gray-700 text-base font-medium">
                            Mark and manage daily student attendance by batch
                        </p>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap">
                        <div className="flex flex-1 gap-3 items-center">
                            {/* Batch select with Filter icon inside */}
                            <div className="relative w-full max-w-xs min-w-[180px]">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Filter className="w-5 h-5 text-gray-500" />
                                </span>
                                <select
                                    value={selectedBatch}
                                    onChange={(e) =>
                                        setSelectedBatch(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm h-12 min-w-[120px]"
                                >
                                    <option value="">Select Batch</option>
                                    {batches.map((batch) => (
                                        <option key={batch} value={batch}>
                                            {batch}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Date picker with calendar icon */}
                            <div className="relative w-full max-w-xs min-w-[180px]">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                </span>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full pl-10 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm h-12 min-w-[120px]"
                                />
                            </div>
                            {/* Total badge beside date */}
                            {selectedBatch && (
                                <div className="inline-flex items-center gap-2 bg-blue-50/80 border border-blue-100 rounded-xl px-4 py-3 text-sm font-medium text-blue-900 h-12">
                                    <Users className="w-4 h-4 text-blue-500" />
                                    <span>
                                        Total:{" "}
                                        <span className="font-semibold">
                                            {students.length}
                                        </span>
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                            <button
                                onClick={markAllPresent}
                                disabled={
                                    !selectedBatch || students.length === 0
                                }
                                className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-green-600 transition-all duration-200 flex items-center gap-2 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Mark All Present
                            </button>
                            <button
                                onClick={markAllAbsent}
                                disabled={
                                    !selectedBatch || students.length === 0
                                }
                                className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-red-600 transition-all duration-200 flex items-center gap-2 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <XCircle className="w-5 h-5" />
                                Mark All Absent
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={
                                    saving ||
                                    !selectedBatch ||
                                    students.length === 0
                                }
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-5 h-5" />
                                {saving ? "Saving..." : "Save Attendance"}
                            </button>
                            <button
                                onClick={handleRefresh}
                                disabled={!selectedBatch}
                                className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold border border-gray-200 transition-all duration-200 ease-in-out h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Refresh Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* Attendance List */}
                {loading ? (
                    <div className="bg-white/80 backdrop-bl-xs rounded-2xl shadow-sm border border-white/20 text-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading students...</p>
                    </div>
                ) : !selectedBatch ? (
                    <div className="bg-white rounded-3xl shadow-sm p-8 border border-white/20 mb-6">
                        <div className="text-center py-12">
                            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Select a Batch
                            </h3>
                            <p className="text-gray-600">
                                Please select a batch to view and mark
                                attendance.
                            </p>
                        </div>
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No Students Found
                        </h3>
                        <p className="text-gray-600">
                            No students found for the selected batch.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                            {students.map((student) => (
                                <div
                                    key={student.id}
                                    className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center transition-all duration-200 h-full ${attendance[student.id] === "ABSENT" ? "ring-2 ring-red-300" : "ring-2 ring-green-200"}`}
                                    style={{ minHeight: "280px" }}
                                >
                                    <img
                                        src={`${API_BASE.replace("/api", "")}/uploads/${student.photoFilename}`}
                                        alt={
                                            student.firstName +
                                            " " +
                                            student.lastName
                                        }
                                        className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-white shadow-sm"
                                        onError={(e) => {
                                            e.target.src =
                                                "https://via.placeholder.com/80x80?text=No+Photo";
                                        }}
                                    />
                                    <div className="text-base font-semibold text-gray-900 text-center mb-1 min-h-[2rem] flex items-center justify-center">
                                        {student.firstName}{" "}
                                        {student.middleName && (
                                            <> {student.middleName} </>
                                        )}
                                        {student.lastName}
                                    </div>
                                    <p className="text-xs text-gray-600 mb-3 text-center flex items-center gap-1">
                                        {student.timing}
                                    </p>
                                    <div className="mt-auto w-full flex justify-center">
                                        <button
                                            onClick={() =>
                                                toggleAttendance(student.id)
                                            }
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 w-full max-w-[120px] justify-center ${attendance[student.id] === "ABSENT" ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-500 text-white hover:bg-green-600"}`}
                                        >
                                            {attendance[student.id] ===
                                            "ABSENT" ? (
                                                <XCircle className="w-5 h-5" />
                                            ) : (
                                                <CheckCircle className="w-5 h-5" />
                                            )}
                                            {attendance[student.id] === "ABSENT"
                                                ? "Absent"
                                                : "Present"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* --- Defaulters Section --- */}
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-red-700 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        Defaulters (3+ Consecutive Absences)
                    </h2>
                    {checkingDefaulters ? (
                        <div>Checking for defaulters...</div>
                    ) : defaulters.length > 0 ? (
                        <ul>
                            {defaulters.map((student) => (
                                <li
                                    key={student.id}
                                    className="text-red-800 text-sm font-semibold flex items-center gap-2 mb-1"
                                >
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    {student.firstName}{" "}
                                    {student.middleName && (
                                        <> {student.middleName} </>
                                    )}
                                    {student.lastName}
                                    <span className="ml-2 text-xs text-red-700 bg-red-100 rounded-full px-2 py-0.5 font-normal">
                                        {student.absentStreak} days:{" "}
                                        {student.absentDates.join(", ")}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-sm text-gray-600">
                            No defaulters found.
                        </div>
                    )}
                </div>

                {/* --- Attendance History Section --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
                        <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                            <Calendar className="w-7 h-7 text-blue-500" />
                            Attendance History
                        </h2>
                        <div className="flex gap-2 mt-2 md:mt-0">
                            <button
                                className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                                    statusFilter === "ALL"
                                        ? "bg-blue-500 text-white border-blue-500"
                                        : "bg-white text-gray-700 border-gray-200 hover:bg-blue-50"
                                }`}
                                onClick={() => setStatusFilter("ALL")}
                            >
                                All
                            </button>
                            <button
                                className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                                    statusFilter === "PRESENT"
                                        ? "bg-green-500 text-white border-green-500"
                                        : "bg-white text-gray-700 border-gray-200 hover:bg-green-50"
                                }`}
                                onClick={() => setStatusFilter("PRESENT")}
                            >
                                <CheckCircle className="w-4 h-4 inline-block mr-1" />
                                Present
                            </button>
                            <button
                                className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                                    statusFilter === "ABSENT"
                                        ? "bg-red-500 text-white border-red-500"
                                        : "bg-white text-gray-700 border-gray-200 hover:bg-red-50"
                                }`}
                                onClick={() => setStatusFilter("ABSENT")}
                            >
                                <AlertCircle className="w-4 h-4 inline-block mr-1" />
                                Absent
                            </button>
                        </div>
                    </div>
                    {historyLoading ? (
                        <div>Loading attendance history...</div>
                    ) : !selectedBatch ? (
                        <div>
                            Please select a batch and date to view history.
                        </div>
                    ) : filteredAttendanceHistory.length === 0 ? (
                        <div>
                            No attendance records for this date and batch.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm text-gray-600">
                                            Student Name
                                        </th>
                                        <th className="px-4 py-2 text-left text-sm text-gray-600">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAttendanceHistory.map((record) => (
                                        <tr key={record.student_id}>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                <span className="font-medium">
                                                    {record.firstName}
                                                </span>
                                                {record.middleName && (
                                                    <span className="ml-1">
                                                        {record.middleName}
                                                    </span>
                                                )}
                                                <span className="ml-1">
                                                    {record.lastName}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <StatusBadge
                                                    status={record.status}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceManagement;
