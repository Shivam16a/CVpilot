// client/src/components/steps/PersonalInfoForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useResumeStore } from '../../store/useResumeStore';

export default function PersonalInfoForm() {
    const { resumeData, updateResumeData, nextStep } = useResumeStore();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: resumeData.personalInfo
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            updateResumeData('personalInfo', data);
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:6050/api/resume/personal-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
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
                    Personal Information
                </h4>
                <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>Provide your contact coordinates below.</p>
            </div>
            <hr className="border-secondary opacity-25 my-2" />

            <div className="row g-2">
                <div className="col-12 col-sm-6">
                    <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Full Name *</label>
                    <input
                        {...register('fullName', { required: 'Full name is required' })}
                        className="form-control glass-input py-1.5"
                        placeholder="shivam kumar"
                        style={{ fontSize: '0.85rem' }}
                    />
                    {errors.fullName && <div className="text-danger mt-0" style={{ fontSize: '0.7rem' }}>{errors.fullName.message}</div>}
                </div>

                <div className="col-12 col-sm-6">
                    <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Professional Title *</label>
                    <input
                        {...register('title', { required: 'Professional title is required' })}
                        placeholder="e.g. MERN Stack Developer"
                        className="form-control glass-input py-1.5"
                        style={{ fontSize: '0.85rem' }}
                    />
                    {errors.title && <div className="text-danger mt-0" style={{ fontSize: '0.7rem' }}>{errors.title.message}</div>}
                </div>

                <div className="col-12 col-sm-6">
                    <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Email Address *</label>
                    <input
                        type="email"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                        })}
                        className="form-control glass-input py-1.5"
                        placeholder="shivam@example.com"
                        style={{ fontSize: '0.85rem' }}
                    />
                    {errors.email && <div className="text-danger mt-0" style={{ fontSize: '0.7rem' }}>{errors.email.message}</div>}
                </div>

                <div className="col-12 col-sm-6">
                    <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Phone Number *</label>
                    <input
                        {...register('phone', { required: 'Phone number is required' })}
                        className="form-control glass-input py-1.5"
                        placeholder="+91 XXXXX XXXXX"
                        style={{ fontSize: '0.85rem' }}
                    />
                    {errors.phone && <div className="text-danger mt-0" style={{ fontSize: '0.7rem' }}>{errors.phone.message}</div>}
                </div>

                <div className="col-12">
                    <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Current Location *</label>
                    <input
                        {...register('location', { required: 'Location is required' })}
                        placeholder="e.g. New Delhi, India"
                        className="form-control glass-input py-1.5"
                        style={{ fontSize: '0.85rem' }}
                    />
                    {errors.location && <div className="text-danger mt-0" style={{ fontSize: '0.7rem' }}>{errors.location.message}</div>}
                </div>

                <div className="col-12 col-sm-6">
                    <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>LinkedIn Profile URL</label>
                    <input
                        {...register('linkedin')}
                        placeholder="linkedin.com/in/username"
                        className="form-control glass-input py-1.5"
                        style={{ fontSize: '0.85rem' }}
                    />
                </div>

                <div className="col-12 col-sm-6">
                    <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>GitHub Profile URL</label>
                    <input
                        {...register('github')}
                        placeholder="github.com/username"
                        className="form-control glass-input py-1.5"
                        style={{ fontSize: '0.85rem' }}
                    />
                </div>
            </div>

            <div className="d-flex justify-content-end mt-3 pt-2 border-top border-secondary border-opacity-25">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-premium w-100 w-sm-auto py-1.5 px-4"
                    style={{ fontSize: '0.9rem' }}
                >
                    {loading ? 'Securing Data...' : 'Save & Next Section'}
                </button>
            </div>
        </form>
    );
}