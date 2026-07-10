// client/src/store/useResumeStore.js
import { create } from 'zustand';

export const useResumeStore = create((set) => ({
    currentStep: 1,
    resumeData: {
        personalInfo: { fullName: '', title: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' },
        summary: '',
        education: [],
        experience: [],
        projects: [],
        skills: [],
        certifications: [],
        languages: []
    },
    setStep: (step) => set({ currentStep: step }),
    nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
    prevStep: () => set((state) => ({ currentStep: state.currentStep - 1 })),
    updateResumeData: (section, data) =>
        set((state) => ({
            resumeData: {
                ...state.resumeData,
                [section]: { ...state.resumeData[section], ...data },
            },
        })),
    // New Action: Full hydration loader from Database
    setFullResume: (data) => set({ resumeData: data }),

    resetForm: () => set({ currentStep: 1, resumeData: { personalInfo: {}, summary: '', skills: [], education: [], experience: [], projects: [], certifications: [], languages: [] } })

}));
