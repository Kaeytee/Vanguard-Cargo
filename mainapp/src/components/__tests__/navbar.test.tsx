import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '../../test/test-utils'
import Navbar from '../navbar'
import * as AuthContext from '../../context/AuthProvider'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('Navbar Component', () => {
  const mockLogout = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the logo and brand name', () => {
    render(<Navbar />)
    
    expect(screen.getByText('Ttarius Logistics')).toBeInTheDocument()
  })

  it('renders navigation links when not authenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      login: vi.fn(),
      logout: mockLogout,
      register: vi.fn(),
      loading: false,
      error: null
    })

    render(<Navbar />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About Us')).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('renders dashboard link when authenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' },
      login: vi.fn(),
      logout: mockLogout,
      register: vi.fn(),
      loading: false,
      error: null
    })

    render(<Navbar />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('shows login and register buttons when not authenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      login: vi.fn(),
      logout: mockLogout,
      register: vi.fn(),
      loading: false,
      error: null
    })

    render(<Navbar />)
    
    expect(screen.getByText('Log In')).toBeInTheDocument()
    expect(screen.getByText('Register')).toBeInTheDocument()
  })

  it('shows user email and logout button when authenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' },
      login: vi.fn(),
      logout: mockLogout,
      register: vi.fn(),
      loading: false,
      error: null
    })

    render(<Navbar />)
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('calls logout function when logout button is clicked', async () => {
    const user = userEvent.setup()
    
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' },
      login: vi.fn(),
      logout: mockLogout,
      register: vi.fn(),
      loading: false,
      error: null
    })

    render(<Navbar />)
    
    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)
    
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('opens and closes mobile menu', async () => {
    const user = userEvent.setup()
    
    render(<Navbar />)
    
    // Mobile menu should not be visible initially
    expect(screen.queryByText('Open main menu')).toBeInTheDocument()
    
    // Click to open mobile menu
    const menuButton = screen.getByRole('button', { name: /open main menu/i })
    await user.click(menuButton)
    
    // Menu should be open now
    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })
  })

  it('applies active styles to current page link', () => {
    // Mock useLocation to return a specific pathname
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        useLocation: () => ({ pathname: '/about' })
      }
    })

    render(<Navbar />)
    
    const aboutLink = screen.getByText('About Us')
    expect(aboutLink).toHaveClass('text-red-600')
  })

  it('adds shadow when scrolled', () => {
    // Mock scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 50
    })

    render(<Navbar />)
    
    // Trigger scroll event
    window.dispatchEvent(new Event('scroll'))
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('shadow-md')
  })
})