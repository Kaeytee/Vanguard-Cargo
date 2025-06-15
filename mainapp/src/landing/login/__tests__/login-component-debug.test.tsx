import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import Login from '../login'
import { AuthProvider } from '../../../context/AuthProvider'
import { BrowserRouter } from 'react-router-dom'

// Debug test to isolate the "Element type is invalid" error
describe('Login Component Debug', () => {
  it('should render without throwing element type errors', () => {
    console.log('Testing Login component render...')
    
    expect(() => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      )
    }).not.toThrow()
  })

  it('should verify all imports are defined', () => {
    // Test if Login component is properly imported
    expect(Login).toBeDefined()
    expect(typeof Login).toBe('function')
    
    console.log('Login component:', Login)
    console.log('Login component name:', Login.name)
  })
})
