import { describe, it, expect, vi } from 'vitest'
import { render } from '../../../test/test-utils'
import React from 'react'

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
      const result = render(React.createElement(Login))
      expect(result).toBeDefined()
    } catch (error) {
      console.error('Render error:', error)
      console.error('Error message:', (error as Error).message)
      console.error('Error stack:', (error as Error).stack)
      throw error
    }
  })
})
