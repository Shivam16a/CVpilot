import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useResumeStore } from '../../store/useResumeStore';

export default function EducationForm() {
    const { resumeData, updateResumeData, nextStep, prevStep } = useResumeStore();
    const [loading, setLoading] = useState(false);

    const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            education: resumeData.education.length > 0 ? resumeData.education : [{
                degree: '', course: '', institute: '', location: '', startDate: '', endDate: '', score: '', isCurrent: false
            }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "education"
    });

    const watchAllFields = watch("education");

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            updateResumeData('education', data.education);
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:6050/api/resume/education', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ education: data.education })
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
                        Education Timeline
                    </h4>
                    <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>Add your academic qualifications details logically.</p>
                </div>
                <button
                    type="button"
                    onClick={() => append({ degree: '', course: '', institute: '', location: '', startDate: '', endDate: '', score: '', isCurrent: false })}
                    className="btn btn-premium py-1 px-3 btn-sm"
                    style={{ fontSize: '0.8rem' }}
                >
                    + Add Education
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
                                <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Degree *</label>
                                <input
                                    {...register(`education.${index}.degree`, { required: 'Required' })}
                                    className="form-control glass-input py-1.5"
                                    placeholder="e.g. B.Tech, BSC"
                                    style={{ fontSize: '0.85rem' }}
                                />
                            </div>

                            <div className="col-12 col-sm-6">
                                <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Course / Specialization *</label>
                                <input
                                    {...register(`education.${index}.course`, { required: 'Required' })}
                                    className="form-control glass-input py-1.5"
                                    placeholder="e.g. Computer Science"
                                    style={{ fontSize: '0.85rem' }}
                                />
                            </div>

                            <div className="col-12 col-sm-8">
                                <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>College / University *</label>
                                <input
                                    {...register(`education.${index}.institute`, { required: 'Required' })}
                                    className="form-control glass-input py-1.5"
                                    placeholder="e.g. IIT Delhi"
                                    style={{ fontSize: '0.85rem' }}
                                />
                            </div>

                            <div className="col-12 col-sm-4">
                                <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>CGPA / % *</label>
                                <input
                                    {...register(`education.${index}.score`, { required: 'Required' })}
                                    className="form-control glass-input py-1.5"
                                    placeholder="e.g. 9.2 or 85%"
                                    style={{ fontSize: '0.85rem' }}
                                />
                            </div>

                            <div className="col-12 col-sm-4">
                                <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Start Date *</label>
                                <input
                                    type="month"
                                    {...register(`education.${index}.startDate`, { required: 'Required' })}
                                    className="form-control glass-input py-1.5"
                                    style={{ fontSize: '0.85rem' }}
                                />
                            </div>

                            <div className="col-12 col-sm-4">
                                <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>End Date</label>
                                <input
                                    type="month"
                                    disabled={watchAllFields?.[index]?.isCurrent}
                                    {...register(`education.${index}.endDate`)}
                                    className="form-control glass-input py-1.5"
                                    style={{ fontSize: '0.85rem' }}
                                />
                            </div>

                            <div className="col-12 col-sm-4 d-flex align-items-center mt-4">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        id={`edu-current-${index}`}
                                        {...register(`education.${index}.isCurrent`)}
                                        className="form-check-input bg-dark border-secondary"
                                    />
                                    <label htmlFor={`edu-current-${index}`} className="form-check-label small text-light opacity-75" style={{ fontSize: '0.8rem' }}>Currently Studying</label>
                                </div>
                            </div>
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