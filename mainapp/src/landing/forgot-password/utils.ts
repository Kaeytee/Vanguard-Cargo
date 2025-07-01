// Validation utilities for forgot password flow
export const validationUtils = {
  isEmailValid: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isPasswordValid: (password: string): boolean => {
    return password.length >= 8;
  },

  isVerificationCodeValid: (code: string): boolean => {
    return code.length === 5 && /^[0-9]+$/.test(code);
  }
};

// Step titles and descriptions
export const getStepContent = (step: number) => {
  const stepContent = {
    1: {
      title: "Reset Your Password",
      description: "Enter your email address to receive a verification code"
    },
    2: {
      title: "Verify Your Email", 
      description: "Enter the 5-digit code sent to your email"
    },
    3: {
      title: "Create New Password",
      description: "Create a new secure password for your account"
    },
    4: {
      title: "Password Reset Complete",
      description: "Your password has been successfully reset"
    }
  };
  
  return stepContent[step as keyof typeof stepContent] || stepContent[1];
};
