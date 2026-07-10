// client/src/components/ResumePreview.jsx
import React from 'react';
import { Link } from 'react-router-dom'
import { useResumeStore } from '../store/useResumeStore';
import FinalReviewStep from './steps/FinalReviewStep';

export default function ResumePreview() {
    const { resumeData, currentStep } = useResumeStore();
    const { personalInfo, summary, skills, education, experience, projects, certifications, languages } = resumeData;

    // Direct flat text recovery controller format
    const renderSafeText = (textValue) => {
        if (!textValue) return '';
        if (typeof textValue === 'object') {
            if (Object.keys(textValue).every(key => !isNaN(key))) {
                return Object.values(textValue).join('');
            }
            return textValue.message || JSON.stringify(textValue);
        }
        return textValue;
    };

    // Safe parsing matrix to convert any string/object/array into clean renderable arrays
    const getSafeArray = (arr) => {
        if (!arr) return [];
        if (Array.isArray(arr)) return arr;
        if (typeof arr === 'object') return Object.values(arr);
        return [];
    };

    return (
        <div className="w-100 p-1 text-start">
            {currentStep === 8 && <FinalReviewStep />}

            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                <span className="small text-white-50 d-flex align-items-center gap-1">
                    <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '8px', height: '8px' }}></span>
                    Production Standard Sheet
                </span>
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 small">
                    Standard ATS Layout
                </span>
            </div>

            {/* Document Sheet Core (Perfect A4 Alignment Viewport) */}
            <div
                className="bg-white text-dark shadow-lg p-4 mx-auto w-100 text-start"
                style={{
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    minHeight: '842px',
                    maxWidth: '800px',
                    fontSize: '11px',
                    lineHeight: '1.4',
                    color: '#111111'
                }}
            >
                {/* 1. PERSONAL INFORMATION */}
                <div className="text-center mb-3">
                    <h4 className="fw-bold text-uppercase m-0 tracking-wide" style={{ fontSize: '16px' }}>{renderSafeText(personalInfo?.fullName) || 'YOUR NAME'}</h4>
                    <p className="m-0 fw-semibold text-secondary" style={{ fontSize: '12px' }}>{renderSafeText(personalInfo?.title) || 'Professional Title'}</p>
                    <div className="d-flex flex-wrap justify-content-center gap-2 mt-1 text-muted" style={{ fontSize: '10px' }}>
                        {personalInfo?.email && <span>{renderSafeText(personalInfo.email)}</span>}
                        {personalInfo?.phone && <span>• {renderSafeText(personalInfo.phone)}</span>}
                        {personalInfo?.linkedin && <Link to={renderSafeText(personalInfo.linkedin)} className="text-primary fw-semibold text-decoration-none"><i className="fab fa-linkedin"></i> Linkdin</Link>}
                        {personalInfo?.github && <Link to={renderSafeText(personalInfo.github)} className="text-muted fw-semibold text-decoration-none"><i className="fab fa-github-square"></i> GitHub</Link>}
                        {personalInfo?.location && <span>• {renderSafeText(personalInfo.location)}</span>}
                    </div>
                </div>

                {/* 2. PROFESSIONAL SUMMARY */}
                {summary && (
                    <div className="mb-3">
                        <h6 className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Professional Summary</h6>
                        <p className="m-0 text-secondary text-justify">{renderSafeText(summary)}</p>
                    </div>
                )}

                {/* 3. TECHNICAL SKILLS */}
                {skills && getSafeArray(skills).length > 0 && (
                    <div className="mb-3">
                        <h6 className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Technical Skills</h6>
                        <p className="m-0 text-secondary">
                            {getSafeArray(skills).join(', ')}
                        </p>
                    </div>
                )}

                {/* 4. WORK EXPERIENCE */}
                {experience && getSafeArray(experience).length > 0 && (
                    <div className="mb-3">
                        <h6 className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Work Experience</h6>
                        {getSafeArray(experience).map((exp, index) => (
                            <div key={index} className="mb-2">
                                <div className="d-flex justify-content-between fw-bold text-dark">
                                    <span>{renderSafeText(exp.role)} — {renderSafeText(exp.company)}</span>
                                    <span className="fw-normal text-muted" style={{ fontSize: '10px' }}>{renderSafeText(exp.startDate)} – {exp.isCurrent ? 'Present' : renderSafeText(exp.endDate)}</span>
                                </div>
                                {exp.responsibilities && (
                                    <ul className="m-0 ps-3 mt-1 text-secondary" style={{ listStyleType: 'disc' }}>
                                        {getSafeArray(exp.responsibilities).map((bullet, idx) => (
                                            <li key={idx} className="mb-0.5">{renderSafeText(bullet)}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* 5. PROJECTS */}
                {projects && getSafeArray(projects).length > 0 && (
                    <div className="mb-3">
                        <h6 className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Projects</h6>
                        {getSafeArray(projects).map((proj, index) => (
                            <div key={index} className="mb-2">
                                <div className="d-flex justify-content-between fw-bold text-dark">
                                    <span>{renderSafeText(proj.name)} {proj.techStack && <span className="fw-normal text-muted" style={{ fontSize: '10px' }}>({getSafeArray(proj.techStack).join(', ')})</span>}</span>
                                    <span className="fw-normal text-muted" style={{ fontSize: '10px' }}><Link to={renderSafeText(proj.liveLink)} className='text-muted fw-normal text-decoration-none'>{renderSafeText(proj.liveLink)}</Link></span>
                                </div>
                                <p className="m-0 text-secondary mt-0.5">{renderSafeText(proj.description)}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* 6. ACADEMIC EDUCATION */}
                {education && getSafeArray(education).length > 0 && (
                    <div className="mb-3">
                        <h6 className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Education</h6>
                        {getSafeArray(education).map((edu, index) => (
                            <div key={index} className="mb-1.5 d-flex justify-content-between align-items-start">
                                <div>
                                    <span className="fw-bold text-dark">{renderSafeText(edu.degree)} {edu.course && `in ${renderSafeText(edu.course)}`}</span> — <span className="text-secondary">{renderSafeText(edu.institute)}</span>
                                </div>
                                <div className="text-end" style={{ fontSize: '10px' }}>
                                    <span className="fw-bold text-dark">{renderSafeText(edu.score)}</span> <br />
                                    <span className="text-muted">{renderSafeText(edu.startDate)} – {edu.isCurrent ? 'Present' : renderSafeText(edu.endDate)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 7. CERTIFICATIONS & LANGUAGES */}
                {certifications && getSafeArray(certifications).length > 0 && certifications[0]?.name && (
                    <div className="mb-2">
                        <h6 className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Certifications</h6>
                        <ul className="m-0 ps-3 text-secondary" style={{ listStyleType: 'square' }}>
                            {getSafeArray(certifications).map((cert, index) => (
                                <li key={index} className="mb-0.5">{renderSafeText(cert.name)} — <span className="text-muted">{renderSafeText(cert.organization)}</span></li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}