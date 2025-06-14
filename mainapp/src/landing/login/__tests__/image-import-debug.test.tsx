import { describe, it, expect } from 'vitest'

describe('Image Import Debug', () => {
  it('should import delivery-man.png without errors', async () => {
    try {
      const imageModule = await import('../../images/delivery-man.png')
      console.log('Image module:', imageModule)
      expect(imageModule.default).toBeDefined()
      expect(typeof imageModule.default).toBe('string')
    } catch (error) {
      console.error('Image import error:', error)
      throw error
    }
  })

  it('should import register-bg.jpg without errors', async () => {
    try {
      const imageModule = await import('../../images/register-bg.jpg')
      console.log('Background image module:', imageModule)
      expect(imageModule.default).toBeDefined()
      expect(typeof imageModule.default).toBe('string')
    } catch (error) {
      console.error('Background image import error:', error)
      throw error
    }
  })
})
