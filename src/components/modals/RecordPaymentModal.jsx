import React, { useState } from "react";
import { X, Save } from "lucide-react";

// Denominations: 500, 200, 100, 50, 20, 10 ONLY
const denominationValues = [500, 200, 100, 50, 20, 10];

const RecordPaymentModal = ({
    open,
    onClose,
    student,
    paymentData,
    setPaymentData,
    paymentStatus,
    onSubmit,
    toast,
}) => {
    // Denominations state for cash
    const [denominations, setDenominations] = useState(
        denominationValues.map((value) => ({
            value,
            count: "",
            serials: value === 500 ? [""] : [],
        })),
    );

    // Cheque details state
    const [chequeDetails, setChequeDetails] = useState({
        cheque_number: "",
        bank_name: "",
    });

    // When amount, late_fee, or discount changes, reset denominations
    React.useEffect(() => {
        setDenominations(
            denominationValues.map((value) => ({
                value,
                count: "",
                serials: value === 500 ? [""] : [],
            })),
        );
    }, [paymentData.amount, paymentData.late_fee, paymentData.discount, open]);

    if (!open || !student) return null;

    // Calculate total cash entered
    const cashTotal = denominations.reduce(
        (sum, d) => sum + (parseInt(d.count, 10) || 0) * d.value,
        0,
    );

    // Calculate expected cash total: amount + late fee - discount
    const expectedCashTotal =
        (parseInt(paymentData.amount, 10) || 0) +
        (parseFloat(paymentData.late_fee) || 0) -
        (parseInt(paymentData.discount, 10) || 0);

    // Handler for denomination count
    const handleDenominationChange = (idx, count) => {
        setDenominations((prev) =>
            prev.map((d, i) =>
                i === idx
                    ? {
                          ...d,
                          count,
                          serials:
                              d.value === 500
                                  ? Array.from(
                                        { length: parseInt(count) || 0 },
                                        (_, i) => d.serials[i] || "",
                                    )
                                  : [],
                      }
                    : d,
            ),
        );
    };

    // Handler for 500 note serial numbers (autocapitalize any letters)
    const handleSerialChange = (denIdx, serialIdx, serial) => {
        setDenominations((prev) =>
            prev.map((d, i) =>
                i === denIdx
                    ? {
                          ...d,
                          serials: d.serials.map((s, j) =>
                              j === serialIdx ? serial.toUpperCase() : s,
                          ),
                      }
                    : d,
            ),
        );
    };

    // Handler for cheque details
    const handleChequeDetailChange = (field, value) => {
        setChequeDetails((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Custom submit handler to include denominations/cheque details
    const customSubmit = (e) => {
        e.preventDefault();
        if (
            paymentData.payment_method === "CASH" &&
            cashTotal !== expectedCashTotal
        ) {
            toast &&
                toast.error(
                    `Denomination total (${cashTotal}) does not match the expected total (${expectedCashTotal}).`,
                );
            return;
        }
        let updatedData = { ...paymentData };
        if (paymentData.payment_method === "CHEQUE") {
            updatedData = { ...updatedData, ...chequeDetails };
        }
        if (paymentData.payment_method === "CASH") {
            updatedData = {
                ...updatedData,
                denominations: denominations
                    .filter((d) => d.count && parseInt(d.count))
                    .map((d) => ({
                        value: d.value,
                        count: parseInt(d.count),
                        serials: d.serials,
                    })),
            };
        }
        onSubmit(updatedData);
    };

    // For rendering serials in rows of 4
    function render500SerialInputs(serials) {
        const rows = [];
        for (let i = 0; i < serials.length; i += 4) {
            rows.push(
                <div className="flex gap-3 mt-3" key={`serial-row-${i}`}>
                    {serials.slice(i, i + 4).map((serial, idx) => (
                        <input
                            key={i + idx}
                            type="text"
                            value={serial}
                            onChange={(e) =>
                                handleSerialChange(0, i + idx, e.target.value)
                            }
                            className="w-30 px-2 py-2 border border-gray-200 rounded"
                            placeholder={`Serial #${i + idx + 1}`}
                        />
                    ))}
                </div>,
            );
        }
        return rows;
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Record Payment
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-medium text-gray-900">
                            {student.firstName} {student.middleName || ""}{" "}
                            {student.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                            Course: {student.courseName} • Mobile:{" "}
                            {student.mobileNumber}
                        </p>
                    </div>
                    <form onSubmit={customSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount *
                                </label>
                                <input
                                    type="number"
                                    value={paymentData.amount}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(
                                            /[^0-9]/g,
                                            "",
                                        );
                                        if (
                                            Number(value) >
                                            paymentStatus.balance
                                        ) {
                                            value = paymentStatus.balance;
                                            toast &&
                                                toast.warn(
                                                    "Amount cannot exceed the balance due.",
                                                );
                                        }
                                        setPaymentData({
                                            ...paymentData,
                                            amount: value,
                                        });
                                    }}
                                    required
                                    min="0"
                                    max={paymentStatus.balance}
                                    step="1"
                                    className="no-spinner w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter amount"
                                    onKeyDown={(e) => {
                                        if (e.key === "." || e.key === ",")
                                            e.preventDefault();
                                    }}
                                />
                            </div>
                            {/* Payment Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Date *
                                </label>
                                <input
                                    type="date"
                                    value={paymentData.payment_date}
                                    onChange={(e) =>
                                        setPaymentData({
                                            ...paymentData,
                                            payment_date: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method *
                                </label>
                                <select
                                    value={paymentData.payment_method}
                                    onChange={(e) =>
                                        setPaymentData({
                                            ...paymentData,
                                            payment_method: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="CARD">Card</option>
                                    <option value="UPI">UPI</option>
                                    <option value="BANK_TRANSFER">
                                        Bank Transfer
                                    </option>
                                    <option value="CHEQUE">Cheque</option>
                                </select>
                            </div>
                            {/* Late Fee */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Late Fee
                                </label>
                                <input
                                    type="number"
                                    value={paymentData.late_fee}
                                    onChange={(e) =>
                                        setPaymentData({
                                            ...paymentData,
                                            late_fee:
                                                Number.parseFloat(
                                                    e.target.value,
                                                ) || 0,
                                        })
                                    }
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Late fee amount"
                                />
                            </div>
                            {/* Discount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Discount
                                </label>
                                <input
                                    type="text"
                                    value={paymentData.discount}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(
                                            /[^0-9]/g,
                                            "",
                                        );
                                        let intValue = parseInt(value) || 0;
                                        const maxDiscount = Math.min(
                                            paymentStatus.balance,
                                            paymentData.amount || 0,
                                        );
                                        if (intValue > maxDiscount) {
                                            intValue = maxDiscount;
                                            toast &&
                                                toast.warn(
                                                    "Discount cannot exceed the payment amount.",
                                                );
                                        }
                                        setPaymentData({
                                            ...paymentData,
                                            discount: intValue,
                                        });
                                    }}
                                    min="0"
                                    max={Math.min(
                                        paymentStatus.balance,
                                        paymentData.amount || 0,
                                    )}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Discount amount"
                                />
                            </div>
                        </div>
                        {/* Conditional fields */}
                        {/* Cheque Details */}
                        {paymentData.payment_method === "CHEQUE" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cheque Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={chequeDetails.cheque_number}
                                        onChange={(e) =>
                                            handleChequeDetailChange(
                                                "cheque_number",
                                                e.target.value,
                                            )
                                        }
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bank Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={chequeDetails.bank_name}
                                        onChange={(e) =>
                                            handleChequeDetailChange(
                                                "bank_name",
                                                e.target.value,
                                            )
                                        }
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}
                        {/* Transaction ID for non-cash/cheque */}
                        {["CARD", "UPI", "BANK_TRANSFER"].includes(
                            paymentData.payment_method,
                        ) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction ID
                                </label>
                                <input
                                    type="text"
                                    value={paymentData.transaction_id}
                                    onChange={(e) =>
                                        setPaymentData({
                                            ...paymentData,
                                            transaction_id: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter transaction ID"
                                />
                            </div>
                        )}
                        {/* Cash Denominations */}
                        {paymentData.payment_method === "CASH" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cash Denominations (must total to{" "}
                                    {expectedCashTotal})
                                </label>
                                {/* 500 row */}
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold">500</span>
                                    <span>x</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={denominations[0].count}
                                        onChange={(e) =>
                                            handleDenominationChange(
                                                0,
                                                e.target.value.replace(
                                                    /[^0-9]/g,
                                                    "",
                                                ),
                                            )
                                        }
                                        className="w-14 px-2 py-1 border border-gray-300 rounded"
                                        placeholder="0"
                                    />
                                </div>
                                {/* 500 serial numbers, 4 per row */}
                                {parseInt(denominations[0].count) > 0 &&
                                    render500SerialInputs(
                                        denominations[0].serials,
                                    )}
                                {/* Other denominations */}
                                <div className="flex flex-wrap gap-4 mt-2">
                                    {denominationValues
                                        .slice(1)
                                        .map((value, idx) => (
                                            <div
                                                key={value}
                                                className="flex items-center gap-1"
                                            >
                                                <span className="font-semibold">
                                                    {value}
                                                </span>
                                                <span>x</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        denominations[idx + 1]
                                                            .count
                                                    }
                                                    onChange={(e) =>
                                                        handleDenominationChange(
                                                            idx + 1,
                                                            e.target.value.replace(
                                                                /[^0-9]/g,
                                                                "",
                                                            ),
                                                        )
                                                    }
                                                    className="w-14 px-2 py-1 border border-gray-300 rounded"
                                                    placeholder="0"
                                                />
                                            </div>
                                        ))}
                                </div>
                                <div className="mt-2 text-sm text-gray-700">
                                    Total entered:{" "}
                                    <span
                                        className={
                                            cashTotal === expectedCashTotal
                                                ? "text-green-700 font-bold"
                                                : "text-red-700 font-bold"
                                        }
                                    >
                                        {cashTotal}
                                    </span>
                                    {cashTotal !== expectedCashTotal &&
                                        " (does not match required total)"}
                                </div>
                            </div>
                        )}
                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                value={paymentData.notes}
                                onChange={(e) =>
                                    setPaymentData({
                                        ...paymentData,
                                        notes: e.target.value,
                                    })
                                }
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Add any notes about this payment"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                Record Payment
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RecordPaymentModal;
