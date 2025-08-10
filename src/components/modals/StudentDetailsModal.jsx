import React from "react";
import { formatAadhar, formatDate } from "../utils.jsx";
import { Edit2, KeyRound, X } from "lucide-react";

const StudentDetailsModal = ({
    selectedAdmission,
    onClose,
    API_BASE,
    onEdit,
    onCredentials,
}) => {
    if (!selectedAdmission) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-sm max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Student Details - #{selectedAdmission.id}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Personal Information */}
                        <div className="bg-blue-50 p-6 rounded-2xl">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2 text-blue-600 text-sm">
                                    1
                                </span>
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Full Name:
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        {selectedAdmission.firstName}{" "}
                                        {selectedAdmission.middleName}{" "}
                                        {selectedAdmission.lastName}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Date of Birth:
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        {selectedAdmission.dateOfBirth}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Gender:
                                    </span>
                                    <p className="font-medium text-gray-900 capitalize">
                                        {selectedAdmission.gender}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Marital Status:
                                    </span>
                                    <p className="font-medium text-gray-900 capitalize">
                                        {selectedAdmission.maritalStatus}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Mother Tongue:
                                    </span>
                                    <p className="font-medium text-gray-900 capitalize">
                                        {selectedAdmission.motherTongue}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Aadhar Number:
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        {formatAadhar(
                                            selectedAdmission.aadharNumber,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Uploaded Documents */}
                        <div className="bg-pink-50 p-6 rounded-2xl">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="w-6 h-6 bg-pink-100 rounded-lg flex items-center justify-center mr-2 text-pink-600 text-sm">
                                    2
                                </span>
                                Uploaded Documents
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Photo:
                                    </span>
                                    <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden w-40 h-40">
                                        <img
                                            src={`${API_BASE.replace("/api", "")}/uploads/${selectedAdmission.photoFilename}`}
                                            alt="Student Photo"
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Signature:
                                    </span>
                                    <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden w-40 h-20">
                                        <img
                                            src={`${API_BASE.replace("/api", "")}/uploads/${selectedAdmission.signatureFilename}`}
                                            alt="Signature"
                                            className="object-contain w-full h-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="bg-green-50 p-6 rounded-2xl">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2 text-green-600 text-sm">
                                    3
                                </span>
                                Address Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <span className="text-sm text-gray-500">
                                        Address:
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        {
                                            selectedAdmission.correspondenceAddress
                                        }
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        City:
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        {selectedAdmission.city}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        District:
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        {selectedAdmission.district}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        State:
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        {selectedAdmission.state}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-yellow-50 p-6 rounded-2xl">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center mr-2 text-yellow-600 text-sm">
                                    4
                                </span>
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Mobile Number:
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        +91 {selectedAdmission.mobileNumber}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Alternate Mobile:
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        {selectedAdmission.alternateMobileNumber
                                            ? `+91 ${selectedAdmission.alternateMobileNumber}`
                                            : "Not provided"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Joined WhatsApp:
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        {selectedAdmission.joinedWhatsApp
                                            ? "Yes"
                                            : "No"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Course & Admission Information */}
                        <div className="bg-purple-50 p-6 rounded-2xl">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2 text-purple-600 text-sm">
                                    5
                                </span>
                                Course & Admission Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Course Name:
                                    </span>{" "}
                                    <p className="font-medium text-gray-900 capitalize">
                                        {selectedAdmission.courseName?.replace(
                                            "-",
                                            " ",
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Certificate Name:
                                    </span>
                                    <p className="font-medium text-gray-900 capitalize">
                                        {selectedAdmission.certificateName}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Category:
                                    </span>
                                    <p className="font-medium text-gray-900 capitalize">
                                        {selectedAdmission.category}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Educational Qualification:
                                    </span>
                                    <p className="font-medium text-gray-900 capitalize">
                                        {
                                            selectedAdmission.educationalQualification
                                        }
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Preferred Timing:
                                    </span>
                                    <p className="font-medium text-gray-900 capitalize">
                                        {selectedAdmission.timing}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Referred By:
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        {selectedAdmission.referredBy ||
                                            "Not provided"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submission Details */}
                        <div className="bg-gray-50 p-6 rounded-2xl">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Submission Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Admission Date:
                                    </span>
                                    <p className="font-medium text-gray-900">
                                        {formatDate(
                                            selectedAdmission.createdAt,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={onEdit}
                            className="bg-yellow-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 justify-center"
                        >
                            <Edit2 className="w-5 h-5 mr-2" />
                            Edit
                        </button>
                        <button
                            onClick={onCredentials}
                            className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 justify-center"
                        >
                            <KeyRound className="w-5 h-5 mr-2" />
                            Credentials
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm hover:shadow-sm flex items-center gap-2 justify-center"
                        >
                            <X className="w-5 h-5 mr-2" />
                            Close Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailsModal;
