// client/src/components/steps/FinalReviewStep.jsx
import React from 'react';
import { useResumeStore } from '../../store/useResumeStore';

export default function FinalReviewStep() {
    const { resetForm, setStep } = useResumeStore();

    const handlePrint = () => {
        window.print(); // Phase 3 me hum high-quality pdf implementation lagayenge
    };

    return (
        <div className="glass-card p-4 text-white border-0 shadow-lg mb-4">
            <div className="d-flex flex-col flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                    <h4 className="fw-bold mb-1 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        🎉 Your Resume is Ready!
                    </h4>
                    <p className="text-white-50 small mb-0">Review the final ATS standard print below before generating your master copy.</p>
                </div>

                {/* Control Action Buttons */}
                <div className="d-flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="btn btn-outline-secondary text-white btn-sm px-3 py-2"
                        style={{ borderRadius: '10px' }}
                    >
                        ✏️ Edit Details
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="btn btn-premium btn-sm px-4 py-2"
                    >
                        📥 Download PDF
                    </button>
                    <button
                        type="button"
                        onClick={() => { resetForm(); window.location.reload(); }}
                        className="btn btn-danger btn-sm px-3 py-2"
                        style={{ borderRadius: '10px' }}
                    >
                        Reset All
                    </button>
                </div>
            </div>
        </div>
    );
}