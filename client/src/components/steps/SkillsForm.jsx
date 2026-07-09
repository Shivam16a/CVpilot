import React, { useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';

export default function SkillsForm() {
    const { resumeData, updateResumeData, nextStep, prevStep } = useResumeStore();
    const [skills, setSkills] = useState(resumeData.skills || []);
    const [skillInput, setSkillInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddSkill = (e) => {
        e.preventDefault();
        if (skillInput.trim() && !skills.includes(skillInput.trim())) {
            const updatedSkills = [...skills, skillInput.trim()];
            setSkills(updatedSkills);
            updateResumeData('skills', updatedSkills);
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        const updatedSkills = skills.filter(skill => skill !== skillToRemove);
        setSkills(updatedSkills);
        updateResumeData('skills', updatedSkills);
    };

    const handleSave = async () => {
        if (skills.length === 0) {
            alert("Please add at least one skill.");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:6050/api/resume/skills', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ skills })
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
        <div>
            <div className="mb-2">
                <h4 className="fw-bold mb-0" style={{ background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Skills
                </h4>
                <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>Add keywords and technologies that match the ATS requirements.</p>
            </div>
            <hr className="border-secondary opacity-25 my-2" />

            <div className="row g-2 align-items-end mb-3">
                <div className="col-12 col-sm-9">
                    <label className="form-label small text-light opacity-75 fw-medium mb-1" style={{ fontSize: '0.75rem' }}>Add Skill *</label>
                    <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        className="form-control glass-input py-1.5"
                        placeholder="e.g. React, Node.js, MongoDB"
                        style={{ fontSize: '0.85rem' }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                    />
                </div>
                <div className="col-12 col-sm-3">
                    <button
                        type="button"
                        onClick={handleAddSkill}
                        className="btn btn-premium w-100 py-1.5"
                        style={{ fontSize: '0.85rem' }}
                    >
                        + Add Skill
                    </button>
                </div>
            </div>

            <div className="d-flex flex-wrap gap-2 p-3 border border-secondary border-opacity-10 rounded-3 mb-3" style={{ background: 'rgba(0,0,0,0.2)', minHeight: '60px' }}>
                {skills.length === 0 ? (
                    <span className="text-muted small my-auto">No skills added yet.</span>
                ) : (
                    skills.map((skill, index) => (
                        <span
                            key={index}
                            className="badge d-flex align-items-center gap-2 px-3 py-2 border border-info border-opacity-25"
                            style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', borderRadius: '20px', fontSize: '0.8rem' }}
                        >
                            {skill}
                            <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill)}
                                className="btn-close btn-close-white"
                                style={{ fontSize: '0.55rem', boxShadow: 'none' }}
                            ></button>
                        </span>
                    ))
                )}
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
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="btn btn-premium py-1.5 px-4"
                    style={{ fontSize: '0.9rem' }}
                >
                    {loading ? 'Saving...' : 'Save & Next Section'}
                </button>
            </div>
        </div>
    );
}