import React from 'react';

export const SURPLUSX_LOGO_URL = 'https://cdn.phototourl.com/free/2026-08-15-8e258acf-1a06-4359-bf26-0c4bc459d63a.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  textColor?: 'dark' | 'light';
  className?: string;
  iconOnly?: boolean;
}

export const SurplusXLogo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  textColor = 'dark',
  className = '',
  iconOnly = false,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
  };

  const textDimensions = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-5xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 font-display select-none ${className}`} id="surplusx-brand-logo">
      {/* Official SurplusX Image Logo */}
      <div className={`relative flex-shrink-0 ${iconDimensions[size]} rounded-xl overflow-hidden shadow-xs`}>
        <img
          src={SURPLUSX_LOGO_URL}
          alt="SurplusX Logo"
          className="w-full h-full object-contain drop-shadow-xs"
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>

      {/* Brand Typography */}
      {showText && !iconOnly && (
        <div className="flex items-baseline tracking-tight font-extrabold">
          <span
            className={`${textDimensions[size]} ${
              textColor === 'light' ? 'text-white' : 'text-slate-900'
            } transition-colors`}
          >
            Surplus
          </span>
          <span className={`${textDimensions[size]} bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent`}>
            X
          </span>
        </div>
      )}
    </div>
  );
};

