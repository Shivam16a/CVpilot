// client/src/components/ResumePreview.jsx
import React, { forwardRef } from 'react';
import { useResumeStore } from '../store/useResumeStore';
import FinalReviewStep from './steps/FinalReviewStep';

const ResumePreview = forwardRef((props, ref) => {
    const { resumeData, currentStep, selectedTemplate } = useResumeStore();
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

    const safeText = renderSafeText;
    const safeArray = getSafeArray;

    // 🔗 External Safe Link Formatter (Opens in NEW TAB)
    const renderExternalLink = (url, label, className = "text-primary fw-semibold text-decoration-none") => {
        if (!url) return null;
        const cleanUrl = safeText(url).trim();
        if (!cleanUrl) return null;

        const href = cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')
            ? cleanUrl
            : `https://${cleanUrl}`;

        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
            >
                {label}
            </a>
        );
    };

    // client/src/components/ResumePreview.jsx (Updated Parser Block)

    const parseCertData = (certItem) => {
        let name = safeText(certItem?.name || certItem);
        let organization = safeText(certItem?.organization);
        let issueDate = safeText(certItem?.issueDate);
        let link = safeText(certItem?.link || certItem?.url || certItem?.credentialUrl);

        // 🔍 Smart Mongo Atlas Field Correction:
        // Check if issueDate or organization accidentally holds the URL
        if (!link) {
            if (issueDate.includes('http://') || issueDate.includes('https://') || issueDate.includes('drive.google')) {
                link = issueDate;
                issueDate = ''; // Clear issueDate so URL string doesn't print as date text
            } else if (organization.includes('http://') || organization.includes('https://') || organization.includes('drive.google')) {
                link = organization;
                organization = '';
            }
        }

        // Standard URL Regex fallback in name string
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const foundUrls = name.match(urlRegex);
        if (foundUrls && foundUrls.length > 0) {
            if (!link) link = foundUrls[0];
            name = name.replace(urlRegex, '').replace(/\(\s*\)/g, '').trim();
        }

        return { name, organization, issueDate, link };
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
                    {selectedTemplate ? selectedTemplate.replace('template-', '').toUpperCase() : 'STANDARD ATS'} Layout
                </span>
            </div>

            {/* Document Sheet Core */}
            <div
                ref={ref}
                className="bg-white text-dark shadow-lg mx-auto w-100 text-start overflow-hidden"
                style={{
                    minHeight: '842px',
                    maxWidth: '800px',
                    fontSize: '11px',
                    lineHeight: '1.4',
                    color: '#111111'
                }}
            >

                {/* ==================== 0. DEFAULT STANDARD ATS LAYOUT ==================== */}
                {(!selectedTemplate || selectedTemplate === 'default' || selectedTemplate === 'template-ats') && (
                    <div className="p-4">
                        <div className="text-center mb-3">
                            <h4 className="fw-bold text-uppercase m-0 tracking-wide" style={{ fontSize: '16px' }}>{safeText(personalInfo?.fullName) || 'YOUR NAME'}</h4>
                            <p className="m-0 fw-semibold text-secondary" style={{ fontSize: '12px' }}>{safeText(personalInfo?.title) || 'Professional Title'}</p>
                            <div className="d-flex flex-wrap justify-content-center gap-2 mt-1 text-muted" style={{ fontSize: '10px' }}>
                                {personalInfo?.email && <span>{safeText(personalInfo.email)}</span>}
                                {personalInfo?.phone && <span>• {safeText(personalInfo.phone)}</span>}
                                {personalInfo?.linkedin && <span>• {renderExternalLink(personalInfo.linkedin, 'LinkedIn', 'text-primary fw-semibold text-decoration-none')}</span>}
                                {personalInfo?.github && <span>• {renderExternalLink(personalInfo.github, 'GitHub', 'text-dark fw-semibold text-decoration-none')}</span>}
                                {personalInfo?.location && <span>• {safeText(personalInfo.location)}</span>}
                            </div>
                        </div>

                        {summary && (
                            <div className="mb-3">
                                <h6 className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Professional Summary</h6>
                                <p className="m-0 text-secondary text-justify">{safeText(summary)}</p>
                            </div>
                        )}

                        {skills && safeArray(skills).length > 0 && (
                            <div className="mb-3">
                                <h6 className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Technical Skills</h6>
                                <p className="m-0 text-secondary">{safeArray(skills).join(', ')}</p>
                            </div>
                        )}

                        {experience && safeArray(experience).length > 0 && (
                            <div className="mb-3">
                                <h6 className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Work Experience</h6>
                                {safeArray(experience).map((exp, index) => (
                                    <div key={index} className="mb-2">
                                        <div className="d-flex justify-content-between fw-bold text-dark">
                                            <span>{safeText(exp.role)} — {safeText(exp.company)}</span>
                                            <span className="fw-normal text-muted" style={{ fontSize: '10px' }}>{safeText(exp.startDate)} – {exp.isCurrent ? 'Present' : safeText(exp.endDate)}</span>
                                        </div>
                                        {exp.responsibilities && (
                                            <ul className="m-0 ps-3 mt-1 text-secondary" style={{ listStyleType: 'disc' }}>
                                                {safeArray(exp.responsibilities).map((bullet, idx) => (
                                                    <li key={idx} className="mb-0.5">{safeText(bullet)}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {projects && safeArray(projects).length > 0 && (
                            <div className="mb-3">
                                <h6 className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Projects</h6>
                                {safeArray(projects).map((proj, index) => (
                                    <div key={index} className="mb-2">
                                        <div className="d-flex justify-content-between fw-bold text-dark">
                                            <span>{safeText(proj.name)} {proj.techStack && <span className="fw-normal text-muted" style={{ fontSize: '10px' }}>({safeArray(proj.techStack).join(', ')})</span>}</span>
                                            <span className="fw-normal text-muted" style={{ fontSize: '10px' }}>
                                                {proj.liveLink && renderExternalLink(proj.liveLink, '[Live Demo 🔗]', 'text-primary text-decoration-underline ms-2')}
                                                {proj.github && renderExternalLink(proj.github, '[GitHub 💻]', 'text-dark text-decoration-underline ms-2')}
                                            </span>
                                        </div>
                                        <p className="m-0 text-secondary mt-0.5">{safeText(proj.description)}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {education && safeArray(education).length > 0 && (
                            <div className="mb-3">
                                <h6 className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Education</h6>
                                {safeArray(education).map((edu, index) => (
                                    <div key={index} className="mb-1.5 d-flex justify-content-between align-items-start">
                                        <div>
                                            <span className="fw-bold text-dark">{safeText(edu.degree)} {edu.course && `in ${safeText(edu.course)}`}</span> — <span className="text-secondary">{safeText(edu.institute)}</span>
                                        </div>
                                        <div className="text-end" style={{ fontSize: '10px' }}>
                                            <span className="fw-bold text-dark">{safeText(edu.score)}</span> <br />
                                            <span className="text-muted">{safeText(edu.startDate)} – {edu.isCurrent ? 'Present' : safeText(edu.endDate)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {certifications && safeArray(certifications).length > 0 && (
                            <div className="mb-2">
                                <h6 className="fw-bold text-uppercase border-bottom border-dark pb-1 mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Certifications</h6>
                                <ul className="m-0 ps-3 text-secondary" style={{ listStyleType: 'square' }}>
                                    {safeArray(certifications).map((certItem, index) => {
                                        const cert = parseCertData(certItem);
                                        return (
                                            <li key={index} className="mb-0.5">
                                                <span className="fw-semibold text-dark">{cert.name}</span>
                                                {cert.organization && <span> — <span className="text-muted">{cert.organization}</span></span>}
                                                {cert.issueDate && <span className="text-muted"> ({cert.issueDate})</span>}
                                                {cert.link && renderExternalLink(cert.link, ' [View Credential 🔗]', 'text-primary fw-medium text-decoration-underline ms-1')}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                )}


                {/* ==================== TEMPLATE 1: MODERN SIDEBAR ==================== */}
                {selectedTemplate === 'template-sidebar' && (
                    <div className="d-flex w-100" style={{ minHeight: '842px' }}>
                        {/* Left Sidebar */}
                        <div className="p-3 text-white d-flex flex-column justify-content-between" style={{ width: '32%', background: '#2c3e50', fontSize: '10px' }}>
                            <div>
                                <div className="text-center mb-3">
                                    <div className="mx-auto rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white mb-2" style={{ width: '65px', height: '65px', fontSize: '24px' }}>
                                        👤
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <h6 className="fw-bold text-uppercase border-bottom border-light pb-1 mb-2" style={{ fontSize: '11px' }}>Contact</h6>
                                    {personalInfo?.phone && <div>📞 {safeText(personalInfo.phone)}</div>}
                                    {personalInfo?.email && <div className="text-break">✉️ {safeText(personalInfo.email)}</div>}
                                    {personalInfo?.location && <div>📍 {safeText(personalInfo.location)}</div>}
                                    {personalInfo?.linkedin && <div className="text-break mt-1">🔗 {renderExternalLink(personalInfo.linkedin, 'LinkedIn', 'text-info fw-semibold text-decoration-none')}</div>}
                                    {personalInfo?.github && <div className="text-break mt-1">💻 {renderExternalLink(personalInfo.github, 'GitHub', 'text-light fw-semibold text-decoration-none')}</div>}
                                </div>

                                {skills && safeArray(skills).length > 0 && (
                                    <div className="mb-3">
                                        <h6 className="fw-bold text-uppercase border-bottom border-light pb-1 mb-2" style={{ fontSize: '11px' }}>Key Skills</h6>
                                        <ul className="ps-3 m-0">
                                            {safeArray(skills).map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {certifications && safeArray(certifications).length > 0 && (
                                    <div className="mb-3">
                                        <h6 className="fw-bold text-uppercase border-bottom border-light pb-1 mb-2" style={{ fontSize: '11px' }}>Certifications</h6>
                                        <ul className="ps-3 m-0">
                                            {safeArray(certifications).map((certItem, i) => {
                                                const cert = parseCertData(certItem);
                                                return (
                                                    <li key={i} className="mb-1">
                                                        {cert.name}
                                                        {cert.link && renderExternalLink(cert.link, ' [🔗]', 'text-info text-decoration-none ms-1')}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}

                                {languages && safeArray(languages).length > 0 && (
                                    <div className="mb-3">
                                        <h6 className="fw-bold text-uppercase border-bottom border-light pb-1 mb-2" style={{ fontSize: '11px' }}>Languages</h6>
                                        {safeArray(languages).map((l, i) => <div key={i}>{safeText(l.name)} ({safeText(l.level)})</div>)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Content Area */}
                        <div className="p-4" style={{ width: '68%' }}>
                            <div className="mb-3">
                                <h3 className="fw-bold text-uppercase m-0" style={{ color: '#2c3e50', fontSize: '20px' }}>{safeText(personalInfo?.fullName) || 'YOUR NAME'}</h3>
                                <p className="fw-semibold text-muted" style={{ fontSize: '12px' }}>{safeText(personalInfo?.title) || 'PROFESSIONAL TITLE'}</p>
                            </div>

                            {summary && (
                                <div className="mb-3">
                                    <h6 className="fw-bold text-uppercase border-bottom border-dark pb-1" style={{ fontSize: '11px' }}>Career Objective</h6>
                                    <p className="m-0 text-secondary">{safeText(summary)}</p>
                                </div>
                            )}

                            {experience && safeArray(experience).length > 0 && (
                                <div className="mb-3">
                                    <h6 className="fw-bold text-uppercase border-bottom border-dark pb-1" style={{ fontSize: '11px' }}>Relevant Experience</h6>
                                    {safeArray(experience).map((exp, i) => (
                                        <div key={i} className="mb-2">
                                            <div className="fw-bold">{safeText(exp.role)} — {safeText(exp.company)} ({safeText(exp.startDate)} - {safeText(exp.endDate)})</div>
                                            {exp.responsibilities && (
                                                <ul className="ps-3 m-0 text-secondary">
                                                    {safeArray(exp.responsibilities).map((r, idx) => <li key={idx}>{safeText(r)}</li>)}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {projects && safeArray(projects).length > 0 && (
                                <div className="mb-3">
                                    <h6 className="fw-bold text-uppercase border-bottom border-dark pb-1" style={{ fontSize: '11px' }}>Projects</h6>
                                    {safeArray(projects).map((proj, i) => (
                                        <div key={i} className="mb-2">
                                            <div className="fw-bold">
                                                {safeText(proj.name)} {proj.techStack && <span className="fw-normal text-muted">({safeArray(proj.techStack).join(', ')})</span>}
                                                {proj.liveLink && renderExternalLink(proj.liveLink, ' [Live Demo 🔗]', 'text-primary ms-2')}
                                            </div>
                                            <p className="m-0 text-secondary">{safeText(proj.description)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {education && safeArray(education).length > 0 && (
                                <div className="mb-3">
                                    <h6 className="fw-bold text-uppercase border-bottom border-dark pb-1" style={{ fontSize: '11px' }}>Education</h6>
                                    {safeArray(education).map((edu, i) => (
                                        <div key={i} className="mb-1">
                                            <div className="fw-bold">{safeText(edu.degree)} in {safeText(edu.course)} | {safeText(edu.institute)}</div>
                                            <div className="text-muted">{safeText(edu.score)} — ({safeText(edu.startDate)} - {safeText(edu.endDate)})</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {/* ==================== TEMPLATE 2: CLEAN CORPORATE ==================== */}
                {selectedTemplate === 'template-corporate' && (
                    <div className="p-4">
                        <div className="text-center border-bottom border-dark pb-3 mb-3">
                            <h3 className="fw-bold text-uppercase m-0" style={{ fontSize: '22px' }}>{safeText(personalInfo?.fullName) || 'YOUR NAME'}</h3>
                            <div className="fw-semibold text-secondary" style={{ fontSize: '13px' }}>{safeText(personalInfo?.title) || 'Professional Title'}</div>
                            <div className="mt-1 text-muted" style={{ fontSize: '10px' }}>
                                📞 {safeText(personalInfo?.phone)} | ✉️ {safeText(personalInfo?.email)} | 📍 {safeText(personalInfo?.location)}
                                {personalInfo?.linkedin && <span> | LinkedIn: {renderExternalLink(personalInfo.linkedin, 'Profile 🔗', 'text-primary')}</span>}
                                {personalInfo?.github && <span> | GitHub: {renderExternalLink(personalInfo.github, 'Profile 💻', 'text-dark')}</span>}
                            </div>
                        </div>

                        {summary && (
                            <div className="mb-3">
                                <h6 className="fw-bold text-uppercase border-bottom border-secondary pb-1" style={{ fontSize: '11px' }}>About Me</h6>
                                <p className="m-0 text-secondary">{safeText(summary)}</p>
                            </div>
                        )}

                        {skills && safeArray(skills).length > 0 && (
                            <div className="mb-3">
                                <h6 className="fw-bold text-uppercase border-bottom border-secondary pb-1" style={{ fontSize: '11px' }}>Key Skills</h6>
                                <div>{safeArray(skills).join(' • ')}</div>
                            </div>
                        )}

                        {experience && safeArray(experience).length > 0 && (
                            <div className="mb-3">
                                <h6 className="fw-bold text-uppercase border-bottom border-secondary pb-1" style={{ fontSize: '11px' }}>Work Experience</h6>
                                {safeArray(experience).map((exp, i) => (
                                    <div key={i} className="mb-2">
                                        <div className="d-flex justify-content-between fw-bold">
                                            <span>{safeText(exp.role)} — {safeText(exp.company)}</span>
                                            <span className="text-muted">{safeText(exp.startDate)} - {safeText(exp.endDate)}</span>
                                        </div>
                                        {exp.responsibilities && (
                                            <ul className="ps-3 m-0 text-secondary">
                                                {safeArray(exp.responsibilities).map((r, idx) => <li key={idx}>{safeText(r)}</li>)}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {projects && safeArray(projects).length > 0 && (
                            <div className="mb-3">
                                <h6 className="fw-bold text-uppercase border-bottom border-secondary pb-1" style={{ fontSize: '11px' }}>Projects</h6>
                                {safeArray(projects).map((proj, i) => (
                                    <div key={i} className="mb-2">
                                        <div className="fw-bold">
                                            {safeText(proj.name)} {proj.techStack && <span className="fw-normal text-muted">({safeArray(proj.techStack).join(', ')})</span>}
                                            {proj.liveLink && renderExternalLink(proj.liveLink, ' [Live 🔗]', 'text-primary ms-2')}
                                        </div>
                                        <p className="m-0 text-secondary">{safeText(proj.description)}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {education && safeArray(education).length > 0 && (
                            <div className="mb-3">
                                <h6 className="fw-bold text-uppercase border-bottom border-secondary pb-1" style={{ fontSize: '11px' }}>Education</h6>
                                {safeArray(education).map((edu, i) => (
                                    <div key={i} className="mb-1 d-flex justify-content-between">
                                        <div><strong>{safeText(edu.degree)} in {safeText(edu.course)}</strong> — {safeText(edu.institute)}</div>
                                        <div className="text-muted">{safeText(edu.score)}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {certifications && safeArray(certifications).length > 0 && (
                            <div className="mb-3">
                                <h6 className="fw-bold text-uppercase border-bottom border-secondary pb-1" style={{ fontSize: '11px' }}>Certifications</h6>
                                <ul>
                                    {safeArray(certifications).map((certItem, i) => {
                                        const cert = parseCertData(certItem);
                                        return (
                                            <li key={i}>
                                                {cert.name} {cert.organization && `— ${cert.organization}`}
                                                {cert.link && renderExternalLink(cert.link, ' [View Credential 🔗]', 'text-primary ms-1')}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                )}


                {/* ==================== TEMPLATE 3: EXECUTIVE GREY HEADER ==================== */}
                {selectedTemplate === 'template-header-banner' && (
                    <div>
                        <div className="p-4 d-flex justify-content-between align-items-center" style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <div>
                                <h3 className="fw-bold text-uppercase m-0" style={{ fontSize: '20px' }}>{safeText(personalInfo?.fullName) || 'YOUR NAME'}</h3>
                                <div className="text-primary fw-semibold">{safeText(personalInfo?.title) || 'PROFESSIONAL TITLE'}</div>
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="bg-light p-2 mb-3 border-start border-4 border-secondary">
                                <h6 className="fw-bold text-uppercase m-0" style={{ fontSize: '11px' }}>Contact Info</h6>
                                <div className="text-muted" style={{ fontSize: '10px' }}>
                                    Email: {safeText(personalInfo?.email)} | Mobile: {safeText(personalInfo?.phone)} | Address: {safeText(personalInfo?.location)}
                                    {personalInfo?.linkedin && <span> | LinkedIn: {renderExternalLink(personalInfo.linkedin, 'LinkedIn 🔗', 'text-primary')}</span>}
                                    {personalInfo?.github && <span> | GitHub: {renderExternalLink(personalInfo.github, 'GitHub 💻', 'text-dark')}</span>}
                                </div>
                            </div>

                            {summary && (
                                <div className="mb-3">
                                    <div className="bg-secondary text-white px-2 py-0.5 fw-bold text-uppercase mb-1" style={{ fontSize: '10px' }}>Personal Summary</div>
                                    <p className="m-0 text-secondary">{safeText(summary)}</p>
                                </div>
                            )}

                            {skills && safeArray(skills).length > 0 && (
                                <div className="mb-3">
                                    <div className="bg-secondary text-white px-2 py-0.5 fw-bold text-uppercase mb-1" style={{ fontSize: '10px' }}>Technical Skills</div>
                                    <p className="m-0 text-secondary">{safeArray(skills).join(', ')}</p>
                                </div>
                            )}

                            {experience && safeArray(experience).length > 0 && (
                                <div className="mb-3">
                                    <div className="bg-secondary text-white px-2 py-0.5 fw-bold text-uppercase mb-1" style={{ fontSize: '10px' }}>Work Experience</div>
                                    {safeArray(experience).map((exp, i) => (
                                        <div key={i} className="mb-2">
                                            <strong>{safeText(exp.role)} — {safeText(exp.company)}</strong> ({safeText(exp.startDate)} - {safeText(exp.endDate)})
                                            {exp.responsibilities && (
                                                <ul className="m-0 ps-3">
                                                    {safeArray(exp.responsibilities).map((r, idx) => <li key={idx}>{safeText(r)}</li>)}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {projects && safeArray(projects).length > 0 && (
                                <div className="mb-3">
                                    <div className="bg-secondary text-white px-2 py-0.5 fw-bold text-uppercase mb-1" style={{ fontSize: '10px' }}>Projects</div>
                                    {safeArray(projects).map((proj, i) => (
                                        <div key={i} className="mb-2">
                                            <strong>{safeText(proj.name)}</strong> {proj.techStack && `(${safeArray(proj.techStack).join(', ')})`}
                                            {proj.liveLink && renderExternalLink(proj.liveLink, ' [Demo 🔗]', 'text-primary ms-2')}
                                            <p className="m-0 text-secondary">{safeText(proj.description)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {education && safeArray(education).length > 0 && (
                                <div className="mb-3">
                                    <div className="bg-secondary text-white px-2 py-0.5 fw-bold text-uppercase mb-1" style={{ fontSize: '10px' }}>Education Details</div>
                                    {safeArray(education).map((edu, i) => (
                                        <div key={i} className="mb-1">
                                            <strong>{safeText(edu.degree)} in {safeText(edu.course)}</strong> — {safeText(edu.institute)} ({safeText(edu.score)})
                                        </div>
                                    ))}
                                </div>
                            )}

                            {certifications && safeArray(certifications).length > 0 && (
                                <div className="mb-3">
                                    <div className="bg-secondary text-white px-2 py-0.5 fw-bold text-uppercase mb-1" style={{ fontSize: '10px' }}>Certifications</div>
                                    <ul>
                                        {safeArray(certifications).map((certItem, i) => {
                                            const cert = parseCertData(certItem);
                                            return (
                                                <li key={i}>
                                                    {cert.name} {cert.organization && `— ${cert.organization}`}
                                                    {cert.link && renderExternalLink(cert.link, ' [Credential 🔗]', 'text-primary ms-1')}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {/* ==================== TEMPLATE 4: CLASSIC ACADEMIC TABLE ==================== */}
                {selectedTemplate === 'template-classic-table' && (
                    <div className="p-4" style={{ fontFamily: 'Times New Roman, serif' }}>
                        <div className="text-center mb-3">
                            <h4 className="fw-bold text-uppercase m-0">RESUME</h4>
                            <div className="fw-bold mt-2">{safeText(personalInfo?.fullName)}</div>
                            <div className="text-muted" style={{ fontSize: '10px' }}>
                                {safeText(personalInfo?.location)} | Email: {safeText(personalInfo?.email)} | Contact: {safeText(personalInfo?.phone)}
                                {personalInfo?.linkedin && <span> | {renderExternalLink(personalInfo.linkedin, 'LinkedIn', 'text-dark fw-bold')}</span>}
                                {personalInfo?.github && <span> | {renderExternalLink(personalInfo.github, 'GitHub', 'text-dark fw-bold')}</span>}
                            </div>
                        </div>

                        {summary && (
                            <div className="mb-3">
                                <div className="bg-light p-1 fw-bold text-uppercase border-bottom border-top" style={{ fontSize: '10px' }}>Objective:</div>
                                <p className="fst-italic m-0 mt-1">{safeText(summary)}</p>
                            </div>
                        )}

                        {skills && safeArray(skills).length > 0 && (
                            <div className="mb-3">
                                <div className="bg-light p-1 fw-bold text-uppercase border-bottom border-top mb-1" style={{ fontSize: '10px' }}>Technical Skills:</div>
                                <p className="m-0 ps-1">{safeArray(skills).join(', ')}</p>
                            </div>
                        )}

                        {experience && safeArray(experience).length > 0 && (
                            <div className="mb-3">
                                <div className="bg-light p-1 fw-bold text-uppercase border-bottom border-top mb-1" style={{ fontSize: '10px' }}>Work Experience:</div>
                                {safeArray(experience).map((exp, i) => (
                                    <div key={i} className="mb-2 ps-1">
                                        <strong>{safeText(exp.role)} — {safeText(exp.company)}</strong> ({safeText(exp.startDate)} - {safeText(exp.endDate)})
                                        {exp.responsibilities && (
                                            <ul className="m-0 ps-3">
                                                {safeArray(exp.responsibilities).map((r, idx) => <li key={idx}>{safeText(r)}</li>)}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {projects && safeArray(projects).length > 0 && (
                            <div className="mb-3">
                                <div className="bg-light p-1 fw-bold text-uppercase border-bottom border-top mb-1" style={{ fontSize: '10px' }}>Key Projects:</div>
                                {safeArray(projects).map((proj, i) => (
                                    <div key={i} className="mb-2 ps-1">
                                        <strong>{safeText(proj.name)}</strong> {proj.techStack && `(${safeArray(proj.techStack).join(', ')})`}
                                        {proj.liveLink && renderExternalLink(proj.liveLink, ' [Link 🔗]', 'text-dark ms-2')}
                                        <p className="m-0 text-secondary">{safeText(proj.description)}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {education && safeArray(education).length > 0 && (
                            <div className="mb-3">
                                <div className="bg-light p-1 fw-bold text-uppercase border-bottom border-top mb-2" style={{ fontSize: '10px' }}>Educational Qualifications:</div>
                                <table className="table table-bordered text-center align-middle" style={{ fontSize: '10px' }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th>Courses</th>
                                            <th>University/Board</th>
                                            <th>Passing Year</th>
                                            <th>Percentage/CGPA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {safeArray(education).map((edu, i) => (
                                            <tr key={i}>
                                                <td>{safeText(edu.degree)}</td>
                                                <td>{safeText(edu.institute)}</td>
                                                <td>{safeText(edu.endDate) || '2024'}</td>
                                                <td>{safeText(edu.score)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {certifications && safeArray(certifications).length > 0 && (
                            <div className="mb-3">
                                <div className="bg-light p-1 fw-bold text-uppercase border-bottom border-top mb-1" style={{ fontSize: '10px' }}>Certifications:</div>
                                <ul>
                                    {safeArray(certifications).map((certItem, i) => {
                                        const cert = parseCertData(certItem);
                                        return (
                                            <li key={i}>
                                                {cert.name} {cert.organization && `— ${cert.organization}`}
                                                {cert.link && renderExternalLink(cert.link, ' [Credential 🔗]', 'text-dark ms-1')}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
});

export default ResumePreview;