import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { AuthProvider } from '../../../context/AuthProvider'
import { BrowserRouter } from 'react-router-dom'

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

// Mock framer-motion components
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef((props, ref) => React.createElement('div', { ...props, ref })),
    button: React.forwardRef((props, ref) => React.createElement('button', { ...props, ref })),
    label: React.forwardRef((props, ref) => React.createElement('label', { ...props, ref })),
    form: React.forwardRef((props, ref) => React.createElement('form', { ...props, ref })),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

// Import Register component AFTER all mocks
import Register from '../register'

describe('Register Component Clean', () => {
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
})
