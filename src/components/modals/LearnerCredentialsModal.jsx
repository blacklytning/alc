import React, { useState } from "react";
import { X, Save } from "lucide-react";

const LearnerCredentialsModal = ({ open, onClose, student, onSave }) => {
    const [learnerCode, setLearnerCode] = useState(student?.learner_code || "");
    const [eraId, setEraId] = useState(student?.era_id || "");
    const [eraPassword, setEraPassword] = useState(student?.era_password || "");
    const [saving, setSaving] = useState(false);

    if (!open || !student) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({
            learner_code: learnerCode,
            era_id: eraId,
            era_password: eraPassword,
        });
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-sm max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Learner Credentials
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Learner Code
                            </label>
                            <input
                                type="text"
                                value={learnerCode}
                                onChange={(e) => setLearnerCode(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter learner code"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ERA ID
                            </label>
                            <input
                                type="text"
                                value={eraId}
                                onChange={(e) => setEraId(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter ERA ID"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ERA Password
                            </label>
                            <input
                                type="password"
                                value={eraPassword}
                                onChange={(e) => setEraPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter ERA password"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {saving ? "Saving..." : "Save Credentials"}
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

export default LearnerCredentialsModal;
