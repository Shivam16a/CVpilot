// client/src/components/ResumeWizard.jsx
import React from 'react';
import { useResumeStore } from '../store/useResumeStore';
import PersonalInfoForm from './steps/PersonalInfoForm';
import SummaryForm from './steps/SummaryForm';
import SkillsForm from './steps/SkillsForm';
import EducationForm from './steps/EducationForm';
import ExperienceForm from './steps/ExperienceForm';
import ProjectsForm from './steps/ProjectsForm';
import AdditionalInfoForm from './steps/AdditionalInfoForm';
import FinalReviewStep from './steps/FinalReviewStep';
import '../styles/dashboard.css';

const totalSteps = 8;

export default function ResumeWizard() {
    const { currentStep } = useResumeStore();

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <PersonalInfoForm />;
            case 2: return <SummaryForm />;
            case 3: return <SkillsForm />;
            case 4: return <EducationForm />;
            case 5: return <ExperienceForm />;
            case 6: return <ProjectsForm />;
            case 7: return <AdditionalInfoForm />;
            case 8: return <FinalReviewStep />;
            default: return <PersonalInfoForm />;
        }
    };

    const progressPercentage = Math.round((currentStep / totalSteps) * 100);

    return (
        <div className="w-100 px-0 px-md-2">
            <div className="card glass-card p-3 p-sm-4 p-md-4 text-white border-0 shadow-lg">
                <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                        <span className="badge bg-dark border border-secondary px-2.5 py-1.5 rounded-pill text-info small">
                            Step {currentStep} of {totalSteps}
                        </span>
                        <span className="text-white-50 small">
                            {progressPercentage}% Completed
                        </span>
                    </div>

                    <div className="progress custom-progress" style={{ height: '6px' }}>
                        <div
                            className="progress-bar custom-progress-bar"
                            role="progressbar"
                            style={{ width: `${progressPercentage}%` }}
                            aria-valuenow={progressPercentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                        />
                    </div>
                </div>

                <div className="mt-2">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
}