// client/src/utils/coverLetterPDF.js
import jsPDF from 'jspdf';

export const generateCoverLetterPDF = (
    coverLetterText,
    personalInfo = {},
    metadata = { companyName: '', jobTitle: '' }
) => {
    if (!coverLetterText || !coverLetterText.trim()) {
        throw new Error("Cover letter content is empty.");
    }

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Helper: auto page-break check
    const checkPageBreak = (neededHeight = 10) => {
        if (y + neededHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
            return true;
        }
        return false;
    };

    // ==========================================
    // 1. APPLICANT LETTERHEAD HEADER
    // ==========================================
    const applicantName = (personalInfo.fullName || 'Candidate Name').toUpperCase();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39); // Deep Slate
    doc.text(applicantName, margin, y);
    y += 5.5;

    // Professional Title / Headline
    if (personalInfo.title) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(75, 85, 99);
        doc.text(personalInfo.title, margin, y);
        y += 5;
    }

    // Contact Subtitle Line
    const contactParts = [
        personalInfo.email,
        personalInfo.phone,
        personalInfo.location,
        personalInfo.linkedin ? 'LinkedIn' : null
    ].filter(Boolean);

    if (contactParts.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(107, 114, 128);
        doc.text(contactParts.join('  |  '), margin, y);
        y += 5.5;
    }

    // Modern Two-Tone Divider Line
    doc.setDrawColor(14, 165, 233); // Primary Accent
    doc.setLineWidth(0.8);
    doc.line(margin, y, margin + 28, y);

    doc.setDrawColor(229, 231, 235); // Subtle Border
    doc.setLineWidth(0.3);
    doc.line(margin + 28, y, pageWidth - margin, y);
    y += 8;

    // ==========================================
    // 2. FORMAL METADATA (Date & Recruiter Block)
    // ==========================================
    const formattedDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.text(`Date: ${formattedDate}`, margin, y);
    y += 6;

    // Recruiter Addressee
    const targetCompany = metadata.companyName?.trim() || 'Hiring Organization';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(31, 41, 55);
    doc.text('To:', margin, y);
    y += 4.5;

    doc.text('The Hiring Team & Talent Acquisition', margin, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.text(targetCompany, margin, y);
    y += 7;

    // ==========================================
    // 3. SUBJECT LINE (IF JOB TITLE PROVIDED)
    // ==========================================
    if (metadata.jobTitle?.trim()) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.8);
        doc.setTextColor(15, 23, 42);
        const subjectText = `SUBJECT: Application for ${metadata.jobTitle.trim()} Role`;
        doc.text(subjectText, margin, y);
        y += 6.5;
    }

    // ==========================================
    // 4. LETTER BODY PARAGRAPHS
    // ==========================================
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(31, 41, 55);
    const lineHeight = 4.6;

    // Clean AI raw output: remove redundant duplicate headers if already typed by AI
    let cleanText = coverLetterText
        .replace(/^Subject:.*$/im, '')
        .replace(/^Date:.*$/im, '')
        .trim();

    const rawParagraphs = cleanText.split(/\n\s*\n/);

    rawParagraphs.forEach((paragraph) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return;

        // Check if paragraph is a formal signoff like "Sincerely,"
        const isSignoff = /^(sincerely|warm regards|best regards|respectfully|regards|thank you),?$/i.test(trimmed);

        if (isSignoff) {
            checkPageBreak(25);
            y += 3;
            doc.setFont('helvetica', 'normal');
            doc.text(trimmed, margin, y);
            y += lineHeight + 1;
            return;
        }

        const lines = doc.splitTextToSize(trimmed, contentWidth);
        checkPageBreak(lines.length * lineHeight + 4);

        doc.text(lines, margin, y);
        y += lines.length * lineHeight + 3.8; // Space between paragraphs
    });

    // ==========================================
    // 5. SIGN-OFF SIGNATURE BLOCK
    // ==========================================
    checkPageBreak(18);
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text(personalInfo.fullName || 'Applicant', margin, y);
    y += 4.5;

    if (personalInfo.email || personalInfo.phone) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(107, 114, 128);
        const signoffContact = [personalInfo.email, personalInfo.phone].filter(Boolean).join('  |  ');
        doc.text(signoffContact, margin, y);
    }

    // ==========================================
    // 6. SAVE AS CLEAN SANITIZED PDF FILE
    // ==========================================
    const fileApplicant = (personalInfo.fullName || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileCompany = (metadata.companyName || 'Application').replace(/[^a-zA-Z0-9_-]/g, '_');

    doc.save(`${fileApplicant}_CoverLetter_${fileCompany}.pdf`);
};