import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, isValidIndianPhone, normalizeIndianPhone } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';
import {
  ShieldCheck, Phone, User, LogIn, UserPlus, Zap,
  Building2, Wrench, Users, Languages, ArrowRight,
  CheckCircle2, AlertTriangle, KeyRound, RefreshCw, ArrowLeft
} from 'lucide-react';

type AuthTab = 'signin' | 'register';

const roleCards: { value: UserRole; labelEn: string; labelTe: string; icon: React.ElementType; descEn: string; descTe: string; borderColor: string; activeColor: string }[] = [
  { value: 'citizen', labelEn: 'Citizen', labelTe: 'పౌరుడు', icon: Users, descEn: 'Report issues & track complaints', descTe: 'సమస్యలు నివేదించండి & ట్రాక్ చేయండి', borderColor: 'border-teal-500', activeColor: 'bg-teal-50 text-teal-700' },
  { value: 'admin', labelEn: 'Admin', labelTe: 'అడ్మిన్', icon: Building2, descEn: 'GVMC Municipal Administration', descTe: 'GVMC మున్సిపల్ పరిపాలన', borderColor: 'border-indigo-500', activeColor: 'bg-indigo-50 text-indigo-700' },
  { value: 'contractor', labelEn: 'Contractor', labelTe: 'కాంట్రాక్టర్', icon: Wrench, descEn: 'Manage assigned work orders', descTe: 'వర్క్ ఆర్డర్‌లను నిర్వహించండి', borderColor: 'border-amber-500', activeColor: 'bg-amber-50 text-amber-700' },
];

export const LoginPage: React.FC = () => {
  const {
    login, register, isPhoneRegistered, getRegisteredRole, getAllowedRoles,
    isFirebaseMode, otpStep, sendOtp, verifyOtp, resendOtp, completeAuth,
    resetOtpFlow, otpLoading, otpError, otpPhone, resendCooldown,
  } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const isTE = language === 'te';
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // OTP input refs for 6-digit code
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const redirectByRole = (role: UserRole) => {
    switch (role) {
      case 'admin': navigate('/admin'); break;
      case 'contractor': navigate('/contractor'); break;
      default: navigate('/');
    }
  };

  // When phone changes, auto-detect allowed roles
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    setError('');
    setInfo('');

    if (val.replace(/[\s\-]/g, '').length >= 10) {
      const allowed = getAllowedRoles(val);
      if (allowed.length === 1 && allowed[0] !== selectedRole) {
        setSelectedRole(allowed[0]);
      }
      if (activeTab === 'signin') {
        const regRole = getRegisteredRole(val);
        if (regRole) {
          setSelectedRole(regRole);
          setInfo(isTE ? `✓ నమోదైన ఖాతా కనుగొనబడింది (${regRole})` : `✓ Registered account found (${regRole})`);
        }
      }
    }
  };

  // ─── Firebase OTP Flow ────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!isValidIndianPhone(phone)) {
      setError(isTE ? 'దయచేసి చెల్లుబాటు అయ్యే భారతీయ ఫోన్ నంబర్ నమోదు చేయండి.' : 'Please enter a valid Indian phone number (10 digits starting with 6-9).');
      return;
    }

    // For sign-in, check registration before sending OTP
    if (activeTab === 'signin' && !isPhoneRegistered(phone)) {
      setError(isTE ? 'ఫోన్ నంబర్ నమోదు కాలేదు. దయచేసి ముందుగా రిజిస్టర్ చేసుకోండి.' : 'Phone number not registered. Please register first.');
      return;
    }

    // For register, check name
    if (activeTab === 'register' && !name.trim()) {
      setError(isTE ? 'దయచేసి మీ పేరు నమోదు చేయండి.' : 'Please enter your name.');
      return;
    }

    try {
      await sendOtp(phone);
    } catch {
      // Error is set in context
    }
  };

  // Handle OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    if (value.length > 1) {
      // Paste handling — spread digits across inputs
      const digits = value.slice(0, 6).split('');
      digits.forEach((d, i) => {
        if (index + i < 6) newDigits[index + i] = d;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(index + digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    } else {
      newDigits[index] = value;
      setOtpDigits(newDigits);
      if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Auto-submit when 6 digits entered
  const otpCode = otpDigits.join('');
  useEffect(() => {
    if (otpCode.length === 6 && otpStep === 'otp') {
      handleVerifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpCode]);

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;
    setError('');
    try {
      await verifyOtp(otpCode);
      // OTP verified — now complete auth
      await completeAuth(name.trim(), selectedRole, language, activeTab === 'register');
      redirectByRole(selectedRole);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed.';
      setError(msg);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    }
  };

  const handleBackToPhone = () => {
    resetOtpFlow();
    setOtpDigits(['', '', '', '', '', '']);
    setError('');
  };

  // ─── Demo Mode (no Firebase) ──────────────────────────────────────────
  const handleDemoSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (!isValidIndianPhone(phone)) {
      setError(isTE ? 'దయచేసి చెల్లుబాటు అయ్యే భారతీయ ఫోన్ నంబర్ నమోదు చేయండి.' : 'Please enter a valid Indian phone number.');
      return;
    }
    if (!isPhoneRegistered(phone)) {
      setError(isTE ? 'ఫోన్ నంబర్ నమోదు కాలేదు.' : 'Phone number not registered. Please register first.');
      return;
    }
    setLoading(true);
    try {
      await login(phone, selectedRole);
      redirectByRole(selectedRole);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally { setLoading(false); }
  };

  const handleDemoRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (!isValidIndianPhone(phone)) {
      setError(isTE ? 'దయచేసి చెల్లుబాటు అయ్యే భారతీయ ఫోన్ నంబర్ నమోదు చేయండి.' : 'Please enter a valid Indian phone number.');
      return;
    }
    if (!name.trim()) {
      setError(isTE ? 'దయచేసి మీ పేరు నమోదు చేయండి.' : 'Please enter your name.');
      return;
    }
    setLoading(true);
    try {
      await register(phone, name.trim(), selectedRole, language);
      redirectByRole(selectedRole);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally { setLoading(false); }
  };

  const handleQuickAccess = async (role: UserRole) => {
    const demoPhones: Record<UserRole, string> = {
      citizen: '+919848098765', admin: '+918912746001', contractor: '+919848012345',
    };
    try {
      await login(demoPhones[role], role);
      redirectByRole(role);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo login failed.');
    }
  };

  const allowedRoles = getAllowedRoles(phone);
  const phoneNorm = normalizeIndianPhone(phone);
  const isPhoneValid = phoneNorm !== null;
  const displayError = error || otpError;
  const isOtpStep = isFirebaseMode && otpStep === 'otp';
  const isProcessing = loading || otpLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/30">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">CivicPulse AI</h1>
          <p className="text-sm text-teal-300 font-medium">{isTE ? 'మెరుగైన నగరాలు. కలిసి.' : 'Better Cities. Together.'}</p>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center justify-center gap-1 bg-white/10 backdrop-blur-sm p-1.5 rounded-xl border border-white/20 max-w-[200px] mx-auto">
          <Languages size={14} className="text-slate-300 ml-1" />
          <button type="button" onClick={() => setLanguage('en')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${language === 'en' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'}`}>
            English
          </button>
          <button type="button" onClick={() => setLanguage('te')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${language === 'te' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'}`}>
            తెలుగు
          </button>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Tabs */}
          {!isOtpStep && (
            <div className="flex border-b border-slate-200">
              <button type="button" onClick={() => { setActiveTab('signin'); setError(''); setInfo(''); }}
                className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'signin' ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50' : 'text-slate-500 hover:text-slate-700'}`}>
                <LogIn size={16} />
                {isTE ? 'సైన్ ఇన్' : 'Sign In'}
              </button>
              <button type="button" onClick={() => { setActiveTab('register'); setError(''); setInfo(''); }}
                className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'register' ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50' : 'text-slate-500 hover:text-slate-700'}`}>
                <UserPlus size={16} />
                {isTE ? 'రిజిస్టర్' : 'Register'}
              </button>
            </div>
          )}

          <div className="p-6 space-y-4">
            {/* Error/Info Messages */}
            {displayError && (
              <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5 flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{displayError}</span>
              </div>
            )}
            {info && (
              <div className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center">
                {info}
              </div>
            )}

            {/* ─── OTP VERIFICATION STEP ──────────────────────────────── */}
            {isOtpStep ? (
              <div className="space-y-4">
                {/* Back button */}
                <button type="button" onClick={handleBackToPhone}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-teal-600 transition-colors">
                  <ArrowLeft size={14} />
                  {isTE ? 'వెనుకకు' : 'Back to phone'}
                </button>

                {/* OTP Header */}
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 border border-teal-200">
                    <KeyRound size={24} className="text-teal-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {isTE ? 'OTP ధృవీకరణ' : 'OTP Verification'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isTE
                      ? `${otpPhone} కు 6-అంకెల కోడ్ పంపబడింది`
                      : `A 6-digit code was sent to ${otpPhone}`}
                  </p>
                </div>

                {/* 6-digit OTP Input */}
                <div className="flex justify-center gap-2">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpInputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={i === 0 ? 6 : 1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-12 text-center text-lg font-bold border-2 border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                {/* Verify Button */}
                <button type="button" onClick={handleVerifyOtp}
                  disabled={otpCode.length !== 6 || isProcessing}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-teal-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isProcessing ? (
                    <span>{isTE ? 'ధృవీకరిస్తోంది...' : 'Verifying...'}</span>
                  ) : (
                    <><span>{isTE ? 'OTP ధృవీకరించండి' : 'Verify OTP'}</span><CheckCircle2 size={16} /></>
                  )}
                </button>

                {/* Resend */}
                <div className="text-center">
                  {resendCooldown > 0 ? (
                    <p className="text-xs text-slate-400">
                      {isTE ? `కొత్త కోడ్ పంపడానికి ${resendCooldown}s ఆగండి` : `Resend available in ${resendCooldown}s`}
                    </p>
                  ) : (
                    <button type="button" onClick={resendOtp} disabled={isProcessing}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1">
                      <RefreshCw size={12} />
                      {isTE ? 'OTP మళ్ళీ పంపండి' : 'Resend OTP'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* ─── PHONE / REGISTER FORM ────────────────────────────── */
              <form onSubmit={isFirebaseMode ? handleSendOtp : (activeTab === 'signin' ? handleDemoSignIn : handleDemoRegister)} className="space-y-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    {isTE ? 'ఫోన్ నంబర్' : 'Phone Number'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input type="tel" value={phone} onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="+91 98480 12345" required
                      className={`w-full text-sm border rounded-xl pl-10 pr-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:outline-none transition-colors ${
                        phone.length > 5 && !isPhoneValid ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-300 focus:ring-teal-500 focus:border-teal-500'
                      }`}
                    />
                  </div>
                  {phone.length > 5 && !isPhoneValid && (
                    <p className="text-[10px] text-rose-500 mt-1">
                      {isTE ? 'చెల్లని నంబర్. 6-9 తో ప్రారంభమయ్యే 10 అంకెల భారతీయ నంబర్ అవసరం.' : 'Invalid. Must be a 10-digit Indian number starting with 6-9.'}
                    </p>
                  )}
                </div>

                {/* Name (Register only) */}
                {activeTab === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      {isTE ? 'పూర్తి పేరు' : 'Full Name'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-2.5 text-slate-400" />
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder={isTE ? 'మీ పూర్తి పేరు' : 'Your full name'} required
                        className="w-full text-sm border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    {isTE ? 'మీరు ఎవరు?' : 'I am a...'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {roleCards.map((opt) => {
                      const RoleIcon = opt.icon;
                      const isSelected = selectedRole === opt.value;
                      const isAllowed = !isPhoneValid || allowedRoles.includes(opt.value);
                      return (
                        <button key={opt.value} type="button"
                          onClick={() => isAllowed && setSelectedRole(opt.value)}
                          disabled={!isAllowed}
                          className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                            !isAllowed ? 'opacity-40 cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400' :
                            isSelected ? `${opt.borderColor} ${opt.activeColor} border-current shadow-sm` :
                            'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}>
                          {isSelected && isAllowed && <CheckCircle2 size={12} className="absolute top-1.5 right-1.5" />}
                          <RoleIcon size={20} />
                          <span className="text-xs font-bold">{isTE ? opt.labelTe : opt.labelEn}</span>
                          <span className="text-[9px] leading-tight opacity-75">{isTE ? opt.descTe : opt.descEn}</span>
                          {!isAllowed && <span className="text-[8px] text-rose-500 font-semibold mt-0.5">🔒</span>}
                        </button>
                      );
                    })}
                  </div>
                  {isPhoneValid && allowedRoles.length === 1 && (
                    <p className="text-[10px] text-indigo-600 mt-1.5 font-medium">
                      {isTE ? `ఈ ఫోన్ "${allowedRoles[0]}" యాక్సెస్ కోసం అధికారికంగా కేటాయించబడింది.` : `This phone is authorized for "${allowedRoles[0]}" access only.`}
                    </p>
                  )}
                </div>

                {/* Language Preference (Register only) */}
                {activeTab === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      {isTE ? 'ఇష్టపడే భాష' : 'Preferred Language'}
                    </label>
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                      <button type="button" onClick={() => setLanguage('en')}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${language === 'en' ? 'bg-white text-teal-700 shadow-sm border border-teal-200' : 'text-slate-500'}`}>
                        🇬🇧 English
                      </button>
                      <button type="button" onClick={() => setLanguage('te')}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${language === 'te' ? 'bg-white text-teal-700 shadow-sm border border-teal-200' : 'text-slate-500'}`}>
                        🇮🇳 తెలుగు
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={isProcessing || !isPhoneValid}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-teal-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isProcessing ? (
                    <span>{isTE ? 'దయచేసి వేచి ఉండండి...' : 'Please wait...'}</span>
                  ) : isFirebaseMode ? (
                    <><span>{isTE ? 'OTP పంపండి' : 'Send OTP'}</span><KeyRound size={16} /></>
                  ) : (
                    <><span>{isTE ? (activeTab === 'signin' ? 'సైన్ ఇన్' : 'రిజిస్టర్ & ప్రవేశించండి') : (activeTab === 'signin' ? 'Sign In' : 'Register & Continue')}</span><ArrowRight size={16} /></>
                  )}
                </button>

                {/* Firebase mode indicator */}
                {isFirebaseMode && (
                  <p className="text-center text-[10px] text-teal-600 font-medium">
                    🔐 {isTE ? 'Firebase ఫోన్ ధృవీకరణ ద్వారా సురక్షితం' : 'Secured by Firebase Phone Verification'}
                  </p>
                )}
              </form>
            )}

            {/* Switch hint */}
            {!isOtpStep && (
              <p className="text-center text-[11px] text-slate-500">
                {activeTab === 'signin'
                  ? (isTE ? 'ఖాతా లేదా? ' : "Don't have an account? ")
                  : (isTE ? 'ఇప్పటికే ఖాతా ఉందా? ' : 'Already registered? ')}
                <button type="button" onClick={() => { setActiveTab(activeTab === 'signin' ? 'register' : 'signin'); setError(''); setInfo(''); }}
                  className="font-semibold text-teal-600 hover:underline">
                  {activeTab === 'signin' ? (isTE ? 'రిజిస్టర్ చేయండి' : 'Register here') : (isTE ? 'సైన్ ఇన్ చేయండి' : 'Sign in')}
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Quick Demo Access */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 justify-center">
            <Zap size={14} className="text-amber-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {isTE ? 'డెమో యాక్సెస్' : 'Quick Demo Access'}
            </span>
            <Zap size={14} className="text-amber-400" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { role: 'citizen' as UserRole, title: isTE ? 'పౌరుడు' : 'Citizen', sub: 'Praveen Varma', icon: Users, color: 'from-teal-500 to-teal-600' },
              { role: 'admin' as UserRole, title: isTE ? 'అడ్మిన్' : 'Admin', sub: 'Dr. Lakshmi Prasad', icon: Building2, color: 'from-indigo-500 to-indigo-600' },
              { role: 'contractor' as UserRole, title: isTE ? 'కాంట్రాక్టర్' : 'Contractor', sub: 'K. Srinivasa Rao', icon: Wrench, color: 'from-amber-500 to-amber-600' },
            ].map((card) => {
              const CardIcon = card.icon;
              return (
                <button key={card.role} type="button" onClick={() => handleQuickAccess(card.role)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center hover:bg-white/20 transition-all group space-y-2">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} shadow-md group-hover:scale-110 transition-transform`}>
                    <CardIcon size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{card.title}</div>
                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{card.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500">
          {isFirebaseMode
            ? (isTE ? 'Firebase ద్వారా ఫోన్ OTP ధృవీకరణ • భారతీయ ఫోన్ నంబర్లు మాత్రమే' : 'Phone OTP verification via Firebase • Indian phone numbers only')
            : (isTE ? 'డెమో మోడ్: ముందుగా నమోదైన వినియోగదారులు మాత్రమే' : 'Demo Mode: Pre-registered users only • Indian phone numbers required')}
        </p>
      </div>
    </div>
  );
};
