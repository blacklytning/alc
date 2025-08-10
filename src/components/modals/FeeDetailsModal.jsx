import React from "react";
import { X, Calendar } from "lucide-react";
import { formatDate, formatCurrency } from "../utils.jsx";

const FeeDetailsModal = ({
    open,
    onClose,
    student,
    paymentHistory,
    loadingHistory,
    calculatePaymentStatus,
}) => {
    if (!open || !student) return null;
    const paymentStatus = calculatePaymentStatus(student);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-sm max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Fee Details
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Student Info */}
                        <div className="bg-blue-50 p-6 rounded-xl">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Student Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Name:
                                    </span>
                                    <p className="font-medium">
                                        {student.firstName}{" "}
                                        {student.middleName || ""}{" "}
                                        {student.lastName}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Course:
                                    </span>
                                    <p className="font-medium">
                                        {student.courseName}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Mobile:
                                    </span>
                                    <p className="font-medium">
                                        {student.mobileNumber}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Admission Date:
                                    </span>
                                    <p className="font-medium">
                                        {formatDate(student.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="bg-green-50 p-6 rounded-xl">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Payment Summary
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Total Due:
                                    </span>
                                    <p className="text-xl font-bold text-blue-600">
                                        {formatCurrency(paymentStatus.totalDue)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Total Paid:
                                    </span>
                                    <p className="text-xl font-bold text-green-600">
                                        {formatCurrency(
                                            paymentStatus.totalPaid,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Balance:
                                    </span>
                                    <p
                                        className={`text-xl font-bold ${paymentStatus.balance > 0 ? "text-red-600" : "text-green-600"}`}
                                    >
                                        {formatCurrency(paymentStatus.balance)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Payment History */}
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Payment History
                            </h3>
                            {loadingHistory ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    <p className="text-gray-600">
                                        Loading payment history...
                                    </p>
                                </div>
                            ) : paymentHistory.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No payment history available</p>
                                    <p className="text-sm mt-1">
                                        Payments will appear here once recorded
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {paymentHistory.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="bg-white p-4 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-lg font-semibold text-green-600">
                                                            {formatCurrency(
                                                                payment.amount,
                                                            )}
                                                        </span>
                                                        <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                                            {
                                                                payment.payment_method
                                                            }
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-1">
                                                        Date: {" "}
                                                        {formatDate(
                                                            payment.payment_date,
                                                        )}
                                                    </p>
                                                    {payment.transaction_id && (
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            Transaction ID: {" "}
                                                            {
                                                                payment.transaction_id
                                                            }
                                                        </p>
                                                    )}
                                                                                                        {/* Cheque details for cheque payments */}
                                                                                                        {payment.payment_method === "CHEQUE" && (
                                                                                                            <>
                                                                                                                {payment.cheque_number && (
                                                                                                                    <p className="text-sm text-gray-600 mb-1">
                                                                                                                        Cheque Number: {payment.cheque_number}
                                                                                                                    </p>
                                                                                                                )}
                                                                                                                {payment.bank_name && (
                                                                                                                    <p className="text-sm text-gray-600 mb-1">
                                                                                                                        Bank Name: {payment.bank_name}
                                                                                                                    </p>
                                                                                                                )}
                                                                                                            </>
                                                                                                        )}
                                                    {payment.notes && (
                                                        <p className="text-sm text-gray-600">
                                                            Notes: {" "}
                                                            {payment.notes}
                                                        </p>
                                                    )}
                                                    {/* Denomination breakdown for cash payments */}
                                                    {Array.isArray(payment.denominations) && payment.denominations.length > 0 && (
                                                      <div className="mt-2 text-sm text-gray-800">
                                                        <span className="font-semibold">Denomination Breakdown:</span>
                                                        <ul className="list-disc ml-6 mt-1">
                                                          {payment.denominations.map((d, idx) => (
                                                            <li key={d.value}>
                                                              ₹{d.value} x {d.count}
                                                              {d.value === 500 && d.serials && d.serials.length > 0 ? (
                                                                <ul className="list-none ml-4 text-xs text-gray-600">
                                                                  {d.serials.map((serial, sidx) => (
                                                                    <li key={serial}>Serial #{sidx + 1}: {serial}</li>
                                                                  ))}
                                                                </ul>
                                                              ) : null}
                                                            </li>
                                                          ))}
                                                        </ul>
                                                      </div>
                                                    )}
                                                </div>
                                                {payment.late_fee > 0 && (
                                                    <div className="text-sm text-red-600">
                                                        Late Fee: {" "}
                                                        {formatCurrency(
                                                            payment.late_fee,
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={onClose}
                            className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeeDetailsModal;
