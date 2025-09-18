import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';
import type { ForgotPasswordState } from './types';
import { getStepContent } from './utils';
import { ForgotPasswordLayout } from './ForgotPasswordLayout';
import { EmailStep } from './EmailStep';
import { VerificationStep } from './VerificationStep';
import { NewPasswordStep } from './NewPasswordStep';
import { SuccessStep } from './SuccessStep';

/**
 * ForgotPassword component - Displays the multi-step forgot password flow
 * @returns {JSX.Element} The ForgotPassword page component
 */
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Consolidated state
  const [state, setState] = useState<ForgotPasswordState>({
    email: "",
    verificationCode: "",
    newPassword: "",
    confirmPassword: "",
    step: 1,
    isLoading: false,
    showPassword: false,
    showConfirmPassword: false,
    formError: "",
    formSuccess: "",
  });

  // Handle URL parameters for reset link
  useEffect(() => {
    const step = searchParams.get('step');
    if (step === '3') {
      // User came from reset link, go directly to new password step
      setState(prev => ({ ...prev, step: 3 }));
    }
  }, [searchParams]);

  // Navigation handlers
  const handleNext = () => {
    setState(prev => ({ ...prev, step: prev.step + 1 }));
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  // Get current step content
  const stepContent = getStepContent(state.step);

  // Render current step
  const renderCurrentStep = () => {
    const stepProps = { state, setState, onNext: handleNext };

    switch (state.step) {
      case 1:
        return <EmailStep {...stepProps} />;
      case 2:
        return <VerificationStep {...stepProps} />;
      case 3:
        return <NewPasswordStep {...stepProps} />;
      case 4:
        return <SuccessStep state={state} setState={setState} onGoToLogin={handleGoToLogin} />;
      default:
        return <EmailStep {...stepProps} />;
    }
  };

  return (
    <ForgotPasswordLayout title={stepContent.title} description={stepContent.description}>
      <AnimatePresence mode="wait">
        {renderCurrentStep()}
      </AnimatePresence>
    </ForgotPasswordLayout>
  );
}