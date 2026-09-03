import React from 'react';
import {
  Mail,
  ShieldCheck,
  ArrowUpRight,
  Info,
  HelpCircle,
  Building2,
  HeartHandshake,
  FileText,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SurplusXLogo } from './SurplusXLogo';

export const SurplusXFooter: React.FC = () => {
  const { currentUser, activeView, setActiveView } = useApp();

  const handleLinkClick = (targetView: string, routePath: string) => {
    // 1. Sync window path
    if (window.location.pathname !== routePath) {
      window.history.pushState(null, '', routePath);
    }

    // 2. Auth-aware role routing for Business and NGO links
    if (targetView === 'business') {
      if (currentUser?.role === 'BUSINESS') {
        setActiveView('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (targetView === 'ngo') {
      if (currentUser?.role === 'NGO') {
        setActiveView('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // 3. Set active view & scroll up
    setActiveView(targetView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-slate-900/95 text-slate-300 border-t border-slate-800/80 backdrop-blur-xl relative overflow-hidden select-none">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-10">
          
          {/* 1. BRAND SECTION (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <SurplusXLogo size="md" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rescue Surplus. Create Impact.</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Connecting surplus food with people, businesses, and organizations to reduce waste and create meaningful impact.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>FSSAI Compliant • Verified 1:1 Identity Escrow</span>
            </div>
          </div>

          {/* 2. PLATFORM LINKS (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Platform
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleLinkClick('about', '/about')}
                  className={`w-full text-left transition-colors flex items-center justify-between group cursor-pointer ${
                    activeView === 'about' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    About SurplusX
                  </span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('how-it-works', '/how-it-works')}
                  className={`w-full text-left transition-colors flex items-center justify-between group cursor-pointer ${
                    activeView === 'how-it-works' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    How It Works
                  </span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('business', '/business')}
                  className={`w-full text-left transition-colors flex items-center justify-between group cursor-pointer ${
                    activeView === 'business' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    For Businesses
                  </span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('ngo', '/ngo')}
                  className={`w-full text-left transition-colors flex items-center justify-between group cursor-pointer ${
                    activeView === 'ngo' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <HeartHandshake className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    For NGOs
                  </span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('support', '/support')}
                  className={`w-full text-left transition-colors flex items-center justify-between group cursor-pointer ${
                    activeView === 'support' || activeView === 'help' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    Contact / Support
                  </span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            </ul>
          </div>

          {/* 3. LEGAL LINKS (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Legal
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleLinkClick('privacy', '/privacy')}
                  className={`w-full text-left transition-colors flex items-center justify-between group cursor-pointer ${
                    activeView === 'privacy' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    Privacy Policy
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('terms', '/terms')}
                  className={`w-full text-left transition-colors flex items-center justify-between group cursor-pointer ${
                    activeView === 'terms' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    Terms & Conditions
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* 4. CONTACT & SUPPORT (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Contact & Support
            </h3>
            <div className="pt-1">
              <a
                href="mailto:surplusx.support@gmail.com"
                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-all group max-w-full cursor-pointer shadow-xs"
                title="Send an email to SurplusX Support"
              >
                <Mail className="w-4 h-4 shrink-0 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="truncate">surplusx.support@gmail.com</span>
              </a>
            </div>
            <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
              For assistance with orders, merchant onboarding, or NGO partnerships, email our team anytime.
            </p>
          </div>

        </div>

        {/* 5. FOOTER BOTTOM BAR */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 SurplusX. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => handleLinkClick('privacy', '/privacy')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => handleLinkClick('terms', '/terms')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <span>•</span>
            <button
              onClick={() => handleLinkClick('support', '/support')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Support Center
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
