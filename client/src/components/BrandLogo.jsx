// client/src/components/BrandLogo.jsx
import React, { useId } from 'react';
import { Link } from 'react-router-dom';

export default function BrandLogo({ size = 34, showText = true, to = "/" }) {
    // Unique ID prefix to avoid SVG gradient conflicts when rendered multiple times
    const uid = useId().replace(/:/g, '');

    return (
        <Link to={to} className="text-decoration-none d-inline-flex align-items-center gap-2.5 flex-shrink-0">
            {/* 🚀 Brand Icon Mark (Synced with Favicon) */}
            <svg
                width={size}
                height={size}
                viewBox="240 140 760 700"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
            >
                <defs>
                    {/* Main vibrant sweep gradient */}
                    <linearGradient id={`mainGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#008FEF" />
                        <stop offset="35%" stopColor="#3047E8" />
                        <stop offset="65%" stopColor="#9B20E8" />
                        <stop offset="85%" stopColor="#F52E8B" />
                        <stop offset="100%" stopColor="#FF7A00" />
                    </linearGradient>

                    {/* Top blue aerodynamic sweep */}
                    <linearGradient id={`blueGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="80%">
                        <stop offset="0%" stopColor="#176BEA" />
                        <stop offset="55%" stopColor="#008FEF" />
                        <stop offset="100%" stopColor="#18B9E8" />
                    </linearGradient>

                    {/* Lower energetic sweep */}
                    <linearGradient id={`orangeGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F23C21" />
                        <stop offset="48%" stopColor="#FF7510" />
                        <stop offset="100%" stopColor="#FFAE16" />
                    </linearGradient>
                </defs>

                {/* Outer Bold Circular C Shape */}
                <path
                    d="M 842 344 C 806 254 704 194 602 194 C 425 194 286 330 286 493 C 286 651 402 774 557 784 C 642 790 716 763 775 710 L 700 625 C 658 658 607 676 554 673 C 456 668 388 595 388 496 C 388 397 470 312 574 301 C 672 291 752 327 798 393 Z"
                    fill={`url(#mainGrad_${uid})`}
                />

                {/* Upper Blue Swoosh */}
                <path
                    d="M 469 389 C 518 317 599 293 684 293 C 757 293 823 321 857 365 C 874 387 867 405 846 421 C 823 439 795 450 768 452 C 746 454 731 446 713 432 C 666 394 613 366 558 365 C 523 365 493 374 469 389 Z"
                    fill={`url(#blueGrad_${uid})`}
                />

                {/* Lower Orange Energy Swoosh */}
                <path
                    d="M 558 631 C 616 658 674 641 722 598 L 781 541 C 808 515 832 495 858 496 C 893 497 918 520 922 550 C 929 606 887 674 839 719 C 783 773 704 800 618 799 C 541 798 469 772 418 726 C 459 754 513 758 558 743 C 611 726 651 697 682 661 C 648 674 604 672 558 631 Z"
                    fill={`url(#orangeGrad_${uid})`}
                />

                {/* High-Contrast Document / Resume Note Icon */}
                <g transform="translate(615, 495)">
                    {/* White Card Backplate */}
                    <rect
                        x="-66"
                        y="-94"
                        width="132"
                        height="176"
                        rx="20"
                        fill="#FFFFFF"
                        stroke="#0a0e1a"
                        strokeWidth="12"
                    />

                    {/* Folded Corner */}
                    <path d="M 22 -94 L 66 -50 L 22 -50 Z" fill="#93c5fd" />
                    <path
                        d="M 22 -94 L 22 -50 L 66 -50"
                        fill="none"
                        stroke="#0a0e1a"
                        strokeWidth="8"
                        strokeLinejoin="round"
                    />

                    {/* Data / ATS Scanning Lines */}
                    <rect x="-38" y="-18" width="76" height="14" rx="7" fill="#008FEF" />
                    <rect x="-38" y="10" width="62" height="14" rx="7" fill="#3047E8" />
                    <rect x="-38" y="38" width="48" height="14" rx="7" fill="#F52E8B" />
                </g>

                {/* Precision AI Sparkles */}
                <path
                    d="M 885 220 C 895 248 908 261 936 269 C 908 277 895 290 885 318 C 875 290 862 277 834 269 C 862 261 875 248 885 220 Z"
                    fill="#00D2FF"
                />
                <path
                    d="M 945 315 C 952 334 961 343 980 348 C 961 353 952 362 945 381 C 938 362 929 353 910 348 C 929 343 938 334 945 315 Z"
                    fill="#FF7A00"
                />
            </svg>

            {/* Modern Wordmark */}
            {showText && (
                <span
                    className="fw-bold tracking-tight text-white m-0 d-flex align-items-center"
                    style={{
                        fontSize: `${Math.max(18, size * 0.62)}px`,
                        letterSpacing: '-0.4px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        lineHeight: 1
                    }}
                >
                    <span className="text-white">CV</span>
                    <span
                        style={{
                            background: 'linear-gradient(135deg, #008FEF 0%, #00D2FF 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitFillColor: 'transparent',
                            fontWeight: '800',
                            color : "#00D2FF"
                        }}
                    >
                        Pilot
                    </span>
                </span>
            )}
        </Link>
    );
}