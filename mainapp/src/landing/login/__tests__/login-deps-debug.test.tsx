import { describe, it, expect } from 'vitest'
import { render } from '../../../test/test-utils'
import React from 'react'

// Test individual dependencies to find the problematic one
describe('Login Component Dependencies Debug', () => {
  it('should render AnimateInView component', async () => {
    const AnimateInView = (await import('../../../components/ui/animate-in-view')).default
    expect(() => {
      render(React.createElement(AnimateInView, { children: 'test' }))
    }).not.toThrow()
  })

  it('should render motion.div', async () => {
    const { motion } = await import('framer-motion')
    expect(() => {
      render(React.createElement(motion.div, { children: 'test' }))
    }).not.toThrow()
  })

  it('should render Eye icon', async () => {
    const { Eye } = await import('lucide-react')
    expect(() => {
      render(React.createElement(Eye))
    }).not.toThrow()
  })

  it('should render EyeOff icon', async () => {
    const { EyeOff } = await import('lucide-react')
    expect(() => {
      render(React.createElement(EyeOff))
    }).not.toThrow()
  })
  it('should use useAuth hook', async () => {
    const { useAuth } = await import('../../../context/AuthProvider')
    const { AuthProvider } = await import('../../../context/AuthProvider')
    const { renderHook } = await import('@testing-library/react')
    
    expect(() => {
      renderHook(() => useAuth(), {
        wrapper: AuthProvider
      })
    }).not.toThrow()
  })
  it('should use useNavigate hook', async () => {
    const { useNavigate } = await import('react-router-dom')
    const { renderHook } = await import('@testing-library/react')
    const { BrowserRouter } = await import('react-router-dom')
    
    expect(() => {
      renderHook(() => useNavigate(), {
        wrapper: BrowserRouter
      })
    }).not.toThrow()
  })

  it('should use useLocation hook', async () => {
    const { useLocation } = await import('react-router-dom')
    const { renderHook } = await import('@testing-library/react')
    const { BrowserRouter } = await import('react-router-dom')
    
    expect(() => {
      renderHook(() => useLocation(), {
        wrapper: BrowserRouter
      })
    }).not.toThrow()
  })
})
