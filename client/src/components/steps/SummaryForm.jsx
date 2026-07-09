import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useResumeStore } from '../../store/useResumeStore';

export default function SummaryForm() {
    const { resumeData, updateResumeData, nextStep, prevStep } = useResumeStore();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { summary: resumeData.summary }
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            updateResumeData('summary', data.summary);
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:6050/api/resume/summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ summary: data.summary })
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
                    Professional Summary
                </h4>
                <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>Write a short and impactful summary of your career achievements.</p>
            </div>
            <hr className="border-secondary opacity-25 my-2" />

            <div className="row g-2">
                <div className="col-12">
                    <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Summary *</label>
                    <textarea
                        {...register('summary', { required: 'Summary is required' })}
                        className="form-control glass-input py-2"
                        rows="5"
                        placeholder="e.g. MERN Stack Developer with 2 years of experience in React, Node.js, Express and MongoDB..."
                        style={{ fontSize: '0.85rem', resize: 'none' }}
                    />
                    {errors.summary && <div className="text-danger mt-0" style={{ fontSize: '0.7rem' }}>{errors.summary.message}</div>}
                </div>
            </div>

            <div className="d-flex justify-content-between mt-3 pt-2 border-top border-secondary border-opacity-25">
                <button
                    type="button"
                    onClick={prevStep}
                    className="btn btn-secondary py-1.5 px-4"
                    style={{ fontSize: '0.9rem', borderRadius: '10px' }}
                >
                    Back
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-premium py-1.5 px-4"
                    style={{ fontSize: '0.9rem' }}
                >
                    {loading ? 'Saving...' : 'Save & Next Section'}
                </button>
            </div>
        </form>
    );
}