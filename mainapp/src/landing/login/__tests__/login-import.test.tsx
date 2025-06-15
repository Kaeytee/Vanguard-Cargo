import { describe, it, expect } from 'vitest'

describe('Login Import Test', () => {
  it('should be able to import Login component', async () => {
    try {
      const LoginModule = await import('../login')
      console.log('Login module:', LoginModule)
      expect(LoginModule.default).toBeDefined()
      expect(typeof LoginModule.default).toBe('function')
    } catch (error) {
      console.error('Import error:', error)
      throw error
    }
  })
})
