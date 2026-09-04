// client/src/pages/BuildResume.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import ResumeWizard from '../components/ResumeWizard';
import ResumePreview from '../components/ResumePreview';
import { useResumeStore } from '../store/useResumeStore';
import axios from '../services/api'; // 🛡️ Hamara secured axios instance import karein

export default function BuildResume() {
    const [searchParams] = useSearchParams();
    const resumeId = searchParams.get('id');

    const { currentStep, setFullResume, setStep, isNewResumeMode } = useResumeStore();
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const checkExistingResume = async () => {
            // Agar New Resume mode active hai aur koi specific ID request nahi ki gayi, toh skip karein
            if (isNewResumeMode && !resumeId) {
                setPageLoading(false);
                return;
            }

            try {
                // 🚀 Relative route use karein — interceptor Render live URL aur Auth Token auto-inject karega
                const endpoint = resumeId
                    ? `/resume/get-resume?id=${resumeId}`
                    : '/resume/get-resume';

                const response = await axios.get(endpoint);

                if (response.data?.success && response.data?.resume) {
                    setFullResume(response.data.resume);
                    setStep(8);
                }
            } catch (error) {
                // 🛡️ Silent fail — Interceptor ne error sanitize kar diya hai, console par raw trace leak na karein
            } finally {
                setPageLoading(false);
            }
        };

        checkExistingResume();
    }, [setFullResume, setStep, isNewResumeMode, resumeId]);

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