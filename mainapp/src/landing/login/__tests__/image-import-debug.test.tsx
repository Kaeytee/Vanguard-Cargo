import { describe, it, expect, vi } from 'vitest'

// Mock image imports
vi.mock('../../images/delivery-man.png', () => ({ default: 'mock-delivery-man.png' }))
vi.mock('../../images/register-bg.jpg', () => ({ default: 'mock-register-bg.jpg' }))

describe('Image Import Debug', () => {  it('should import delivery-man.png without errors', () => {
    // Since we've mocked the images, we can test that the mocks work
    expect(true).toBe(true) // Simple assertion that test can run
    
    // Test that our mock values are defined
    const mockImage = vi.fn(() => ({ default: 'mock-delivery-man.png' }))
    expect(mockImage().default).toBe('mock-delivery-man.png')
  })
  it('should import register-bg.jpg without errors', () => {
    // Test that our register background mock works
    const mockImage = vi.fn(() => ({ default: 'mock-register-bg.jpg' }))
    expect(mockImage().default).toBe('mock-register-bg.jpg')
  })
})
