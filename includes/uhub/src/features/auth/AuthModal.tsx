import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const isSignup = mode === 'signup';
    const url = isSignup ? '/api/auth/signup' : '/api/auth/login';
    const body = isSignup
      ? { username, password, email, phoneNumber }
      : { username, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        login(data);
        onClose();
      } else {
        setError(data.message || 'An error occurred.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  const termsText = `TERMS OF SERVICE AND USE:> By checking this box, you agree (that you are 18+ & agree:) to receive emails and/or text messages from the uminion union (and/or its active G.U.S (General Union Secretary)). Your email will be used for future password recovery measures and updates from the union; while your phone number will be used for future verification (required to gain access to the uminion union website) along with some union updates. Standard messaging rates may apply. These Terms of Service & Use may evolve overtime. -Last Updated: 1:45am on 12/14/25`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'login' ? 'Log In' : 'Sign Up'}</DialogTitle>
          <DialogDescription>
            {mode === 'login'
              ? 'Enter your credentials to log in.'
              : 'Create an account to get started.'}
          </DialogDescription>
        </DialogHeader>
        <div className="text-center mb-4">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <Button variant="link" onClick={() => onSwitchMode('signup')} className="p-0 h-auto">
                Sign Up
              </Button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <Button variant="link" onClick={() => onSwitchMode('login')} className="p-0 h-auto">
                Log In
              </Button>
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Username and Password - 2 columns */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Email and Phone Number - 2 columns (only in signup) */}
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            )}

            {/* Terms Agreement Section with Scrollable Text */}
            {mode === 'signup' && (
              <div className="flex items-start gap-3 mt-4">
                <Checkbox
                  id="terms"
                  checked={termsAgreed}
                  onCheckedChange={(checked) => setTermsAgreed(checked === true)}
                  className="mt-1 flex-shrink-0"
                />

                {/* Scrollable Text Container - 2 lines visible with scroll */}
                <div
                  className="flex-1 h-12 overflow-y-auto border rounded px-2 py-1 text-xs leading-relaxed bg-black border-gray-700"
                  style={{
                    scrollbarColor: '#888 #1f1f1f',
                    scrollbarWidth: 'thin',
                  }}
                >
                  <label
                    htmlFor="terms"
                    className="cursor-pointer inline-block text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {termsText}
                  </label>
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={mode === 'signup' && !termsAgreed}
              className={`${
                mode === 'signup' && !termsAgreed
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed hover:bg-gray-400'
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {mode === 'login' ? 'Log In' : 'Sign Up'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
