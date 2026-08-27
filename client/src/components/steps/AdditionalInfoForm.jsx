// client/src/components/steps/AdditionalInfoForm.jsx
import React, { useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';

export default function AdditionalInfoForm() {
    const { resumeData, updateResumeData, nextStep, prevStep } = useResumeStore();

    // Detailed Certifications State
    const [certifications, setCertifications] = useState(
        resumeData.certifications && resumeData.certifications.length > 0
            ? resumeData.certifications
            : [{ name: '', organization: '', issueDate: '', link: '' }]
    );

    // Languages State
    const [languages, setLanguages] = useState(
        resumeData.languages && resumeData.languages.length > 0
            ? resumeData.languages
            : [{ name: '', level: 'Fluent' }]
    );

    const addCertification = () => {
        setCertifications([...certifications, { name: '', organization: '', issueDate: '', link: '' }]);
    };

    const removeCertification = (index) => {
        setCertifications(certifications.filter((_, i) => i !== index));
    };

    const handleCertChange = (index, field, value) => {
        const updated = [...certifications];
        updated[index][field] = value;
        setCertifications(updated);
    };

    const addLanguage = () => {
        setLanguages([...languages, { name: '', level: 'Fluent' }]);
    };

    const handleLangChange = (index, field, value) => {
        const updated = [...languages];
        updated[index][field] = value;
        setLanguages(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateResumeData('certifications', certifications);
        updateResumeData('languages', languages);
        nextStep(); // Goes to Final Review Step 8
    };

    return (
        <form onSubmit={handleSubmit}>
            <h4 className="fw-bold mb-3 glow-title">Certifications & Languages</h4>

            {/* Certifications Section */}
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="text-info mb-0">📜 Professional Certifications</h6>
                    <button type="button" onClick={addCertification} className="btn btn-outline-info btn-sm py-1">
                        ➕ Add Certification
                    </button>
                </div>

                {certifications.map((cert, idx) => (
                    <div key={idx} className="p-3 mb-2 rounded border border-secondary border-opacity-25 bg-dark bg-opacity-25 position-relative">
                        {certifications.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeCertification(idx)}
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 py-0 px-1.5"
                                style={{ fontSize: '0.7rem' }}
                            >
                                ✕
                            </button>
                        )}
                        <div className="row g-2">
                            <div className="col-md-6">
                                <label className="form-label x-small text-white-50 mb-1" style={{ fontSize: '0.75rem' }}>Certificate Title *</label>
                                <input
                                    required
                                    className="form-control glass-input text-white"
                                    placeholder="e.g. Google Data Analytics Professional Certificate"
                                    value={cert.name || ''}
                                    onChange={(e) => handleCertChange(idx, 'name', e.target.value)}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label x-small text-white-50 mb-1" style={{ fontSize: '0.75rem' }}>Issuing Organization</label>
                                <input
                                    className="form-control glass-input text-white"
                                    placeholder="e.g. Coursera / Google / Tableau"
                                    value={cert.organization || ''}
                                    onChange={(e) => handleCertChange(idx, 'organization', e.target.value)}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label x-small text-white-50 mb-1" style={{ fontSize: '0.75rem' }}>Issue Date</label>
                                <input
                                    className="form-control glass-input text-white"
                                    placeholder="e.g. Aug 2023"
                                    value={cert.issueDate || ''}
                                    onChange={(e) => handleCertChange(idx, 'issueDate', e.target.value)}
                                />
                            </div>
                            <div className="col-md-8">
                                <label className="form-label x-small text-white-50 mb-1" style={{ fontSize: '0.75rem' }}>Credential URL / Link</label>
                                <input
                                    className="form-control glass-input text-white"
                                    placeholder="https://coursera.org/verify/..."
                                    value={cert.link || ''}
                                    onChange={(e) => handleCertChange(idx, 'link', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Languages Section */}
            <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="text-info mb-0">🗣️ Languages Known</h6>
                    <button type="button" onClick={addLanguage} className="btn btn-outline-info btn-sm py-1">
                        ➕ Add Language
                    </button>
                </div>
                {languages.map((lang, idx) => (
                    <div key={idx} className="row g-2 mb-2">
                        <div className="col-md-6">
                            <input
                                className="form-control glass-input text-white"
                                placeholder="e.g. English"
                                value={lang.name || ''}
                                onChange={(e) => handleLangChange(idx, 'name', e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <select
                                className="form-select bg-dark text-white border-secondary"
                                value={lang.level || 'Fluent'}
                                onChange={(e) => handleLangChange(idx, 'level', e.target.value)}
                            >
                                <option value="Native">Native</option>
                                <option value="Fluent">Fluent</option>
                                <option value="Professional">Professional</option>
                                <option value="Basic">Basic</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            <div className="d-flex justify-content-between mt-4">
                <button type="button" onClick={prevStep} className="btn btn-outline-light px-4 py-1.5" style={{ borderRadius: '8px' }}>
                    ⬅️ Back
                </button>
                <button type="submit" className="btn btn-info text-dark fw-bold px-4 py-1.5" style={{ borderRadius: '8px' }}>
                    Review & Preview ➡️
                </button>
            </div>
        </form>
    );
}