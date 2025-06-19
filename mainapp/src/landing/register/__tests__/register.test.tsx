import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '../../../test/test-utils'
import React from 'react'
import { AuthProvider } from '../../../context/AuthProvider'
import { BrowserRouter } from 'react-router-dom'

// Mock react-router-dom
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock image imports
vi.mock('../../../images/register-bg.jpg', () => ({ default: 'mock-register-bg.jpg' }))
vi.mock('../../../images/deliveryparcel.jpg', () => ({ default: 'mock-deliveryparcel.jpg' }))
vi.mock('../../../images/delivery-man.png', () => ({ default: 'mock-delivery-man.png' }))

// Mock phone input
vi.mock('react-phone-number-input', () => ({
  // Use explicit types for props and event
  default: ({ value, onChange, placeholder, ...props }: {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    [key: string]: unknown;
  }) => (
    <input
      {...props}
      type="tel"
      value={value || ''}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
      placeholder={placeholder}
      data-testid="phone-input"
    />
  ),
  isValidPhoneNumber: (phone: string) => {
    return phone && phone.length >= 10 && /^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''))
  }
}))

// Mock utils
vi.mock('../../../lib/utils', () => ({
  // Use 'unknown[]' for variadic classnames utility
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
}))

// Mock AnimateInView component
vi.mock('../../../components/ui/animate-in-view', () => ({
  // Use explicit types for props
  // Explicitly type children as React.ReactNode for React.createElement compatibility
  default: React.forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode; [key: string]: unknown }>(
    ({ children, className, ...props }, ref) =>
      React.createElement('div', { className: className || '', 'data-testid': 'animate-in-view', ref, ...props }, children as React.ReactNode)
  ),
}))

// Mock framer-motion components with explicit prop types for clean code and OOP best practices
vi.mock('framer-motion', () => ({
  motion: {
    // Explicitly type props for div to ensure children are React.ReactNode
    div: React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
      (props, ref) => React.createElement('div', { ...props, ref }, props.children)
    ),
    // Explicitly type props for button
    button: React.forwardRef<HTMLButtonElement, React.HTMLProps<HTMLButtonElement>>(
      (props, ref) => React.createElement('button', { ...props, ref }, props.children)
    ),
    // Explicitly type props for label
    label: React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
      (props, ref) => React.createElement('label', { ...props, ref }, props.children)
    ),
    // Explicitly type props for form
    form: React.forwardRef<HTMLFormElement, React.FormHTMLAttributes<HTMLFormElement>>(
      (props, ref) => React.createElement('form', { ...props, ref }, props.children)
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

// Import Register component AFTER all mocks
import Register from '../register'

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('renders registration form with all required fields', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByTestId('phone-input')).toBeInTheDocument()
    expect(screen.getByLabelText('Password *')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })
  it('validates first name is required', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    const firstNameInput = screen.getByLabelText(/first name/i)
    
    // Try to submit without first name
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
    })
    
    // Enter first name and error should disappear
    await user.type(firstNameInput, 'John')
    await waitFor(() => {
      expect(screen.queryByText(/first name is required/i)).not.toBeInTheDocument()
    })
  })
  it('validates last name is required', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    const lastNameInput = screen.getByLabelText(/last name/i)
    
    // Fill first name but not last name
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
    })
    
    // Enter last name and error should disappear
    await user.type(lastNameInput, 'Doe')
    await waitFor(() => {
      expect(screen.queryByText(/last name is required/i)).not.toBeInTheDocument()
    })
  })
  it('validates email format', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )
    
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    // Enter invalid email
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
    
    // Enter valid email and error should disappear
    await user.clear(emailInput)
    await user.type(emailInput, 'john@example.com')
    await waitFor(() => {
      expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument()
    })
  })
  it('validates phone number format', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )
    
    const phoneInput = screen.getByTestId('phone-input')
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    // Enter invalid phone number
    await user.type(phoneInput, '123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument()
    })
    
    // Enter valid phone number and error should disappear
    await user.clear(phoneInput)
    await user.type(phoneInput, '+1234567890')
    await waitFor(() => {
      expect(screen.queryByText(/please enter a valid phone number/i)).not.toBeInTheDocument()
    })
  })
  it('validates password strength requirements', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )
    
    const passwordInput = screen.getByLabelText('Password *')
    
    // Test weak password
    await user.type(passwordInput, '123')
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
    
    // Test strong password
    await user.clear(passwordInput)
    await user.type(passwordInput, 'StrongPassword123!')
    
    await waitFor(() => {
      expect(screen.queryByText(/password must be at least 8 characters/i)).not.toBeInTheDocument()
    })
  })
  it('validates password confirmation matches', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )
    
    const passwordInput = screen.getByLabelText('Password *')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password *')
    
    // Enter different passwords
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'different123')
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
    
    // Fix password confirmation
    await user.clear(confirmPasswordInput)
    await user.type(confirmPasswordInput, 'password123')
    
    await waitFor(() => {
      expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument()
    })
  })
  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )
    
    const passwordInput = screen.getByLabelText('Password *')
    const toggleButtons = screen.getAllByRole('button', { name: /toggle password visibility/i })
    const passwordToggle = toggleButtons[0]
    
    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Click toggle button
    await user.click(passwordToggle)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    // Click toggle button again
    await user.click(passwordToggle)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
  it('requires terms and conditions agreement', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    // Fill all required fields except terms
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.type(screen.getByTestId('phone-input'), '+1234567890')
    await user.type(screen.getByLabelText('Password *'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password *'), 'password123')
    
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/you must agree to the terms and conditions/i)).toBeInTheDocument()
    })
    
    // Agree to terms
    // Use accessible name as rendered: 'I agree to the Terms of Service'
    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the terms of service/i })
    await user.click(termsCheckbox)
    
    await waitFor(() => {
      expect(screen.queryByText(/you must agree to the terms and conditions/i)).not.toBeInTheDocument()
    })
  })
  it('handles successful registration', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )
    
    // Fill all required fields
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.type(screen.getByTestId('phone-input'), '+1234567890')
    await user.type(screen.getByLabelText('Password *'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password *'), 'password123')
    // Use accessible name as rendered: 'I agree to the Terms of Service'
    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the terms of service/i })
    await user.click(termsCheckbox)
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/creating account/i)).toBeInTheDocument()
    })
    
    // Should eventually show success message and redirect
    await waitFor(() => {
      expect(screen.getByText(/account created successfully/i)).toBeInTheDocument()
    }, { timeout: 3000 })
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    }, { timeout: 3000 })
  })
  it('handles registration failure', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )
    
    // Fill all required fields with existing email
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email address/i), 'existing@example.com')
    await user.type(screen.getByTestId('phone-input'), '+1234567890')
    await user.type(screen.getByLabelText('Password *'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password *'), 'password123')
    
    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the terms of service/i })
    await user.click(termsCheckbox)
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)
    
    // Should show error message for existing email
    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })
  it('navigates to login page when clicking sign in link', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )
    
    // Use accessible name as rendered: 'Log in' instead of 'sign in'
    const signInLink = screen.getByRole('link', { name: /log in/i })
    await user.click(signInLink)
    
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
  it('allows opting into marketing communications', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    )
    
    const marketingCheckbox = screen.getByRole('checkbox', { name: /receive marketing communications from your company/i })
    
    // Should be unchecked by default
    expect(marketingCheckbox).not.toBeChecked()
    
    // Check the box
    await user.click(marketingCheckbox)
    expect(marketingCheckbox).toBeChecked()
    
    // Uncheck the box
    await user.click(marketingCheckbox)
    expect(marketingCheckbox).not.toBeChecked()
  })
})