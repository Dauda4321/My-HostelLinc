import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { UserAccount } from '../types/hostel';
import { PasswordInput } from './PasswordInput';
import { ModalShell } from './ModalShell';

interface AccountSecurityModalProps {
  isOpen: boolean;
  user: UserAccount | null;
  onClose: () => void;
  onChangePassword: (userId: string, newPassword: string) => void;
}

export const AccountSecurityModal: React.FC<AccountSecurityModalProps> = ({
  isOpen,
  user,
  onClose,
  onChangePassword,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user) return null;

  const roleLabel =
    user.role === 'landlord'
      ? 'Landlord / Hostel Owner'
      : user.role === 'caretaker'
      ? 'Caretaker / Hostel Manager'
      : 'Student';

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (currentPassword !== user.password) {
      setError('Current password is incorrect.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    onChangePassword(user.id, newPassword);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccess('Password updated successfully and saved to your account.');
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Account & Security"
      subtitle="PASSWORD & PROFILE MANAGEMENT"
      titleId="security-modal-title"
      maxWidthClass="max-w-md"
    >
      <div className="p-6 space-y-5">
        <dl className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Signed in as</dt>
            <dd className="font-semibold text-slate-900 text-right">{user.fullName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Account Role</dt>
            <dd className="font-semibold text-[#14532D] text-right">{roleLabel}</dd>
          </div>
          {user.studentId && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">UDS Student ID</dt>
              <dd className="font-mono font-semibold text-slate-900 text-right">
                {user.studentId}
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Email</dt>
            <dd className="text-slate-800 text-right">{user.email || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Phone</dt>
            <dd className="font-mono text-slate-800 text-right">{user.phone || '—'}</dd>
          </div>
        </dl>

        <form onSubmit={handleSubmit} className="space-y-4 border-t border-slate-200 pt-4">
          <h3 className="text-sm font-bold text-slate-900">Change Password</h3>

          {success && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg border border-[#14532D]/30 bg-[#14532D]/10 px-3.5 py-2.5 text-xs font-semibold text-[#14532D]"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
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

          <PasswordInput
            id="sec-current-pass"
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />

          <PasswordInput
            id="sec-new-pass"
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
          />

          <PasswordInput
            id="sec-confirm-pass"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Re-enter new password"
            autoComplete="new-password"
          />

          <div className="flex items-center justify-end pt-1">
            <button
              type="submit"
              className="min-h-[42px] w-full sm:w-auto rounded-lg bg-[#14532D] px-5 py-2 text-xs font-semibold text-white hover:bg-[#166534]"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
};
