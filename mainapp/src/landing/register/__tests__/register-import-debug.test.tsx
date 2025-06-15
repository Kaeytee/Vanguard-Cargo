import { describe, it, expect } from 'vitest'

describe('Register Import Debug', () => {
  it('should import Register component successfully', async () => {
    try {
      const RegisterModule = await import('../register')
      console.log('Register module:', RegisterModule)
      console.log('Register default export:', RegisterModule.default)
      expect(RegisterModule.default).toBeDefined()
      expect(typeof RegisterModule.default).toBe('function')
    } catch (error) {
      console.error('Import error:', error)
      throw error
    }
  })
})
