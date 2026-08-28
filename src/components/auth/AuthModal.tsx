import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Building,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Store,
  HeartHandshake,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SurplusXLogo } from '../SurplusXLogo';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    login,
    signup,
    pendingIntent,
    setPendingIntent,
    triggerToast,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [selectedRole, setSelectedRole] = useState<'CONSUMER' | 'BUSINESS' | 'NGO'>('CONSUMER');
  const [orgName, setOrgName] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    setIsLoading(true);
    try {
      // Find or construct user with matching or demo data
      const roleToUse: UserRole = email.includes('business')
        ? 'BUSINESS'
        : email.includes('ngo')
        ? 'NGO'
        : email.includes('admin')
        ? 'ADMIN'
        : email.includes('rider')
        ? 'RIDER'
        : 'CONSUMER';

      await login({
        id: `usr-${Date.now().toString().slice(-5)}`,
        name: email.split('@')[0].replace('.', ' ').toUpperCase() || 'SurplusX User',
        email,
        phone: phone || '+91 98450 12345',
        role: roleToUse,
        city: city || 'Bangalore',
        organizationName: roleToUse === 'BUSINESS' ? 'Organic Green Mart' : roleToUse === 'NGO' ? 'Hope Foundation' : undefined,
        isVerified: true,
        joinedDate: new Date().toISOString().split('T')[0],
      });
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!fullName || !email || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (!agreedTerms) {
      setErrorMsg('You must agree to the Terms of Service & Food Safety Pledge.');
      return;
    }
    setIsLoading(true);
    try {
      await signup(fullName, email, selectedRole, phone, orgName);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <div
      id="surplusx-auth-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <SurplusXLogo size="md" />
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                Join SurplusX
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Sign in or create an account to continue.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pending Intent Notice if user clicked a protected action */}
        {pendingIntent && (
          <div className="bg-emerald-50 border-b border-emerald-200/80 px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                {pendingIntent.description ||
                  `Action pending: ${pendingIntent.type.replace(/_/g, ' ')}. Please sign in to complete.`}
              </span>
            </div>
            <button
              onClick={() => setPendingIntent(null)}
              className="text-[11px] text-emerald-600 hover:underline font-semibold"
            >
              Clear
            </button>
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {authMode === 'login' ? (
            /* Sign In Mode */
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Email Address / Mobile Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. harsha@example.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); triggerToast('Password reset link sent to email.', 'info'); }} className="text-[11px] font-medium text-emerald-600 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In to SurplusX</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Create Account Mode */
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Account Role Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  I want to join SurplusX as:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('CONSUMER')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedRole === 'CONSUMER'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <ShoppingBag
                      className={`w-4 h-4 mb-1.5 ${
                        selectedRole === 'CONSUMER' ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                    <div className="text-xs font-extrabold text-slate-900">Consumer</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      Buy surplus food & save money
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('BUSINESS')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedRole === 'BUSINESS'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Store
                      className={`w-4 h-4 mb-1.5 ${
                        selectedRole === 'BUSINESS' ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <div className="text-xs font-extrabold text-slate-900">Business</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      List surplus & recover costs
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('NGO')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedRole === 'NGO'
                        ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <HeartHandshake
                      className={`w-4 h-4 mb-1.5 ${
                        selectedRole === 'NGO' ? 'text-amber-600' : 'text-slate-400'
                      }`}
                    />
                    <div className="text-xs font-extrabold text-slate-900">NGO Partner</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      Rescue donations for communities
                    </div>
                  </button>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {selectedRole === 'CONSUMER' ? 'Full Name' : 'Contact Person Name'}
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Harsha Vardhan"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. harsha@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {selectedRole !== 'CONSUMER' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {selectedRole === 'BUSINESS' ? 'Store / Business Name' : 'Registered NGO Name'}
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder={
                        selectedRole === 'BUSINESS'
                          ? 'e.g. Daily Fresh Organic Bakery'
                          : 'e.g. Feeding India Trust'
                      }
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98450 12345"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    City / Hub
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bangalore"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="agree-terms" className="text-[11px] text-slate-600 leading-tight">
                  I agree to the SurplusX <span className="font-semibold text-emerald-700">Terms of Service</span>,{' '}
                  <span className="font-semibold text-emerald-700">Privacy Policy</span> and FSSAI Surplus Food Safety
                  Charter.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create {selectedRole === 'CONSUMER' ? 'Consumer' : selectedRole === 'BUSINESS' ? 'Business' : 'NGO'} Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Continue Browsing Action */}
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 py-1.5 transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <span>Continue browsing as guest</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
