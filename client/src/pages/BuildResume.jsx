// client/src/pages/BuildResume.jsx
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ResumeWizard from '../components/ResumeWizard';

export default function BuildResume() {
    return (
        <DashboardLayout title="Live Resume Wizard">
            <ResumeWizard />
        </DashboardLayout>
    );
}