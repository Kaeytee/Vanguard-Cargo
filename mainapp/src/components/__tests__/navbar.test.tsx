import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/test-utils'
import React from 'react'
import Navbar from '../navbar'

// Mock the navbar component imports
vi.mock('../../lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

vi.mock('../ui/button', () => ({
  Button: React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => 
    React.createElement('button', { ...props, ref }, children)
  )
}))

// Mock AuthProvider
vi.mock('../../context/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn()
  })
}))

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders the logo and brand name', () => {
    render(<Navbar />)
    
    expect(screen.getByText('Vanguard Cargo')).toBeInTheDocument()
  })
  it('renders navigation links when not authenticated', () => {
    render(<Navbar />)
    
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'About Us' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Services' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument()
  })

  it('shows login and register buttons when not authenticated', () => {
    render(<Navbar />)
    
    expect(screen.getByRole('link', { name: 'Log In' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument()
  })

  it('component renders without errors', () => {
    render(<Navbar />)
    
    // Basic test to ensure component renders
    expect(screen.getByText('Vanguard Cargo')).toBeInTheDocument()
  })
})