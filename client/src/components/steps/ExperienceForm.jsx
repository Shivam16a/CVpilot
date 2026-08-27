// client/src/components/steps/ExperienceForm.jsx
import React, { useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';

export default function ExperienceForm() {
    const { resumeData, updateResumeData, nextStep, prevStep } = useResumeStore();
    const [experience, setExperience] = useState(
        resumeData.experience && resumeData.experience.length > 0
            ? resumeData.experience
            : [{ company: '', role: '', location: '', startDate: '', endDate: '', isCurrent: false, responsibilities: '' }]
    );

    const addExperience = () => {
        setExperience([
            ...experience,
            { company: '', role: '', location: '', startDate: '', endDate: '', isCurrent: false, responsibilities: '' }
        ]);
    };

    const removeExperience = (index) => {
        setExperience(experience.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        const updated = [...experience];
        updated[index][field] = value;
        setExperience(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Zero DB hit - Only Zustand state update
        updateResumeData('experience', experience);
        nextStep();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0 glow-title">Work Experience</h4>
                <button type="button" onClick={addExperience} className="btn btn-outline-info btn-sm">
                    ➕ Add Experience
                </button>
            </div>

            {experience.map((exp, idx) => (
                <div key={idx} className="p-3 mb-3 rounded border border-secondary border-opacity-25 bg-dark bg-opacity-25 position-relative">
                    {experience.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeExperience(idx)}
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 py-0 px-1.5"
                            style={{ fontSize: '0.75rem' }}
                        >
                            ✕
                        </button>
                    )}

                    <div className="row g-2">
                        <div className="col-md-6">
                            <label className="form-label small text-white-50 mb-1">Company Name *</label>
                            <input
                                required
                                className="form-control glass-input text-white"
                                placeholder="e.g. Insights AI Analytics"
                                value={exp.company}
                                onChange={(e) => handleChange(idx, 'company', e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small text-white-50 mb-1">Job Role *</label>
                            <input
                                required
                                className="form-control glass-input text-white"
                                placeholder="e.g. Data Analyst"
                                value={exp.role}
                                onChange={(e) => handleChange(idx, 'role', e.target.value)}
                            />
                        </div>

                        {/* 🚀 NEW: Experience Location Field */}
                        <div className="col-md-6">
                            <label className="form-label small text-white-50 mb-1">Location</label>
                            <input
                                className="form-control glass-input text-white"
                                placeholder="e.g. Bengaluru, India"
                                value={exp.location || ''}
                                onChange={(e) => handleChange(idx, 'location', e.target.value)}
                            />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label small text-white-50 mb-1">Start Date</label>
                            <input
                                type="text"
                                className="form-control glass-input text-white"
                                placeholder="Aug 2022"
                                value={exp.startDate || ''}
                                onChange={(e) => handleChange(idx, 'startDate', e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small text-white-50 mb-1">End Date</label>
                            <input
                                type="text"
                                disabled={exp.isCurrent}
                                className="form-control glass-input text-white"
                                placeholder={exp.isCurrent ? 'Present' : 'Jun 2024'}
                                value={exp.isCurrent ? 'Present' : exp.endDate || ''}
                                onChange={(e) => handleChange(idx, 'endDate', e.target.value)}
                            />
                        </div>

                        <div className="col-12 mt-2">
                            <label className="form-label small text-white-50 mb-1">Key Responsibilities / Achievements</label>
                            <textarea
                                rows="3"
                                className="form-control glass-input text-white"
                                placeholder="• Built Power BI dashboards tracking monthly churn rates...&#10;• Designed automated SQL pipelines..."
                                value={Array.isArray(exp.responsibilities) ? exp.responsibilities.join('\n') : exp.responsibilities || ''}
                                onChange={(e) => handleChange(idx, 'responsibilities', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            ))}

            <div className="d-flex justify-content-between mt-4">
                <button type="button" onClick={prevStep} className="btn btn-outline-light px-4 py-1.5" style={{ borderRadius: '8px' }}>
                    ⬅️ Back
                </button>
                <button type="submit" className="btn btn-info text-dark fw-bold px-4 py-1.5" style={{ borderRadius: '8px' }}>
                    Next Section ➡️
                </button>
            </div>
        </form>
    );
}