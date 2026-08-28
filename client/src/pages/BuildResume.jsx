// client/src/pages/BuildResume.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // 🚀 Import query param hook
import DashboardLayout from '../components/DashboardLayout';
import ResumeWizard from '../components/ResumeWizard';
import ResumePreview from '../components/ResumePreview';
import { useResumeStore } from '../store/useResumeStore';

export default function BuildResume() {
    const [searchParams] = useSearchParams();
    const resumeId = searchParams.get('id'); // 🚀 1. Extract ?id= from URL

    const { currentStep, setFullResume, setStep, isNewResumeMode } = useResumeStore();
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const checkExistingResume = async () => {
            // Agar New Resume mode active hai aur koi specific ID request nahi ki gayi, toh skip kar do
            if (isNewResumeMode && !resumeId) {
                setPageLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');

                // 🚀 2. If ID present in URL, pass it to API, else call fallback endpoint
                const endpoint = resumeId
                    ? `http://localhost:6050/api/resume/get-resume?id=${resumeId}`
                    : 'http://localhost:6050/api/resume/get-resume';

                const response = await fetch(endpoint, {
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
    }, [setFullResume, setStep, isNewResumeMode, resumeId]); // 🚀 Added resumeId to dependencies

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