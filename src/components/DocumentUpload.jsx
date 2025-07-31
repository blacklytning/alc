import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
    Upload,
    FileText,
    X,
    Eye,
    Download,
    Search,
    CheckCircle,
    Trash2,
    ChevronDown,
    User,
} from "lucide-react";
import ErrorFallback from "./ErrorFallback";
import { formatDate, getStatusColor, getStatusIcon } from "./utils.jsx";
import DocumentPreviewModal from "./modals/DocumentPreviewModal";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal";

// Searchable Student Selector Component
const StudentSelector = ({
    students,
    selectedStudent,
    onStudentSelect,
    error,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredStudents, setFilteredStudents] = useState(students);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Filter students based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredStudents(students);
        } else {
            const filtered = students.filter((student) => {
                const fullName =
                    `${student.firstName} ${student.lastName}`.toLowerCase();
                const searchLower = searchTerm.toLowerCase();
                return (
                    fullName.includes(searchLower) ||
                    student.id.toString().includes(searchLower) ||
                    student.courseName?.toLowerCase().includes(searchLower) ||
                    student.email?.toLowerCase().includes(searchLower) ||
                    student.phone?.includes(searchTerm)
                );
            });
            setFilteredStudents(filtered);
        }
    }, [searchTerm, students]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleStudentSelect = (student) => {
        onStudentSelect(student);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student *
            </label>

            {/* Selected Student Display / Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${error
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    } ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
            >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {selectedStudent ? (
                        <>
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {selectedStudent.firstName}{" "}
                                    {selectedStudent.lastName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    ID: {selectedStudent.id} •{" "}
                                    {selectedStudent.courseName}
                                </p>
                            </div>
                        </>
                    ) : (
                        <span className="text-gray-500">
                            Select a student...
                        </span>
                    )}
                </div>
                <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </div>

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search students by name, ID, course, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Students List */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredStudents.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">
                                    {searchTerm
                                        ? "No students found matching your search"
                                        : "No students available"}
                                </p>
                            </div>
                        ) : (
                            filteredStudents.map((student) => (
                                <div
                                    key={student.id}
                                    onClick={() => handleStudentSelect(student)}
                                    className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${selectedStudent?.id === student.id
                                            ? "bg-blue-50 border-blue-200"
                                            : ""
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {student.firstName}{" "}
                                                    {student.lastName}
                                                </p>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                    ID: {student.id}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-4 mt-1">
                                                <p className="text-xs text-gray-500 truncate">
                                                    {student.courseName}
                                                </p>
                                                {student.email && (
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {student.email}
                                                    </p>
                                                )}
                                                {student.phone && (
                                                    <p className="text-xs text-gray-500">
                                                        {student.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {selectedStudent?.id === student.id && (
                                            <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Results Count */}
                    {searchTerm && (
                        <div className="p-2 bg-gray-50 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                                {filteredStudents.length} student
                                {filteredStudents.length !== 1 ? "s" : ""} found
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const DocumentUpload = () => {
    const [students, setStudents] = useState([]);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [previewFile, setPreviewFile] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const fileInputRef = useRef(null);

    const API_BASE = import.meta.env.VITE_API_URL;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            student_id: "",
            document_type: "SIGNED_ADMISSION_FORM",
            notes: "",
            file: null,
        },
    });

    const watchedFile = watch("file");

    // Fetch students and uploaded documents
    const fetchData = async () => {
        setError(null);
        try {
            setLoading(true);

            const [studentsResponse, documentsResponse] = await Promise.all([
                fetch(`${API_BASE}/admissions`).catch(() => ({ ok: false })),
                fetch(`${API_BASE}/documents/uploaded`).catch(() => ({
                    ok: false,
                })),
            ]);

            if (!studentsResponse.ok) {
                setError("Failed to load data. Please check your connection.");
                return;
            }

            const studentsData = await studentsResponse.json();
            setStudents(studentsData.admissions || []);

            if (documentsResponse.ok) {
                const documentsData = await documentsResponse.json();
                setUploadedDocuments(documentsData.documents || []);
            } else {
                setUploadedDocuments([]);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load data. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle student selection
    const handleStudentSelect = (student) => {
        setSelectedStudent(student);
        setValue("student_id", student.id);
    };

    // Handle file selection and preview
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "application/pdf",
            ];
            if (!allowedTypes.includes(file.type)) {
                toast.error("Please select a valid file (JPG, PNG, or PDF)");
                return;
            }

            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size should be less than 10MB");
                return;
            }

            setValue("file", file);

            // Create preview for images
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviewFile({
                        type: "image",
                        url: e.target.result,
                        name: file.name,
                        size: file.size,
                    });
                };
                reader.readAsDataURL(file);
            } else if (file.type === "application/pdf") {
                setPreviewFile({
                    type: "pdf",
                    url: URL.createObjectURL(file),
                    name: file.name,
                    size: file.size,
                });
            }
        }
    };

    // Remove selected file
    const removeFile = () => {
        setValue("file", null);
        setPreviewFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Handle form submission
    const onSubmit = async (data) => {
        if (!data.file) {
            toast.error("Please select a file to upload");
            return;
        }

        if (!selectedStudent) {
            toast.error("Please select a student");
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append("student_id", data.student_id);
            formData.append("document_type", data.document_type);
            formData.append("notes", data.notes || "");
            formData.append("file", data.file);

            const response = await fetch(`${API_BASE}/documents/upload`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                toast.success("Document uploaded successfully!");
                reset();
                setPreviewFile(null);
                setSelectedStudent(null);
                fetchData(); // Refresh the documents list
            } else {
                const errorData = await response.json();
                toast.error(errorData.detail || "Failed to upload document");
            }
        } catch (error) {
            console.error("Error uploading document:", error);
            toast.error("Failed to upload document. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    // Handle document deletion
    const handleDeleteDocument = (documentId) => {
        setDocumentToDelete(documentId);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteDocument = async () => {
        if (!documentToDelete) return;

        try {
            const response = await fetch(
                `${API_BASE}/documents/${documentToDelete}`,
                {
                    method: "DELETE",
                },
            );

            if (response.ok) {
                toast.success("Document deleted successfully!");
                fetchData(); // Refresh the list
            } else {
                const errorData = await response.json();
                toast.error(errorData.detail || "Failed to delete document");
            }
        } catch (error) {
            console.error("Error deleting document:", error);
            toast.error("Failed to delete document");
        } finally {
            setShowDeleteConfirm(false);
            setDocumentToDelete(null);
        }
    };

    // Filter documents
    const filteredDocuments = uploadedDocuments.filter((doc) => {
        const matchesSearch =
            doc.student_name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            doc.student_id?.toString().includes(searchTerm) ||
            doc.document_type?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "ALL" || doc.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) +
            " " +
            sizes[i]
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        Loading document upload system...
                    </p>
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
                        Document Upload
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Upload signed admission forms and other documents
                    </p>
                </div>
            </div>

            {/* Upload Form */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-white/20">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Upload className="w-6 h-6 mr-3 text-blue-600" />
                    Upload New Document
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Student Selection */}
                        <StudentSelector
                            students={students}
                            selectedStudent={selectedStudent}
                            onStudentSelect={handleStudentSelect}
                            error={errors.student_id?.message}
                        />

                        {/* Document Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Document Type *
                            </label>
                            <select
                                {...register("document_type", {
                                    required: "Please select document type",
                                })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            >
                                <option value="SIGNED_ADMISSION_FORM">
                                    Signed Admission Form
                                </option>
                                <option value="IDENTITY_PROOF">
                                    Identity Proof
                                </option>
                                <option value="ADDRESS_PROOF">
                                    Address Proof
                                </option>
                                <option value="EDUCATIONAL_CERTIFICATE">
                                    Educational Certificate
                                </option>
                                <option
                                    value="FINAL_CERTIFICATE"
                                    style={{ color: "red" }}
                                >
                                    Final Certificate
                                </option>
                                <option value="OTHER">Other Document</option>
                            </select>
                            {errors.document_type && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.document_type.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Document *
                        </label>

                        {!previewFile ? (
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                        <Upload className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-gray-600 font-medium">
                                            Click to upload document
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            JPG, PNG, or PDF up to 10MB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium text-gray-900">
                                        Selected File
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {previewFile.type === "image" ? (
                                    <div className="space-y-3">
                                        <img
                                            src={
                                                previewFile.url ||
                                                "/placeholder.svg"
                                            }
                                            alt="Preview"
                                            className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
                                        />
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-gray-900">
                                                {previewFile.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatFileSize(
                                                    previewFile.size,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <FileText className="w-8 h-8 text-red-500" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {previewFile.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatFileSize(
                                                    previewFile.size,
                                                )}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowPreview(true)}
                                            className="text-blue-600 hover:text-blue-800 p-1"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                            className="hidden"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            {...register("notes")}
                            rows={3}
                            placeholder="Add any additional notes about this document..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={
                                uploading || !watchedFile || !selectedStudent
                            }
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    <span>Upload Document</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Uploaded Documents List */}
            <div className="bg-white rounded-2xl shadow-sm border border-white/20">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                            <FileText className="w-6 h-6 mr-3 text-blue-600" />
                            Uploaded Documents ({filteredDocuments.length})
                        </h2>

                        {/* Search and Filter */}
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="ALL">All Status</option>
                                <option value="UPLOADED">Uploaded</option>
                                <option value="PENDING">Pending</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {filteredDocuments.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Documents Found
                        </h3>
                        <p className="text-gray-600">
                            {uploadedDocuments.length === 0
                                ? "No documents have been uploaded yet."
                                : "Try adjusting your search or filter criteria."}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredDocuments.map((doc) => (
                            <div
                                key={doc.id}
                                className="p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">
                                                    {doc.student_name} -{" "}
                                                    {doc.document_type.replace(
                                                        /_/g,
                                                        " ",
                                                    )}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    Student ID: {doc.student_id}{" "}
                                                    • Uploaded:{" "}
                                                    {formatDate(doc.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}
                                            >
                                                {getStatusIcon(doc.status)}
                                                {doc.status}
                                            </span>
                                            <span>
                                                Size:{" "}
                                                {formatFileSize(doc.file_size)}
                                            </span>
                                            {doc.notes && (
                                                <span>Notes: {doc.notes}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() =>
                                                window.open(
                                                    `${API_BASE.replace("/api", "")}/uploads/documents/${doc.filename}`,
                                                    "_blank",
                                                )
                                            }
                                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                                            title="View Document"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const link =
                                                    document.createElement("a");
                                                link.href = `${API_BASE.replace("/api", "")}/uploads/documents/${doc.filename}`;
                                                link.download =
                                                    doc.original_filename;
                                                link.click();
                                            }}
                                            className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-100 transition-colors"
                                            title="Download Document"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteDocument(doc.id)
                                            }
                                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-100 transition-colors"
                                            title="Delete Document"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* PDF Preview Modal */}
            <DocumentPreviewModal
                showPreview={showPreview}
                previewFile={previewFile}
                onClose={() => setShowPreview(false)}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={showDeleteConfirm}
                onConfirm={confirmDeleteDocument}
                onCancel={() => {
                    setShowDeleteConfirm(false);
                    setDocumentToDelete(null);
                }}
                title="Delete Document"
                message="Are you sure you want to delete this document? This action cannot be undone."
                itemName="document"
            />
        </div>
    );
};

export default DocumentUpload;
