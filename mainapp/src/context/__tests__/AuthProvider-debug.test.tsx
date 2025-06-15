import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthProvider'

// Test component that uses the AuthProvider
function TestComponent() {
  const { user, setUser, loading, setLoading, logout } = useAuth()
  
  return (
    <div>
      <div data-testid="user-info">
        {user ? `${user.name} (${user.email})` : 'No user'}
      </div>
      <div data-testid="loading-state">
        {loading ? 'Loading' : 'Not loading'}
      </div>
      <button
        onClick={() => {
          console.log('DEBUG: Setting user...')
          setUser({
            id: '1',
            name: 'Test User',
            email: 'test@example.com'
          })
        }}
        data-testid="set-user"
      >
        Set User
      </button>
    </div>
  )
}

describe('AuthProvider Debug', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('debug: sets user and checks localStorage', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    console.log('DEBUG: Initial state')
    console.log('User info:', screen.getByTestId('user-info').textContent)
    console.log('localStorage user:', localStorage.getItem('user'))
    
    const setUserButton = screen.getByTestId('set-user')
    
    await act(async () => {
      setUserButton.click()
    })
    
    console.log('DEBUG: After clicking set user button')
    console.log('User info:', screen.getByTestId('user-info').textContent)
    console.log('localStorage user:', localStorage.getItem('user'))
    
    // Wait for React effects to run
    await waitFor(() => {
      console.log('DEBUG: Inside waitFor')
      console.log('User info:', screen.getByTestId('user-info').textContent)
      console.log('localStorage user:', localStorage.getItem('user'))
      return screen.getByTestId('user-info').textContent !== 'No user'
    }, { timeout: 2000 })
    
    console.log('DEBUG: Final state')
    console.log('User info:', screen.getByTestId('user-info').textContent)
    console.log('localStorage user:', localStorage.getItem('user'))
    
    expect(screen.getByTestId('user-info')).toHaveTextContent('Test User (test@example.com)')
  })
})
