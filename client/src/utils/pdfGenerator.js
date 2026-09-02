// client/src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const safeText = (val) => {
    if (!val) return '';
    if (typeof val === 'object') return val.name || val.message || JSON.stringify(val);
    return String(val);
};

const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

// Helper to safely embed Base64 image
const embedImageSafely = (doc, base64Image, x, y, width, height) => {
    if (!base64Image) return false;
    try {
        const format = base64Image.includes('image/png') ? 'PNG' : 'JPEG';
        doc.addImage(base64Image, format, x, y, width, height);
        return true;
    } catch (e) {
        console.warn("Could not embed image into PDF:", e);
        return false;
    }
};

export const generateResumePDF = (resumeData, fileName = 'My_Resume', templateType = 'template-ats') => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;

    // Read stored profile avatar from LocalStorage
    const userAvatar = typeof window !== 'undefined' ? localStorage.getItem('user_avatar') : null;

    switch (templateType) {
        case 'template-sidebar':
            renderModernSidebar(doc, resumeData, pageWidth, pageHeight, margin, userAvatar);
            break;
        case 'template-corporate':
            renderCleanCorporate(doc, resumeData, pageWidth, pageHeight, margin);
            break;
        case 'template-header-banner':
            renderExecutiveBanner(doc, resumeData, pageWidth, pageHeight, margin, userAvatar);
            break;
        case 'template-classic-table':
            renderClassicAcademic(doc, resumeData, pageWidth, pageHeight, margin);
            break;
        case 'template-ats':
        default:
            renderStandardATS(doc, resumeData, pageWidth, pageHeight, margin);
            break;
    }

    const cleanFileName = fileName.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'Resume';
    doc.save(`${cleanFileName}.pdf`);
};

/* ====================================================================
   1. STANDARD ATS TEMPLATE (Clean text-only for parser compatibility)
   ==================================================================== */
function renderStandardATS(doc, data, pageWidth, pageHeight, margin) {
    let y = margin;
    const primaryColor = [17, 24, 39];
    const secondaryColor = [75, 85, 99];

    const checkPageBreak = (height) => {
        if (y + height > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
    };

    const drawTitle = (title) => {
        checkPageBreak(10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.text(title.toUpperCase(), margin, y);
        y += 2;
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.4);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;
    };

    const personal = data.personalInfo || {};
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...primaryColor);
    doc.text((personal.fullName || 'YOUR NAME').toUpperCase(), pageWidth / 2, y, { align: 'center' });
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.text(personal.title || 'Professional Title', pageWidth / 2, y, { align: 'center' });
    y += 5;

    const contactParts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.github].filter(Boolean);
    doc.setFontSize(8.5);
    doc.text(contactParts.join(' | '), pageWidth / 2, y, { align: 'center' });
    y += 8;

    if (data.summary) {
        drawTitle('Professional Summary');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 51, 51);
        const split = doc.splitTextToSize(safeText(data.summary), pageWidth - margin * 2);
        doc.text(split, margin, y);
        y += split.length * 4 + 4;
    }

    if (safeArray(data.skills).length > 0) {
        drawTitle('Technical Skills');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 51, 51);
        const skillsText = safeArray(data.skills).join(', ');
        const split = doc.splitTextToSize(skillsText, pageWidth - margin * 2);
        doc.text(split, margin, y);
        y += split.length * 4 + 4;
    }

    if (safeArray(data.experience).length > 0) {
        drawTitle('Work Experience');
        safeArray(data.experience).forEach((exp) => {
            checkPageBreak(15);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(...primaryColor);
            doc.text(`${safeText(exp.role)} — ${safeText(exp.company)}`, margin, y);

            const dates = `${safeText(exp.startDate)} – ${exp.isCurrent ? 'Present' : safeText(exp.endDate)}`;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(...secondaryColor);
            doc.text(dates, pageWidth - margin, y, { align: 'right' });
            y += 4.5;

            if (exp.responsibilities) {
                const list = Array.isArray(exp.responsibilities) ? exp.responsibilities : String(exp.responsibilities).split('\n');
                list.forEach((item) => {
                    const clean = safeText(item).replace(/^[-•*]\s*/, '');
                    if (!clean) return;
                    const split = doc.splitTextToSize(`•  ${clean}`, pageWidth - margin * 2 - 4);
                    checkPageBreak(split.length * 3.8);
                    doc.text(split, margin + 2, y);
                    y += split.length * 3.8 + 1;
                });
            }
            y += 2;
        });
    }

    if (safeArray(data.projects).length > 0) {
        drawTitle('Key Projects');
        safeArray(data.projects).forEach((proj) => {
            checkPageBreak(12);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(...primaryColor);
            doc.text(safeText(proj.name), margin, y);
            y += 4;

            if (proj.description) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8.5);
                doc.setTextColor(51, 51, 51);
                const split = doc.splitTextToSize(safeText(proj.description), pageWidth - margin * 2);
                doc.text(split, margin, y);
                y += split.length * 3.8 + 3;
            }
        });
    }

    if (safeArray(data.education).length > 0) {
        drawTitle('Education');
        safeArray(data.education).forEach((edu) => {
            checkPageBreak(10);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(...primaryColor);
            doc.text(`${safeText(edu.degree)} in ${safeText(edu.course)}`, margin, y);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(...secondaryColor);
            doc.text(`${safeText(edu.startDate)} - ${safeText(edu.endDate)}`, pageWidth - margin, y, { align: 'right' });
            y += 4;

            doc.text(`${safeText(edu.institute)} | Score: ${safeText(edu.score)}`, margin, y);
            y += 5;
        });
    }

    if (safeArray(data.certifications).length > 0) {
        drawTitle('Certifications');
        safeArray(data.certifications).forEach((cert) => {
            checkPageBreak(6);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(51, 51, 51);
            const certName = typeof cert === 'object' ? cert.name : cert;
            const certOrg = typeof cert === 'object' && cert.organization ? ` — ${cert.organization}` : '';
            doc.text(`•  ${certName}${certOrg}`, margin + 2, y);
            y += 4;
        });
    }
}

/* ====================================================================
   2. MODERN SIDEBAR TEMPLATE (Embeds Photo in Left Sidebar)
   ==================================================================== */
function renderModernSidebar(doc, data, pageWidth, pageHeight, margin, userAvatar) {
    const sidebarWidth = 65;
    const mainWidth = pageWidth - sidebarWidth;

    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, sidebarWidth, pageHeight, 'F');

    let leftY = margin;
    let rightY = margin;

    // 🚀 EMBED PHOTO IF AVAILABLE
    if (userAvatar) {
        const photoSize = 26;
        const photoX = (sidebarWidth - photoSize) / 2;
        const success = embedImageSafely(doc, userAvatar, photoX, leftY, photoSize, photoSize);
        leftY += success ? photoSize + 5 : 0;
    }

    const personal = data.personalInfo || {};
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    const nameSplit = doc.splitTextToSize((personal.fullName || 'YOUR NAME').toUpperCase(), sidebarWidth - 14);
    doc.text(nameSplit, 7, leftY);
    leftY += nameSplit.length * 4.5 + 2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(189, 195, 199);
    doc.text(personal.title || '', 7, leftY);
    leftY += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('CONTACT', 7, leftY);
    leftY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(236, 240, 241);
    [personal.email, personal.phone, personal.location, personal.linkedin, personal.github].filter(Boolean).forEach((info) => {
        const split = doc.splitTextToSize(safeText(info), sidebarWidth - 14);
        doc.text(split, 7, leftY);
        leftY += split.length * 3.4 + 1.5;
    });
    leftY += 4;

    if (safeArray(data.skills).length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text('SKILLS', 7, leftY);
        leftY += 4;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        safeArray(data.skills).forEach((skill) => {
            const split = doc.splitTextToSize(`• ${safeText(skill)}`, sidebarWidth - 14);
            doc.text(split, 7, leftY);
            leftY += split.length * 3.4 + 1;
        });
        leftY += 4;
    }

    if (safeArray(data.certifications).length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text('CERTIFICATIONS', 7, leftY);
        leftY += 4;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        safeArray(data.certifications).forEach((cert) => {
            const certName = typeof cert === 'object' ? cert.name : cert;
            const split = doc.splitTextToSize(`• ${safeText(certName)}`, sidebarWidth - 14);
            doc.text(split, 7, leftY);
            leftY += split.length * 3.4 + 1.2;
        });
    }

    const rightMargin = sidebarWidth + 8;
    const rightMaxWidth = mainWidth - 16;

    const drawRightSection = (title) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(44, 62, 80);
        doc.text(title.toUpperCase(), rightMargin, rightY);
        rightY += 2;
        doc.setDrawColor(44, 62, 80);
        doc.setLineWidth(0.4);
        doc.line(rightMargin, rightY, pageWidth - margin, rightY);
        rightY += 5;
    };

    if (data.summary) {
        drawRightSection('Career Objective');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 51, 51);
        const split = doc.splitTextToSize(safeText(data.summary), rightMaxWidth);
        doc.text(split, rightMargin, rightY);
        rightY += split.length * 3.8 + 5;
    }

    if (safeArray(data.experience).length > 0) {
        drawRightSection('Work Experience');
        safeArray(data.experience).forEach((exp) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(44, 62, 80);
            doc.text(`${safeText(exp.role)} — ${safeText(exp.company)}`, rightMargin, rightY);
            rightY += 4;

            if (exp.responsibilities) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(80, 80, 80);
                const list = Array.isArray(exp.responsibilities) ? exp.responsibilities : String(exp.responsibilities).split('\n');
                list.forEach((item) => {
                    const clean = safeText(item).replace(/^[-•*]\s*/, '');
                    if (!clean) return;
                    const split = doc.splitTextToSize(`• ${clean}`, rightMaxWidth);
                    doc.text(split, rightMargin, rightY);
                    rightY += split.length * 3.5 + 1;
                });
            }
            rightY += 3;
        });
    }

    if (safeArray(data.projects).length > 0) {
        drawRightSection('Projects');
        safeArray(data.projects).forEach((proj) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(44, 62, 80);
            doc.text(safeText(proj.name), rightMargin, rightY);
            rightY += 3.5;

            if (proj.description) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7.5);
                doc.setTextColor(80, 80, 80);
                const split = doc.splitTextToSize(safeText(proj.description), rightMaxWidth);
                doc.text(split, rightMargin, rightY);
                rightY += split.length * 3.5 + 3;
            }
        });
    }

    if (safeArray(data.education).length > 0) {
        drawRightSection('Education');
        safeArray(data.education).forEach((edu) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(44, 62, 80);
            doc.text(`${safeText(edu.degree)} in ${safeText(edu.course)}`, rightMargin, rightY);
            rightY += 3.5;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(100, 100, 100);
            doc.text(`${safeText(edu.institute)} (${safeText(edu.score)})`, rightMargin, rightY);
            rightY += 4.5;
        });
    }
}

/* ====================================================================
   3. CLEAN CORPORATE TEMPLATE
   ==================================================================== */
function renderCleanCorporate(doc, data, pageWidth, pageHeight, margin) {
    let y = margin;

    const checkPageBreak = (height) => {
        if (y + height > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
    };

    const personal = data.personalInfo || {};
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text((personal.fullName || 'YOUR NAME').toUpperCase(), pageWidth / 2, y, { align: 'center' });
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(personal.title || '', pageWidth / 2, y, { align: 'center' });
    y += 5;

    const contact = [personal.phone, personal.email, personal.location, personal.linkedin].filter(Boolean).join(' | ');
    doc.setFontSize(8);
    doc.text(contact, pageWidth / 2, y, { align: 'center' });
    y += 4;

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    const drawSection = (title) => {
        checkPageBreak(10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(title.toUpperCase(), margin, y);
        y += 2;
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
        y += 4;
    };

    if (data.summary) {
        drawSection('About Me');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        const split = doc.splitTextToSize(safeText(data.summary), pageWidth - margin * 2);
        checkPageBreak(split.length * 3.8);
        doc.text(split, margin, y);
        y += split.length * 3.8 + 4;
    }

    if (safeArray(data.skills).length > 0) {
        drawSection('Key Skills');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        const split = doc.splitTextToSize(safeArray(data.skills).join(' • '), pageWidth - margin * 2);
        checkPageBreak(split.length * 3.8);
        doc.text(split, margin, y);
        y += split.length * 3.8 + 4;
    }

    if (safeArray(data.experience).length > 0) {
        drawSection('Work Experience');
        safeArray(data.experience).forEach((exp) => {
            checkPageBreak(15);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(15, 23, 42);
            doc.text(`${safeText(exp.role)} — ${safeText(exp.company)}`, margin, y);

            const dates = `${safeText(exp.startDate)} - ${exp.isCurrent ? 'Present' : safeText(exp.endDate)}`;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(dates, pageWidth - margin, y, { align: 'right' });
            y += 4;

            if (exp.responsibilities) {
                const list = Array.isArray(exp.responsibilities) ? exp.responsibilities : String(exp.responsibilities).split('\n');
                list.forEach((item) => {
                    const clean = safeText(item).replace(/^[-•*]\s*/, '');
                    if (!clean) return;
                    const split = doc.splitTextToSize(`• ${clean}`, pageWidth - margin * 2 - 4);
                    checkPageBreak(split.length * 3.5);
                    doc.text(split, margin + 2, y);
                    y += split.length * 3.5 + 1;
                });
            }
            y += 2.5;
        });
    }

    if (safeArray(data.projects).length > 0) {
        drawSection('Projects');
        safeArray(data.projects).forEach((proj) => {
            checkPageBreak(12);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text(safeText(proj.name), margin, y);
            y += 3.5;

            if (proj.description) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(51, 65, 85);
                const split = doc.splitTextToSize(safeText(proj.description), pageWidth - margin * 2);
                checkPageBreak(split.length * 3.5);
                doc.text(split, margin, y);
                y += split.length * 3.5 + 2.5;
            }
        });
    }

    if (safeArray(data.education).length > 0) {
        drawSection('Education');
        safeArray(data.education).forEach((edu) => {
            checkPageBreak(8);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text(`${safeText(edu.degree)} in ${safeText(edu.course)} — ${safeText(edu.institute)}`, margin, y);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(`Score: ${safeText(edu.score)}`, pageWidth - margin, y, { align: 'right' });
            y += 4.5;
        });
    }
}

/* ====================================================================
   4. EXECUTIVE BANNER TEMPLATE (Embeds Photo in Top Header)
   ==================================================================== */
function renderExecutiveBanner(doc, data, pageWidth, pageHeight, margin, userAvatar) {
    let y = margin;

    const checkPageBreak = (neededHeight) => {
        if (y + neededHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
    };

    const drawBannerSectionTitle = (title) => {
        checkPageBreak(12);
        doc.setFillColor(71, 85, 105);
        doc.rect(margin, y, pageWidth - margin * 2, 5.5, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text(title.toUpperCase(), margin + 2, y + 4);
        y += 8.5;
    };

    const personal = data.personalInfo || {};

    // 🚀 EMBED PHOTO AT TOP RIGHT IF PRESENT
    if (userAvatar) {
        const photoWidth = 22;
        const photoHeight = 22;
        const photoX = pageWidth - margin - photoWidth;
        embedImageSafely(doc, userAvatar, photoX, y, photoWidth, photoHeight);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(14, 165, 233);
    doc.text((personal.fullName || 'YOUR NAME').toUpperCase(), margin, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text((personal.title || 'PROFESSIONAL TITLE').toUpperCase(), margin, y);
    y += 5;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    checkPageBreak(12);
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, pageWidth - margin * 2, 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('CONTACT INFO:', margin + 2, y + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const contactParts = [
        personal.email && `Email: ${personal.email}`,
        personal.phone && `Phone: ${personal.phone}`,
        personal.location && `Location: ${personal.location}`,
        personal.linkedin && `LinkedIn: ${personal.linkedin}`,
        personal.github && `GitHub: ${personal.github}`
    ].filter(Boolean);

    const contactStr = contactParts.join(' | ');
    const splitContact = doc.splitTextToSize(contactStr, pageWidth - margin * 2 - 4);
    doc.text(splitContact, margin + 2, y + 7.5);
    y += 14;

    if (data.summary) {
        drawBannerSectionTitle('Executive Summary');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        const split = doc.splitTextToSize(safeText(data.summary), pageWidth - margin * 2);
        checkPageBreak(split.length * 3.8);
        doc.text(split, margin, y);
        y += split.length * 3.8 + 4;
    }

    if (safeArray(data.skills).length > 0) {
        drawBannerSectionTitle('Technical Skills');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        const skillsText = safeArray(data.skills).join(', ');
        const split = doc.splitTextToSize(skillsText, pageWidth - margin * 2);
        checkPageBreak(split.length * 3.8);
        doc.text(split, margin, y);
        y += split.length * 3.8 + 4;
    }

    if (safeArray(data.experience).length > 0) {
        drawBannerSectionTitle('Work Experience');
        safeArray(data.experience).forEach((exp) => {
            checkPageBreak(15);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(30, 41, 59);
            doc.text(`${safeText(exp.role)} — ${safeText(exp.company)}`, margin, y);

            const dates = `${safeText(exp.startDate)} – ${exp.isCurrent ? 'Present' : safeText(exp.endDate)}`;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(dates, pageWidth - margin, y, { align: 'right' });
            y += 4;

            if (exp.responsibilities) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(51, 65, 85);

                const list = Array.isArray(exp.responsibilities)
                    ? exp.responsibilities
                    : String(exp.responsibilities).split('\n');

                list.forEach((item) => {
                    const clean = safeText(item).replace(/^[-•*]\s*/, '');
                    if (!clean) return;
                    const split = doc.splitTextToSize(`•  ${clean}`, pageWidth - margin * 2 - 4);
                    checkPageBreak(split.length * 3.6);
                    doc.text(split, margin + 2, y);
                    y += split.length * 3.6 + 1;
                });
            }
            y += 2.5;
        });
    }

    if (safeArray(data.projects).length > 0) {
        drawBannerSectionTitle('Key Projects');
        safeArray(data.projects).forEach((proj) => {
            checkPageBreak(12);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(30, 41, 59);

            const techStr = safeArray(proj.techStack).length > 0 ? ` (${safeArray(proj.techStack).join(', ')})` : '';
            doc.text(`${safeText(proj.name)}${techStr}`, margin, y);

            const links = [proj.liveLink, proj.github].filter(Boolean).join(' | ');
            if (links) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7.5);
                doc.setTextColor(14, 165, 233);
                doc.text(links, pageWidth - margin, y, { align: 'right' });
            }
            y += 4;

            if (proj.description) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(51, 65, 85);
                const split = doc.splitTextToSize(safeText(proj.description), pageWidth - margin * 2);
                checkPageBreak(split.length * 3.6);
                doc.text(split, margin, y);
                y += split.length * 3.6 + 2.5;
            }
        });
    }

    if (safeArray(data.education).length > 0) {
        drawBannerSectionTitle('Education Details');
        safeArray(data.education).forEach((edu) => {
            checkPageBreak(8);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(30, 41, 59);
            doc.text(`${safeText(edu.degree)} in ${safeText(edu.course)} — ${safeText(edu.institute)}`, margin, y);

            if (edu.score) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(100, 116, 139);
                doc.text(`Score: ${safeText(edu.score)}`, pageWidth - margin, y, { align: 'right' });
            }
            y += 4.5;
        });
    }

    if (safeArray(data.certifications).length > 0) {
        drawBannerSectionTitle('Certifications');
        safeArray(data.certifications).forEach((cert) => {
            checkPageBreak(6);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(51, 65, 85);

            const certName = typeof cert === 'object' ? cert.name : cert;
            const certOrg = typeof cert === 'object' && cert.organization ? ` — ${cert.organization}` : '';
            doc.text(`•  ${certName}${certOrg}`, margin + 2, y);
            y += 4;
        });
    }
}

/* ====================================================================
   5. CLASSIC ACADEMIC TEMPLATE (With Grid Table)
   ==================================================================== */
function renderClassicAcademic(doc, data, pageWidth, pageHeight, margin) {
    let y = margin;
    const personal = data.personalInfo || {};

    const checkPageBreak = (height) => {
        if (y + height > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
    };

    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text((personal.fullName || 'YOUR NAME').toUpperCase(), pageWidth / 2, y, { align: 'center' });
    y += 6;

    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.text(`${personal.location || ''} | Email: ${personal.email || ''} | Contact: ${personal.phone || ''}`, pageWidth / 2, y, { align: 'center' });
    y += 8;

    if (data.summary) {
        doc.setFont('times', 'bold');
        doc.setFontSize(10);
        doc.text('OBJECTIVE:', margin, y);
        y += 4;
        doc.setFont('times', 'italic');
        doc.setFontSize(8.5);
        const split = doc.splitTextToSize(safeText(data.summary), pageWidth - margin * 2);
        checkPageBreak(split.length * 3.8);
        doc.text(split, margin, y);
        y += split.length * 3.8 + 4;
    }

    if (safeArray(data.skills).length > 0) {
        doc.setFont('times', 'bold');
        doc.setFontSize(10);
        doc.text('TECHNICAL SKILLS:', margin, y);
        y += 4;
        doc.setFont('times', 'normal');
        doc.setFontSize(8.5);
        const split = doc.splitTextToSize(safeArray(data.skills).join(', '), pageWidth - margin * 2);
        checkPageBreak(split.length * 3.8);
        doc.text(split, margin, y);
        y += split.length * 3.8 + 4;
    }

    if (safeArray(data.experience).length > 0) {
        doc.setFont('times', 'bold');
        doc.setFontSize(10);
        doc.text('WORK EXPERIENCE:', margin, y);
        y += 4;
        safeArray(data.experience).forEach((exp) => {
            checkPageBreak(12);
            doc.setFont('times', 'bold');
            doc.setFontSize(9);
            doc.text(`${safeText(exp.role)} — ${safeText(exp.company)}`, margin, y);
            y += 4;

            if (exp.responsibilities) {
                doc.setFont('times', 'normal');
                doc.setFontSize(8.5);
                const list = Array.isArray(exp.responsibilities) ? exp.responsibilities : String(exp.responsibilities).split('\n');
                list.forEach((item) => {
                    const clean = safeText(item).replace(/^[-•*]\s*/, '');
                    if (!clean) return;
                    const split = doc.splitTextToSize(`• ${clean}`, pageWidth - margin * 2 - 4);
                    checkPageBreak(split.length * 3.5);
                    doc.text(split, margin + 2, y);
                    y += split.length * 3.5 + 1;
                });
            }
            y += 2.5;
        });
    }

    if (safeArray(data.education).length > 0) {
        checkPageBreak(20);
        doc.setFont('times', 'bold');
        doc.setFontSize(10);
        doc.text('EDUCATIONAL QUALIFICATIONS:', margin, y);
        y += 4;

        const tableBody = safeArray(data.education).map((edu) => [
            safeText(edu.degree),
            safeText(edu.institute),
            safeText(edu.endDate) || '2024',
            safeText(edu.score) || '-'
        ]);

        autoTable(doc, {
            startY: y,
            head: [['Degree/Course', 'University/Institute', 'Year', 'Score']],
            body: tableBody,
            theme: 'grid',
            styles: { font: 'times', fontSize: 8.5, textColor: [0, 0, 0] },
            headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold' },
            margin: { left: margin, right: margin },
            didDrawPage: (d) => {
                y = d.cursor.y + 6;
            }
        });
    }
}