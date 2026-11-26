import { forwardRef, type InputHTMLAttributes } from 'react';

type ConfirmPasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'autoComplete'
>;

const supportsWebkitTextSecurity = (): boolean =>
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('-webkit-text-security', 'disc');

/**
 * Masked input for action-confirmation passwords (not login/registration).
 * Uses CSS text-security on Chromium/WebKit browsers so the browser's
 * password manager never treats the surrounding form as a login form,
 * never pairs other fields (like title/dates) as a username, and never
 * triggers "Manage passwords" / "Save password" prompts.
 * Falls back to `type="password"` with `autoComplete="one-time-code"` on
 * browsers without `-webkit-text-security` support (e.g. Firefox).
 */
export const ConfirmPasswordInput = forwardRef<
  HTMLInputElement,
  ConfirmPasswordInputProps
>(({ className = '', onCopy, onCut, ...props }, ref) => {
  const useMaskedText = supportsWebkitTextSecurity();

  return (
    <input
      ref={ref}
      type={useMaskedText ? 'text' : 'password'}
      autoComplete={useMaskedText ? 'off' : 'one-time-code'}
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      aria-autocomplete="none"
      data-lpignore="true"
      data-1p-ignore="true"
      data-bwignore="true"
      data-form-type="other"
      onCopy={(event) => {
        event.preventDefault();
        onCopy?.(event);
      }}
      onCut={(event) => {
        event.preventDefault();
        onCut?.(event);
      }}
      className={useMaskedText ? `${className} password-mask`.trim() : className}
      {...props}
    />
  );
});

ConfirmPasswordInput.displayName = 'ConfirmPasswordInput';
