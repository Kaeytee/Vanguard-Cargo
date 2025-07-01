// Types for the forgot password flow
export interface ForgotPasswordState {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
  step: number;
  isLoading: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  formError: string;
  formSuccess: string;
}

export interface StepProps {
  state: ForgotPasswordState;
  setState: React.Dispatch<React.SetStateAction<ForgotPasswordState>>;
  onNext: () => void;
  onPrevious?: () => void;
}

export interface ValidationUtils {
  isEmailValid: (email: string) => boolean;
  isPasswordValid: (password: string) => boolean;
  isVerificationCodeValid: (code: string) => boolean;
}
