import { create } from 'zustand';

export const useResumeStore = create((set) => ({
    currentStep: 1,
    // Default template ID 'template-sidebar' (Image 1 jaisa)
    selectedTemplate: localStorage.getItem('selectedTemplate') || 'template-sidebar',

    resumeData: {
        personalInfo: { fullName: '', title: '', email: '', phone: '', location: '', linkedin: '', github: '' },
        summary: '',
        skills: [],
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        languages: []
    },

    setTemplate: (templateId) => {
        localStorage.setItem('selectedTemplate', templateId);
        set({ selectedTemplate: templateId });
    },

    setStep: (step) => set({ currentStep: step }),
    nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
    prevStep: () => set((state) => ({ currentStep: state.currentStep - 1 })),
    updateResumeData: (section, data) => set((state) => ({ resumeData: { ...state.resumeData, [section]: data } })),
    setFullResume: (data) => set({ resumeData: data }),
    resetForm: () => set({ currentStep: 1, resumeData: { personalInfo: {}, summary: '', skills: [], education: [], experience: [], projects: [], certifications: [], languages: [] } })
}));