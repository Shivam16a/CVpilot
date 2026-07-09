import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useResumeStore } from '../../store/useResumeStore';

export default function AdditionalInfoForm() {
    const { resumeData, updateResumeData, nextStep, prevStep } = useResumeStore();
    const [loading, setLoading] = useState(false);

    const { register, control, handleSubmit } = useForm({
        defaultValues: {
            certifications: resumeData.certifications.length > 0 ? resumeData.certifications : [{ name: '', organization: '', issueDate: '' }],
            languages: resumeData.languages.length > 0 ? resumeData.languages : [{ name: '', level: 'Fluent' }]
        }
    });

    const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control, name: "certifications" });
    const { fields: langFields, append: appendLang, remove: removeLang } = useFieldArray({ control, name: "languages" });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            updateResumeData('certifications', data.certifications);
            updateResumeData('languages', data.languages);
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:6050/api/resume/additional', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ certifications: data.certifications, languages: data.languages })
            });

            const resData = await response.json();
            if (resData.success) {
                nextStep();
            } else {
                alert(resData.message || "Something went wrong");
            }
        } catch (error) {
            console.error("API Error:", error);
            alert("Server connection failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-2">
                <h4 className="fw-bold mb-0" style={{ background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Certifications & Languages
                </h4>
                <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>Provide metadata regarding non-academic achievements.</p>
            </div>
            <hr className="border-secondary opacity-25 my-2" />

            <div style={{ maxHeight: '410px', overflowY: 'auto', paddingRight: '5px' }}>

                {/* Certifications Block */}
                <div className="d-flex justify-content-between align-items-center mt-2 mb-2">
                    <h6 className="text-info mb-0 fw-semibold">Certifications</h6>
                    <button type="button" onClick={() => appendCert({ name: '', organization: '', issueDate: '' })} className="btn btn-outline-info btn-sm py-0.5 px-2" style={{ fontSize: '0.75rem', borderRadius: '6px' }}>+ Add Certificate</button>
                </div>
                {certFields.map((field, index) => (
                    <div key={field.id} className="row g-2 mb-2 p-2 border border-secondary border-opacity-10 rounded-3 align-items-end">
                        <div className="col-12 col-sm-5">
                            <input {...register(`certifications.${index}.name`)} className="form-control glass-input py-1" placeholder="Certificate Name" style={{ fontSize: '0.8rem' }} />
                        </div>
                        <div className="col-12 col-sm-4">
                            <input {...register(`certifications.${index}.organization`)} className="form-control glass-input py-1" placeholder="Issuer Organization" style={{ fontSize: '0.8rem' }} />
                        </div>
                        <div className="col-9 col-sm-2">
                            <input type="month" {...register(`certifications.${index}.issueDate`)} className="form-control glass-input py-1" style={{ fontSize: '0.8rem' }} />
                        </div>
                        <div className="col-3 col-sm-1 text-end">
                            <button type="button" onClick={() => removeCert(index)} className="btn btn-sm btn-outline-danger py-1" style={{ fontSize: '0.75rem' }}>X</button>
                        </div>
                    </div>
                ))}

                {/* Languages Block */}
                <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
                    <h6 className="text-info mb-0 fw-semibold">Languages</h6>
                    <button type="button" onClick={() => appendLang({ name: '', level: 'Fluent' })} className="btn btn-outline-info btn-sm py-0.5 px-2" style={{ fontSize: '0.75rem', borderRadius: '6px' }}>+ Add Language</button>
                </div>
                {langFields.map((field, index) => (
                    <div key={field.id} className="row g-2 mb-2 p-2 border border-secondary border-opacity-10 rounded-3 align-items-end">
                        <div className="col-6 col-sm-6">
                            <input {...register(`languages.${index}.name`)} className="form-control glass-input py-1" placeholder="Language (e.g. English)" style={{ fontSize: '0.8rem' }} />
                        </div>
                        <div className="col-4 col-sm-5">
                            <select {...register(`languages.${index}.level`)} className="form-select glass-input py-1" style={{ fontSize: '0.8rem' }}>
                                <option value="Basic">Basic</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Fluent">Fluent</option>
                                <option value="Native">Native</option>
                            </select>
                        </div>
                        <div className="col-2 col-sm-1 text-end">
                            <button type="button" onClick={() => removeLang(index)} className="btn btn-sm btn-outline-danger py-1" style={{ fontSize: '0.75rem' }}>X</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="d-flex justify-content-between mt-3 pt-2 border-top border-secondary border-opacity-25">
                <button type="button" onClick={prevStep} className="btn btn-secondary py-1.5 px-4" style={{ fontSize: '0.9rem', borderRadius: '10px' }}>Back</button>
                <button type="submit" disabled={loading} className="btn btn-premium py-1.5 px-4" style={{ fontSize: '0.9rem' }}>
                    {loading ? 'Saving...' : 'Save & Next'}
                </button>
            </div>
        </form>
    );
}