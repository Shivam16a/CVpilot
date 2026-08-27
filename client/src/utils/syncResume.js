// client/src/utils/syncResume.js
export const saveResumeToCloud = async (currentResumeData, selectedTemplate = 'template-ats') => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return { success: false, message: "No token found" };

        const response = await fetch('http://localhost:6050/api/resume/save-master', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ...currentResumeData, template: selectedTemplate })
        });

        const resData = await response.json();
        return resData;
    } catch (error) {
        console.error("Cloud Sync Helper Error:", error);
        return { success: false, error };
    }
};