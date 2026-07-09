import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useResumeStore } from '../../store/useResumeStore';

export default function ExperienceForm() {
    const { resumeData, updateResumeData, nextStep, prevStep } = useResumeStore();
    const [loading, setLoading] = useState(false);

    const { register, control, handleSubmit, watch } = useForm({
        defaultValues: {
            experience: resumeData.experience.length > 0 ? resumeData.experience : [{
                role: '', company: '', location: '', type: 'Full-time', startDate: '', endDate: '', isCurrent: false, responsibilities: ''
            }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "experience" });
    const watchAllFields = watch("experience");

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Textarea value ko backend parsing ke liye bullet array/string formats me structured process karenge later stage pe
            updateResumeData('experience', data.experience);
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:6050/api/resume/experience', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ experience: data.experience })
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
            <div className="mb-2 d-flex justify-content-between align-items-center">
                <div>
                    <h4 className="fw-bold mb-0" style={{ background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Work Experience
                    </h4>
                    <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>Detail your professional history chronologically.</p>
                </div>
                <button
                    type="button"
                    onClick={() => append({ role: '', company: '', location: '', type: 'Full-time', startDate: '', endDate: '', isCurrent: false, responsibilities: '' })}
                    className="btn btn-premium py-1 px-3 btn-sm"
                    style={{ fontSize: '0.8rem' }}
                >
                    + Add Experience
                </button>
            </div>
            <hr className="border-secondary opacity-25 my-2" />

            <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '5px' }}>
                {fields.map((field, index) => (
                    <div key={field.id} className="p-3 mb-3 border border-secondary border-opacity-10 rounded-3 position-relative" style={{ background: 'rgba(255,255,255,0.01)' }}>
                        {fields.length > 1 && (
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="btn btn-danger btn-sm position-absolute"
                                style={{ top: '10px', right: '10px', fontSize: '0.75rem', borderRadius: '6px' }}
                            >
                                Remove
                            </button>
                        )}

                        <div className="row g-2">
                            <div className="col-12 col-sm-6">
                                <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Job Title / Role *</label>
                                <input
                                    {...register(`experience.${index}.role`, { required: true })}
                                    className="form-control glass-input py-1.5"
                                    placeholder="e.g. Software Engineer"
                                    style={{ fontSize: '0.85rem' }}
                                />
                            </div>

                            <div className="col-12 col-sm-6">
                                <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Company Name *</label>
                                <input
                                    {...register(`experience.${index}.company`, { required: true })}
                                    className="form-control glass-input py-1.5"
                                    placeholder="e.g. Google"
                                    style={{ fontSize: '0.85rem' }}
                                />
                            </div>

                            <div className="col-12 col-sm-6">
                                <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Employment Type</label>
                                <select {...register(`experience.${index}.type`)} className="form-select glass-input py-1.5" style={{ fontSize: '0.85rem' }}>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Freelance">Freelance</option>
                                </select>
                            </div>

                            <div className="col-12 col-sm-6">
                                <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Start Date *</label>
                                <input type="month" {...register(`experience.${index}.startDate`, { required: true })} className="form-control glass-input py-1.5" style={{ fontSize: '0.85rem' }} />
                            </div>

                            <div className="col-12 col-sm-6">
                                <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>End Date</label>
                                <input type="month" disabled={watchAllFields?.[index]?.isCurrent} {...register(`experience.${index}.endDate`)} className="form-control glass-input py-1.5" style={{ fontSize: '0.85rem' }} />
                            </div>

                            <div className="col-12 col-sm-6 d-flex align-items-center mt-4">
                                <div className="form-check">
                                    <input type="checkbox" id={`exp-current-${index}`} {...register(`experience.${index}.isCurrent`)} className="form-check-input bg-dark border-secondary" />
                                    <label htmlFor={`exp-current-${index}`} className="form-check-label small text-light opacity-75" style={{ fontSize: '0.8rem' }}>Currently Working</label>
                                </div>
                            </div>

                            <div className="col-12">
                                <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Responsibilities (One point per line) *</label>
                                <textarea
                                    {...register(`experience.${index}.responsibilities`, { required: true })}
                                    className="form-control glass-input py-1.5"
                                    rows="3"
                                    placeholder="• Developed REST APIs&#10;• Optimized MongoDB Queries"
                                    style={{ fontSize: '0.85rem', resize: 'none' }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="d-flex justify-content-between mt-3 pt-2 border-top border-secondary border-opacity-25">
                <button type="button" onClick={prevStep} className="btn btn-secondary py-1.5 px-4" style={{ fontSize: '0.9rem', borderRadius: '10px' }}>Back</button>
                <button type="submit" className="btn btn-premium py-1.5 px-4" style={{ fontSize: '0.9rem' }}>Save & Next</button>
            </div>
        </form>
    );
}