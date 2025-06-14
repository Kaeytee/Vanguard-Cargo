import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '../../../test/test-utils'
import React from 'react'
import Login from '../login'
import * as AuthContext from '../../../context/AuthProvider'

// Mock react-router-dom
const mockNavigate = vi.fn()
const mockLocation = { state: { from: '/app/dashboard' } }

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  }
})

// Mock the utils
vi.mock('../../../lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

// Mock the AnimateInView component
vi.mock('../../../components/ui/animate-in-view', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => 
    React.createElement('div', { className: className || '', 'data-testid': 'animate-in-view' }, children),
}))

// Mock image imports
vi.mock('../../../images/register-bg.jpg', () => ({ default: 'mock-register-bg.jpg' }))
vi.mock('../../../images/delivery-man.png', () => ({ default: 'mock-delivery-man.png' }))

describe('Login Component', () => {
  const mockSetUser = vi.fn()
  const mockSetLoading = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    // Mock useAuth hook
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      setUser: mockSetUser,
      loading: false,
      setLoading: mockSetLoading,
      logout: vi.fn(),
    })
  })

  it('renders login form with all required fields', () => {
    render(<Login />)
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/remember me/i)).toBeInTheDocument()
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Enter invalid email
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('validates password is required', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Enter valid email but no password
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })
    
    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Click toggle button
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    // Click toggle button again
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('handles successful login', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Fill in valid credentials
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    })
    
    // Should eventually navigate to dashboard
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/app/dashboard')
    }, { timeout: 3000 })
  })

  it('handles login failure', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Fill in invalid credentials
    await user.type(emailInput, 'invalid@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('remembers user preference when remember me is checked', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i })
    
    // Check remember me
    await user.click(rememberMeCheckbox)
    expect(rememberMeCheckbox).toBeChecked()
  })

  it('redirects to forgot password page', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const forgotPasswordLink = screen.getByText(/forgot password/i)
    await user.click(forgotPasswordLink)
    
    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password')
  })

  it('redirects to register page', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const registerLink = screen.getByText(/sign up/i)
    await user.click(registerLink)
    
    expect(mockNavigate).toHaveBeenCalledWith('/register')
  })

  it('redirects authenticated users to dashboard', () => {
    // Mock authenticated user
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
      setUser: mockSetUser,
      loading: false,
      setLoading: mockSetLoading,
      logout: vi.fn(),
    })
    
    render(<Login />)
    
    expect(mockNavigate).toHaveBeenCalledWith('/app/dashboard')
  })
})
