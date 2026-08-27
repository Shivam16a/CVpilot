import React from 'react';
import { useResumeStore } from '../store/useResumeStore';
import PersonalInfoForm from './steps/PersonalInfoForm';
import SummaryForm from './steps/SummaryForm';
import SkillsForm from './steps/SkillsForm';
import ExperienceForm from './steps/ExperienceForm';
import ProjectsForm from './steps/ProjectsForm';
import EducationForm from './steps/EducationForm';
import AdditionalInfoForm from './steps/AdditionalInfoForm';
import FinalReviewStep from './steps/FinalReviewStep';

export default function ResumeWizard() {
    const { currentStep } = useResumeStore();

    const renderStepComponent = () => {
        switch (currentStep) {
            case 1: return <PersonalInfoForm />;
            case 2: return <SummaryForm />;
            case 3: return <SkillsForm />;
            case 4: return <ExperienceForm />;
            case 5: return <ProjectsForm />;
            case 6: return <EducationForm />;
            case 7: return <AdditionalInfoForm />;
            case 8: return <FinalReviewStep />;
            default: return <PersonalInfoForm />;
        }
    };

    return (
        <div className="glass-card p-4 text-white shadow-lg mb-4 position-relative overflow-hidden">
            {/* Step Counter */}
            <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2.5 py-1">
                    Step {currentStep} of 8
                </span>
                <span className="small text-white-50">
                    {Math.round((currentStep / 8) * 100)}% Completed
                </span>
            </div>

            {/* Progress Bar */}
            <div className="progress mb-4 bg-dark bg-opacity-50" style={{ height: '6px', borderRadius: '10px' }}>
                <div
                    className="progress-bar bg-gradient-to-r from-info to-primary transition-all"
                    style={{ width: `${(currentStep / 8) * 100}%`, borderRadius: '10px' }}
                ></div>
            </div>

            {/* Active Step Content */}
            <div className="animate-fade-in">
                {renderStepComponent()}
            </div>
        </div>
    );
}