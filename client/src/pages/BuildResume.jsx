// client/src/pages/BuildResume.jsx
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ResumeWizard from '../components/ResumeWizard';
import ResumePreview from '../components/ResumePreview';
import { useResumeStore } from '../store/useResumeStore';

export default function BuildResume() {
    const { currentStep, setFullResume, setStep, isNewResumeMode } = useResumeStore();
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const checkExistingResume = async () => {
            // 🚨 CRITICAL FIX: Agar user new resume bana raha hai, toh DB se old fetch SKIP kar do
            if (isNewResumeMode) {
                setPageLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:6050/api/resume/get-resume', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const resData = await response.json();

                if (resData.success && resData.resume) {
                    setFullResume(resData.resume);
                    setStep(8);
                }
            } catch (error) {
                console.error("Persistence check failed:", error);
            } finally {
                setPageLoading(false);
            }
        };

        checkExistingResume();
    }, [setFullResume, setStep, isNewResumeMode]);

    if (pageLoading) {
        return (
            <DashboardLayout title="Loading Studio...">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <div className="spinner-border text-info" role="status">
                        <span className="visually-hidden">Syncing Cloud...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={currentStep === 8 ? "Review and Download Master Copy" : "Live Resume Studio"}>
            <div className="row g-3 justify-content-center">
                {currentStep === 8 ? (
                    <div className="col-12 animate-fade-in">
                        <ResumePreview />
                    </div>
                ) : (
                    <div className="col-12 col-xl-10">
                        <ResumeWizard />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}