import { describe, it, expect, vi } from 'vitest'
import { render } from '../../../test/test-utils'
import { AuthProvider } from '../../../context/AuthContext'

// Mock image imports
vi.mock('../../../images/delivery-man.png', () => ({ default: 'mock-delivery-man.png' }))
vi.mock('../../../images/register-bg.jpg', () => ({ default: 'mock-register-bg.jpg' }))

// Test individual imports to find the problematic one
describe('Login Component Debug', () => {
  it('should import Login component without errors', async () => {
    try {
      const LoginModule = await import('../login')
      expect(LoginModule.default).toBeDefined()
      expect(typeof LoginModule.default).toBe('function')
    } catch (error) {
      console.error('Import error:', error)
      throw error
    }
  })
  it('should render Login component with minimal setup', async () => {
    const LoginModule = await import('../login')
    const Login = LoginModule.default
    
    try {
      const result = render(
        <AuthProvider>
          <Login />
        </AuthProvider>
      )
      expect(result).toBeDefined()
    } catch (error) {
      console.error('Render error:', error)
      console.error('Error message:', (error as Error).message)
      console.error('Error stack:', (error as Error).stack)
      throw error
    }
  })
})
