// client/src/pages/BuildResume.jsx
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ResumeWizard from '../components/ResumeWizard';
import ResumePreview from '../components/ResumePreview';
import { useResumeStore } from '../store/useResumeStore';

export default function BuildResume() {
    const { currentStep } = useResumeStore();

    return (
        <DashboardLayout title={currentStep === 8 ? "Review Your Application Canvas" : "Live Resume Studio"}>
            <div className="row g-3 justify-content-center">
                {currentStep === 8 ? (
                    /* Last step par pure width me bada aur professional preview canvas dikhega */
                    <div className="col-12 animate-fade-in">
                        <ResumePreview />
                    </div>
                ) : (
                    /* Step 1 se 7 tak sirf single focused form panel dikhega bina side distraction ke */
                    <div className="col-12 col-xl-10">
                        <ResumeWizard />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}