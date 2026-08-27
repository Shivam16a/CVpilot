// client/src/components/steps/PersonalInfoForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useResumeStore } from '../../store/useResumeStore';

export default function PersonalInfoForm() {
    const { resumeData, updateResumeData, nextStep } = useResumeStore();

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: resumeData.personalInfo || {}
    });

    // 🚀 NO DB CALL: Updates local state only & goes to Step 2
    const onSubmit = (data) => {
        updateResumeData('personalInfo', data);
        nextStep();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <h4 className="fw-bold mb-3 glow-title">Personal Information</h4>
            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label small text-white-50">Full Name *</label>
                    <input
                        {...register('fullName', { required: 'Full Name is required' })}
                        className="form-control glass-input text-white"
                        placeholder="e.g. Vikramaditya Singh"
                    />
                    {errors.fullName && <span className="text-danger small">{errors.fullName.message}</span>}
                </div>
                <div className="col-md-6">
                    <label className="form-label small text-white-50">Job Title *</label>
                    <input
                        {...register('title', { required: 'Title is required' })}
                        className="form-control glass-input text-white"
                        placeholder="e.g. Senior DevOps & Cloud Engineer"
                    />
                    {errors.title && <span className="text-danger small">{errors.title.message}</span>}
                </div>
                <div className="col-md-6">
                    <label className="form-label small text-white-50">Email *</label>
                    <input
                        {...register('email', { required: 'Email is required' })}
                        className="form-control glass-input text-white"
                        placeholder="vikram@example.com"
                    />
                    {errors.email && <span className="text-danger small">{errors.email.message}</span>}
                </div>
                <div className="col-md-6">
                    <label className="form-label small text-white-50">Phone *</label>
                    <input
                        {...register('phone', { required: 'Phone is required' })}
                        className="form-control glass-input text-white"
                        placeholder="+91 9876543210"
                    />
                    {errors.phone && <span className="text-danger small">{errors.phone.message}</span>}
                </div>
                <div className="col-md-6">
                    <label className="form-label small text-white-50">Location</label>
                    <input
                        {...register('location')}
                        className="form-control glass-input text-white"
                        placeholder="Gurugram, India"
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label small text-white-50">LinkedIn Profile</label>
                    <input
                        {...register('linkedin')}
                        className="form-control glass-input text-white"
                        placeholder="linkedin.com/in/username"
                    />
                </div>

                {/* 🚀 ADDED: GitHub Profile Input */}
                <div className="col-md-6">
                    <label className="form-label small text-white-50">GitHub Profile</label>
                    <input
                        {...register('github')}
                        className="form-control glass-input text-white"
                        placeholder="github.com/username"
                    />
                </div>

                {/* 🚀 ADDED: Portfolio / Website Link Input */}
                <div className="col-md-6">
                    <label className="form-label small text-white-50">Portfolio / Personal Website</label>
                    <input
                        {...register('portfolio')}
                        className="form-control glass-input text-white"
                        placeholder="portfolio-website.com"
                    />
                </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
                <button type="submit" className="btn btn-info text-dark fw-bold px-4 py-1.5" style={{ borderRadius: '8px' }}>
                    Next Section ➡️
                </button>
            </div>
        </form>
    );
}