// client/src/store/useResumeStore.js
import { create } from 'zustand';

const initialResumeState = {
    personalInfo: { fullName: '', title: '', email: '', phone: '', location: '', linkedin: '', github: '' },
    summary: '',
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    languages: []
};

export const useResumeStore = create((set) => ({
    currentStep: 1,
    selectedTemplate: localStorage.getItem('selectedTemplate') || 'template-ats',
    isNewResumeMode: false, // 🚀 NEW: Flag to stop auto-filling old database data

    resumeData: initialResumeState,

    setTemplate: (templateId) => {
        localStorage.setItem('selectedTemplate', templateId);
        set({ selectedTemplate: templateId });
    },

    setStep: (step) => set({ currentStep: step }),
    nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
    prevStep: () => set((state) => ({ currentStep: state.currentStep - 1 })),
    updateResumeData: (section, data) => set((state) => ({
        resumeData: { ...state.resumeData, [section]: data }
    })),

    setFullResume: (data) => set({ resumeData: data, isNewResumeMode: false }),

    loadSavedResume: (savedResume) => set({
        resumeData: {
            personalInfo: savedResume.personalInfo || {},
            summary: savedResume.summary || '',
            skills: savedResume.skills || [],
            education: savedResume.education || [],
            experience: savedResume.experience || [],
            projects: savedResume.projects || [],
            certifications: savedResume.certifications || [],
            languages: savedResume.languages || []
        },
        selectedTemplate: savedResume.template || 'template-ats',
        currentStep: 8,
        isNewResumeMode: false
    }),

    // 🚀 NEW RESUME RESET ACTION: Clears everything & enables blank mode
    // client/src/store/useResumeStore.js
    startNewResume: () => set({
        currentStep: 1,
        isNewResumeMode: true,
        resumeData: {
            _id: null, // Clear document ID so backend creates a NEW entry
            personalInfo: { fullName: '', title: '', email: '', phone: '', location: '', linkedin: '', github: '' },
            summary: '',
            skills: [],
            education: [],
            experience: [],
            projects: [],
            certifications: [],
            languages: []
        }
    })
}));