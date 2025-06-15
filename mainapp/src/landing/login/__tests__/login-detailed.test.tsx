import { describe, it, expect, vi } from 'vitest'
import { render } from '../../../test/test-utils'
import React from 'react'

// Mock everything first
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: { from: '/app/dashboard' } }),
  }
})

vi.mock('../../../lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

vi.mock('../../../components/ui/animate-in-view', () => ({
  default: React.forwardRef<HTMLDivElement, any>(({ children, className, ...props }, ref) => 
    React.createElement('div', { className: className || '', 'data-testid': 'animate-in-view', ref, ...props }, children)
  ),
}))

vi.mock('../../../context/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    setUser: vi.fn(),
    setLoading: vi.fn()
  })
}))

describe('Login Component Detailed Test', () => {
  it('should be able to render Login component', async () => {
    try {
      const LoginModule = await import('../login')
      const Login = LoginModule.default
      console.log('Login component type:', typeof Login)
      console.log('Login component:', Login)
      
      const result = render(React.createElement(Login))
      console.log('Render result:', result)
      
      expect(result.container).toBeDefined()
    } catch (error) {
      console.error('Detailed error:', error)
      if (error instanceof Error) {
        console.error('Error stack:', error.stack)
      }
      throw error
    }
  })
})
