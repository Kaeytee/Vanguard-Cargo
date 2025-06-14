import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../../test/test-utils'
import React from 'react'

// Mock the problematic image import directly in the test file
vi.mock('../../images/delivery-man.png', () => ({
  default: 'mocked-delivery-man.png'
}))

vi.mock('../../images/register-bg.jpg', () => ({
  default: 'mocked-register-bg.jpg'
}))

// Test the Login component with mocked dependencies
describe('Login Component Simple Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the basic Login component structure', async () => {
    // Dynamically import Login after mocks are set up
    const { default: Login } = await import('../login')
    
    render(<Login />)
    
    // Test basic elements that should be present
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })
})
