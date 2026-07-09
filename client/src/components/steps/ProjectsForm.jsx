import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useResumeStore } from '../../store/useResumeStore';

export default function ProjectsForm() {
    const { resumeData, updateResumeData, nextStep, prevStep } = useResumeStore();
    const [loading, setLoading] = useState(false);

    const { register, control, handleSubmit } = useForm({
        defaultValues: {
            projects: resumeData.projects.length > 0 ? resumeData.projects : [{
                name: '', techStackInput: '', description: '', github: '', liveLink: ''
            }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "projects" });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const formattedProjects = data.projects.map(proj => ({
                ...proj,
                techStack: proj.techStackInput.split(',').map(s => s.trim()).filter(s => s !== '')
            }));

            updateResumeData('projects', formattedProjects);
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:6050/api/resume/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ projects: formattedProjects })
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
                        Projects
                    </h4>
                    <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>Showcase your technical projects and implementations.</p>
                </div>
                <button
                    type="button"
                    onClick={() => append({ name: '', techStackInput: '', description: '', github: '', liveLink: '' })}
                    className="btn btn-premium py-1 px-3 btn-sm"
                    style={{ fontSize: '0.8rem' }}
                >
                    + Add Project
                </button>
            </div>
            <hr className="border-secondary opacity-25 my-2" />

            <div style={{ maxHeight: '410px', overflowY: 'auto', paddingRight: '5px' }}>
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
                                <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Project Name *</label>
                                <input {...register(`projects.${index}.name`, { required: true })} className="form-control glass-input py-1.5" placeholder="e.g. E-Commerce Platform" style={{ fontSize: '0.85rem' }} />
                            </div>

                            <div className="col-12 col-sm-6">
                                <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Tech Stack (Comma Separated) *</label>
                                <input {...register(`projects.${index}.techStackInput`, { required: true })} className="form-control glass-input py-1.5" placeholder="e.g. React, Node.js, MongoDB" style={{ fontSize: '0.85rem' }} />
                            </div>

                            <div className="col-12 col-sm-6">
                                <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>GitHub Repository Link</label>
                                <input {...register(`projects.${index}.github`)} className="form-control glass-input py-1.5" placeholder="github.com/username/repo" style={{ fontSize: '0.85rem' }} />
                            </div>

                            <div className="col-12 col-sm-6">
                                <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Live Demo Link</label>
                                <input {...register(`projects.${index}.liveLink`)} className="form-control glass-input py-1.5" placeholder="project-demo.com" style={{ fontSize: '0.85rem' }} />
                            </div>

                            <div className="col-12">
                                <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Project Description *</label>
                                <textarea {...register(`projects.${index}.description`, { required: true })} className="form-control glass-input py-1.5" rows="2" placeholder="Brief description of project core engineering features..." style={{ fontSize: '0.85rem', resize: 'none' }} />
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