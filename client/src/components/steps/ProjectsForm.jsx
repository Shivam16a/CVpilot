import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useResumeStore } from '../../store/useResumeStore';

export default function ProjectsForm() {
    const { resumeData, updateResumeData, nextStep, prevStep } = useResumeStore();
    const [aiLoading, setAiLoading] = useState({}); // Track index-wise loading states

    const { register, control, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            projects: resumeData.projects.length > 0 ? resumeData.projects.map(p => ({
                ...p,
                // Default fallback string checking
                techStackInput: p.techStackInput || (Array.isArray(p.techStack) ? p.techStack.join(', ') : '')
            })) : [{
                name: '', techStackInput: '', description: '', github: '', liveLink: ''
            }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "projects" });

    // Live Tracking: Watch character updates inside form grid matrix
    const watchedProjects = watch("projects");

    // Live Sync Matrix: Stream character values instantly to Zustand live preview
    useEffect(() => {
        if (watchedProjects) {
            const formatted = watchedProjects.map(proj => ({
                ...proj,
                techStack: proj.techStackInput ? proj.techStackInput.split(',').map(s => s.trim()).filter(s => s !== '') : []
            }));
            updateResumeData('projects', formatted);
        }
    }, [watchedProjects, updateResumeData]);

    // ✨ Magic AI Project Description Enhancer Function
    const handleAIProjectDesc = async (index) => {
        const projectName = watchedProjects[index]?.name;
        const techStackInput = watchedProjects[index]?.techStackInput;
        const rawDesc = watchedProjects[index]?.description;

        if (!projectName || !rawDesc) {
            alert("Please fill Project Name and a basic Description first before invoking AI.");
            return;
        }

        setAiLoading(prev => ({ ...prev, [index]: true }));
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:6050/api/ai/project-desc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ projectName, techStack: techStackInput, rawDesc })
            });
            const resData = await response.json();

            if (resData.success) {
                // Insert high impact text inside targeted field matrix
                setValue(`projects.${index}.description`, resData.description);
            } else {
                alert(resData.message || "AI failed to optimize description.");
            }
        } catch (error) {
            console.error("AI Project Desc Error:", error);
            alert("Failed to establish secure cloud connection to AI.");
        } finally {
            setAiLoading(prev => ({ ...prev, [index]: false }));
        }
    };

    const onSubmit = (data) => {
        const formattedProjects = data.projects.map(proj => ({
            ...proj,
            techStack: proj.techStackInput ? proj.techStackInput.split(',').map(s => s.trim()).filter(s => s !== '') : []
        }));

        // State update and transient dynamic routing forward
        updateResumeData('projects', formattedProjects);
        nextStep();
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
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="form-label small text-light opacity-75 fw-medium mb-0" style={{ fontSize: '0.75rem' }}>Project Description *</label>

                                    {/* Responsive Magic AI Enhancement Dispatcher */}
                                    <button
                                        type="button"
                                        disabled={aiLoading[index]}
                                        onClick={() => handleAIProjectDesc(index)}
                                        className="btn btn-xs btn-outline-info py-0 px-2"
                                        style={{ fontSize: '0.7rem', borderRadius: '6px' }}
                                    >
                                        {aiLoading[index] ? '✨ Enhancing...' : '✨ Optimize with AI'}
                                    </button>
                                </div>
                                <textarea {...register(`projects.${index}.description`, { required: true })} className="form-control glass-input py-1.5" rows="3" placeholder="Write basic actions, then click 'Optimize with AI' to automatically transform it into highly professional ATS points..." style={{ fontSize: '0.85rem', resize: 'none' }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="d-flex justify-content-between mt-3 pt-2 border-top border-secondary border-opacity-25">
                <button type="button" onClick={prevStep} className="btn btn-secondary py-1.5 px-4" style={{ fontSize: '0.9rem', borderRadius: '10px' }}>Back</button>
                <button type="submit" className="btn btn-premium py-1.5 px-4" style={{ fontSize: '0.9rem' }}>
                    Save & Next Section
                </button>
            </div>
        </form>
    );
}