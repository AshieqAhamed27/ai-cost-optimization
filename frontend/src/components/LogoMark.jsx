import React from 'react';

export default function LogoMark({ className = 'h-11 w-11' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="64" height="64" rx="14" fill="#07111F" />
      <rect x="4" y="4" width="56" height="56" rx="11" stroke="#1E4960" strokeWidth="2" />
      <path
        d="M32 9.5L48 16.1V29.4C48 40.3 41.5 49.2 32 53C22.5 49.2 16 40.3 16 29.4V16.1L32 9.5Z"
        fill="#102234"
        stroke="#6EE7B7"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M22 39L28 34L34 37L43 26"
        stroke="#FDE047"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 22H40"
        stroke="#38BDF8"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M24 28H34"
        stroke="#F8FAFC"
        strokeOpacity="0.85"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
