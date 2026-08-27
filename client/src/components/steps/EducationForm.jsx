// client/src/components/steps/EducationForm.jsx
import React, { useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';

export default function EducationForm() {
    const { resumeData, updateResumeData, nextStep, prevStep } = useResumeStore();
    const [education, setEducation] = useState(
        resumeData.education && resumeData.education.length > 0
            ? resumeData.education
            : [{ degree: '', course: '', institute: '', location: '', startDate: '', endDate: '', score: '' }]
    );

    const addEducation = () => {
        setEducation([
            ...education,
            { degree: '', course: '', institute: '', location: '', startDate: '', endDate: '', score: '' }
        ]);
    };

    const removeEducation = (index) => {
        setEducation(education.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        const updated = [...education];
        updated[index][field] = value;
        setEducation(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateResumeData('education', education);
        nextStep();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0 glow-title">Education Qualifications</h4>
                <button type="button" onClick={addEducation} className="btn btn-outline-info btn-sm">
                    ➕ Add Education
                </button>
            </div>

            {education.map((edu, idx) => (
                <div key={idx} className="p-3 mb-3 rounded border border-secondary border-opacity-25 bg-dark bg-opacity-25 position-relative">
                    {education.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeEducation(idx)}
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 py-0 px-1.5"
                            style={{ fontSize: '0.75rem' }}
                        >
                            ✕
                        </button>
                    )}

                    <div className="row g-2">
                        <div className="col-md-6">
                            <label className="form-label small text-white-50 mb-1">Degree / Qualification *</label>
                            <input
                                required
                                className="form-control glass-input text-white"
                                placeholder="e.g. Bachelor of Science (B.Sc)"
                                value={edu.degree}
                                onChange={(e) => handleChange(idx, 'degree', e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small text-white-50 mb-1">Field of Study / Course *</label>
                            <input
                                required
                                className="form-control glass-input text-white"
                                placeholder="e.g. Statistics and Mathematics"
                                value={edu.course}
                                onChange={(e) => handleChange(idx, 'course', e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small text-white-50 mb-1">Institute / University *</label>
                            <input
                                required
                                className="form-control glass-input text-white"
                                placeholder="e.g. St. Xavier's College"
                                value={edu.institute}
                                onChange={(e) => handleChange(idx, 'institute', e.target.value)}
                            />
                        </div>

                        {/* 🚀 NEW: Institute Location Field */}
                        <div className="col-md-6">
                            <label className="form-label small text-white-50 mb-1">Institute Location</label>
                            <input
                                className="form-control glass-input text-white"
                                placeholder="e.g. Kolkata, India"
                                value={edu.location || ''}
                                onChange={(e) => handleChange(idx, 'location', e.target.value)}
                            />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label small text-white-50 mb-1">Start Date</label>
                            <input
                                className="form-control glass-input text-white"
                                placeholder="Jul 2018"
                                value={edu.startDate || ''}
                                onChange={(e) => handleChange(idx, 'startDate', e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small text-white-50 mb-1">End Date</label>
                            <input
                                className="form-control glass-input text-white"
                                placeholder="Jun 2021"
                                value={edu.endDate || ''}
                                onChange={(e) => handleChange(idx, 'endDate', e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small text-white-50 mb-1">Score / Percentage / CGPA</label>
                            <input
                                className="form-control glass-input text-white"
                                placeholder="84% or 8.5 CGPA"
                                value={edu.score || ''}
                                onChange={(e) => handleChange(idx, 'score', e.target.value)}
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