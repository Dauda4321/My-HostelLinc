import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { UserAccount, UserRole } from '../types/hostel';
import { findUserByIdentifier, normalizeEmail, normalizePhone } from '../utils/storage';
import { PasswordInput } from './PasswordInput';
import { ModalShell } from './ModalShell';

export type AuthModalInitialTab = 'login' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: AuthModalInitialTab;
  initialSignUpRole?: 'student' | 'landlord';
  contextMessage?: string | null;
  users: UserAccount[];
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  onRegisterUser: (newUser: Omit<UserAccount, 'id' | 'createdAt'>) => UserAccount;
  onResetUserPassword: (userId: string, newPassword: string) => void;
  onShowSimulatedOtpToast: (contact: string, code: string) => void;
}

type AuthScreen = 'login' | 'signup' | 'forgot-step-1' | 'forgot-step-2' | 'forgot-step-3';

const DEMO_CREDENTIALS: Array<{
  label: string;
  role: UserRole;
  email: string;
  phone: string;
  password: string;
  note: string;
}> = [
  {
    label: 'Landlord (Mr. Abdul-Karim)',
    role: 'landlord',
    email: 'abdulkarim@udshostels.com',
    phone: '0244000001',
    password: 'Password123',
    note: 'Manages 3 Tamale hostels / 120 rooms',
  },
  {
    label: 'Caretaker / Hostel Manager',
    role: 'caretaker',
    email: 'manager@udshostels.com',
    phone: '0244000002',
    password: 'Password123',
    note: 'Check-ins & maintenance tracker',
  },
  {
    label: 'Sample Student',
    role: 'student',
    email: 'student@uds.edu.gh',
    phone: '0544000003',
    password: 'Password123',
    note: 'Book rooms & report issues',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  initialSignUpRole = 'student',
  contextMessage = null,
  users,
  onClose,
  onLoginSuccess,
  onRegisterUser,
  onResetUserPassword,
  onShowSimulatedOtpToast,
}) => {
  const [screen, setScreen] = useState<AuthScreen>(initialTab);
  const [demoOpen, setDemoOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up state
  const [signupRole, setSignupRole] = useState<'student' | 'landlord'>(initialSignUpRole);
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Forgot Password state
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryUser, setRecoveryUser] = useState<UserAccount | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setScreen(initialTab);
      setSignupRole(initialSignUpRole);
      setError(null);
      setBanner(null);
    }
  }, [isOpen, initialTab, initialSignUpRole]);

  const generateAndSendOtp = (targetUser: UserAccount, displayContact: string) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    onShowSimulatedOtpToast(displayContact || targetUser.email || targetUser.phone, code);
    return code;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBanner(null);

    if (!loginIdentifier.trim() || !loginPassword) {
      setError('Please enter your email or phone number and password.');
      return;
    }

    const matched = findUserByIdentifier(users, loginIdentifier);
    if (!matched || matched.password !== loginPassword) {
      setError('Invalid email/phone number or password. Please check your credentials and try again.');
      return;
    }

    setLoginPassword('');
    onLoginSuccess(matched);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBanner(null);

    if (!fullName.trim() || !email.trim() || !phone.trim() || !signupPassword) {
      setError('Please complete all required registration fields.');
      return;
    }

    if (signupRole === 'student' && !studentId.trim()) {
      setError('Please enter your UDS Student ID.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (signupPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const cleanEmail = normalizeEmail(email);
    const cleanPhone = normalizePhone(phone);

    const duplicate = users.some(
      (u) =>
        (cleanEmail && normalizeEmail(u.email) === cleanEmail) ||
        (cleanPhone && normalizePhone(u.phone) === cleanPhone)
    );
    if (duplicate) {
      setError('An account with this email address or phone number already exists.');
      return;
    }

    const created = onRegisterUser({
      role: signupRole,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: signupPassword,
      studentId: signupRole === 'student' ? studentId.trim().toUpperCase() : undefined,
    });

    setFullName('');
    setStudentId('');
    setEmail('');
    setPhone('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    onLoginSuccess(created);
  };

  const handleForgotStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recoveryIdentifier.trim()) {
      setError('Please enter your registered email address or phone number.');
      return;
    }

    const found = findUserByIdentifier(users, recoveryIdentifier);
    if (!found) {
      setError('No account found matching that email address or phone number.');
      return;
    }

    setRecoveryUser(found);
    setOtpInput('');
    generateAndSendOtp(found, recoveryIdentifier.trim());
    setScreen('forgot-step-2');
  };

  const handleForgotStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otpInput.trim() !== generatedOtp) {
      setError('Invalid verification code. Please check the simulated SMS/Email notification and try again.');
      return;
    }

    setResetNewPassword('');
    setResetConfirmPassword('');
    setScreen('forgot-step-3');
  };

  const handleForgotStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recoveryUser) {
      setScreen('forgot-step-1');
      return;
    }

    if (resetNewPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    onResetUserPassword(recoveryUser.id, resetNewPassword);
    setLoginIdentifier(recoveryIdentifier.trim());
    setLoginPassword('');
    setRecoveryIdentifier('');
    setGeneratedOtp('');
    setOtpInput('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setRecoveryUser(null);
    setBanner('Password reset successfully. Log in with your new password.');
    setScreen('login');
  };

  const isForgotFlow = screen.startsWith('forgot-');

  const titleText =
    screen === 'login'
      ? 'Log In to Your Account'
      : screen === 'signup'
      ? 'Create a New Account'
      : screen === 'forgot-step-1'
      ? 'Reset Password · Account Lookup'
      : screen === 'forgot-step-2'
      ? 'Reset Password · Verify Code'
      : 'Reset Password · Set New Password';

  const modeTabs = !isForgotFlow ? (
    <div className="grid grid-cols-2 border-t border-slate-200 bg-slate-50 p-1.5">
      <button
        type="button"
        onClick={() => {
          setScreen('login');
          setError(null);
        }}
        className={`min-h-[38px] rounded-lg text-xs font-semibold transition-colors ${
          screen === 'login'
            ? 'bg-white text-[#14532D] shadow-xs border border-slate-200'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Log In
      </button>
      <button
        type="button"
        onClick={() => {
          setScreen('signup');
          setError(null);
          setBanner(null);
        }}
        className={`min-h-[38px] rounded-lg text-xs font-semibold transition-colors ${
          screen === 'signup'
            ? 'bg-white text-[#14532D] shadow-xs border border-slate-200'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Sign Up
      </button>
    </div>
  ) : undefined;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={titleText}
      subtitle="UDS HOSTELHUB ACCOUNT"
      titleId="auth-modal-title"
      maxWidthClass="max-w-md"
      subHeader={modeTabs}
    >
      <div className="p-6 space-y-4">
        {contextMessage && !isForgotFlow && (
          <div className="rounded-lg border border-[#D97706]/30 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-[#92400E]">
            {contextMessage}
          </div>
        )}

        {banner && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-lg border border-[#14532D]/30 bg-[#14532D]/10 px-3.5 py-2.5 text-xs font-semibold text-[#14532D]"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{banner}</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800"
          >
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {screen === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-id" className="block text-xs font-semibold text-slate-700">
                Email or Phone Number
              </label>
              <input
                id="login-id"
                type="text"
                required
                autoComplete="username"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="e.g. student@uds.edu.gh or 0544000003"
                className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#14532D] focus:outline-none focus:ring-2 focus:ring-[#14532D]/15"
              />
            </div>

            <div>
              <PasswordInput
                id="login-password"
                label="Password"
                value={loginPassword}
                onChange={setLoginPassword}
                autoComplete="current-password"
              />
              <div className="mt-1.5 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setBanner(null);
                    setRecoveryIdentifier(loginIdentifier);
                    setScreen('forgot-step-1');
                  }}
                  className="text-xs font-semibold text-[#14532D] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#166534]"
            >
              Log In
            </button>

            {/* Collapsible Quick Demo Credentials Helper */}
            <div className="rounded-lg border border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setDemoOpen((prev) => !prev)}
                aria-expanded={demoOpen}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                <span className="inline-flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-[#B45309]" />
                  <span>Quick Demo Credentials</span>
                </span>
                {demoOpen ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </button>

              {demoOpen && (
                <div className="border-t border-slate-200 px-3.5 py-3 space-y-2.5">
                  {DEMO_CREDENTIALS.map((cred) => (
                    <div
                      key={cred.role}
                      className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900">{cred.label}</div>
                        <div className="mt-0.5 font-mono text-[11px] text-slate-600 break-all">
                          {cred.email} · {cred.phone}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500">
                          Pass: {cred.password}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier(cred.email);
                          setLoginPassword(cred.password);
                          setError(null);
                        }}
                        className="shrink-0 rounded-md border border-[#14532D]/30 bg-[#14532D]/10 px-2.5 py-1 text-[11px] font-semibold text-[#14532D] hover:bg-[#14532D]/15"
                      >
                        Fill
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        )}

        {/* SIGN UP FORM */}
        {screen === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div>
              <div className="text-xs font-semibold text-slate-700">Account Type</div>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSignupRole('student')}
                  className={`min-h-[38px] rounded-lg border px-3 text-xs font-semibold transition-colors ${
                    signupRole === 'student'
                      ? 'border-[#14532D] bg-[#14532D]/10 text-[#14532D]'
                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setSignupRole('landlord')}
                  className={`min-h-[38px] rounded-lg border px-3 text-xs font-semibold transition-colors ${
                    signupRole === 'landlord'
                      ? 'border-[#14532D] bg-[#14532D]/10 text-[#14532D]'
                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Hostel Owner / Landlord
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="su-name" className="block text-xs font-semibold text-slate-700">
                Full Name
              </label>
              <input
                id="su-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={
                  signupRole === 'student' ? 'e.g. Mariama Fuseini' : 'e.g. Alhaji Yakubu Seidu'
                }
                className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900 focus:border-[#14532D] focus:outline-none"
              />
            </div>

            {signupRole === 'student' && (
              <div>
                <label htmlFor="su-sid" className="block text-xs font-semibold text-slate-700">
                  UDS Student ID
                </label>
                <input
                  id="su-sid"
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. UDS/MD/0412/25"
                  className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 px-3 font-mono text-sm text-slate-900 placeholder:font-sans focus:border-[#14532D] focus:outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="su-email" className="block text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  id="su-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@uds.edu.gh"
                  className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 px-3 text-sm text-slate-900 focus:border-[#14532D] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="su-phone" className="block text-xs font-semibold text-slate-700">
                  Phone Number
                </label>
                <input
                  id="su-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="024 000 0000"
                  className="mt-1 block w-full min-h-[40px] rounded-lg border border-slate-300 px-3 font-mono text-sm text-slate-900 placeholder:font-sans focus:border-[#14532D] focus:outline-none"
                />
              </div>
            </div>

            <PasswordInput
              id="su-pass"
              label="Password"
              value={signupPassword}
              onChange={setSignupPassword}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />

            <PasswordInput
              id="su-confirm-pass"
              label="Confirm Password"
              value={signupConfirmPassword}
              onChange={setSignupConfirmPassword}
              placeholder="Re-enter password"
              autoComplete="new-password"
            />

            <button
              type="submit"
              className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#166534]"
            >
              {signupRole === 'student'
                ? 'Create Student Account'
                : 'Create Landlord Account'}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD STEP 1: Account Lookup */}
        {screen === 'forgot-step-1' && (
          <form onSubmit={handleForgotStep1} className="space-y-4">
            <p className="text-xs leading-relaxed text-slate-600">
              Enter your registered Email Address or Phone Number. We will verify your account and send a 6-digit reset code.
            </p>

            <div>
              <label htmlFor="fp-lookup" className="block text-xs font-semibold text-slate-700">
                Registered Email or Phone Number
              </label>
              <input
                id="fp-lookup"
                type="text"
                required
                value={recoveryIdentifier}
                onChange={(e) => setRecoveryIdentifier(e.target.value)}
                placeholder="e.g. abdulkarim@udshostels.com or 0244000001"
                className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#14532D] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#166534]"
            >
              Send 6-Digit Verification Code
            </button>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setScreen('login');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Log In</span>
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD STEP 2: OTP Verification */}
        {screen === 'forgot-step-2' && (
          <form onSubmit={handleForgotStep2} className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              Account found for <span className="font-semibold text-slate-900">{recoveryUser?.fullName}</span>. Enter the 6-digit verification code displayed in the simulated SMS/Email alert.
            </div>

            <div>
              <label htmlFor="fp-otp" className="block text-xs font-semibold text-slate-700">
                6-Digit Verification Code
              </label>
              <input
                id="fp-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                className="mt-1.5 block w-full min-h-[44px] rounded-lg border border-slate-300 px-3 text-center font-mono text-lg font-bold tracking-widest text-slate-900 focus:border-[#14532D] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#166534]"
            >
              Verify Code
            </button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setScreen('forgot-step-1');
                }}
                className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Change Email/Phone</span>
              </button>
              {recoveryUser && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    generateAndSendOtp(recoveryUser, recoveryIdentifier.trim());
                  }}
                  className="font-semibold text-[#14532D] hover:underline"
                >
                  Resend Code
                </button>
              )}
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD STEP 3: Set New Password */}
        {screen === 'forgot-step-3' && (
          <form onSubmit={handleForgotStep3} className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-[#14532D]/30 bg-[#14532D]/10 px-3.5 py-2.5 text-xs font-semibold text-[#14532D]">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Code verified for {recoveryUser?.fullName}. Set your new password below.</span>
            </div>

            <PasswordInput
              id="fp-new-pass"
              label="New Password"
              value={resetNewPassword}
              onChange={setResetNewPassword}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />

            <PasswordInput
              id="fp-confirm-pass"
              label="Confirm New Password"
              value={resetConfirmPassword}
              onChange={setResetConfirmPassword}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />

            <button
              type="submit"
              className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#166534]"
            >
              Save New Password
            </button>
          </form>
        )}
      </div>
    </ModalShell>
  );
};
