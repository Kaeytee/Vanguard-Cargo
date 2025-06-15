import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useShipmentForm } from '../../hooks/useShipmentForm'
import { mockFormData } from '../../test/test-utils'

describe('useShipmentForm Hook', () => {
  it('initializes with provided form data', () => {
    const { result } = renderHook(() => useShipmentForm(mockFormData))
    
    expect(result.current.formData).toEqual(mockFormData)
  })

  it('updates form data when handleInputChange is called', () => {
    const { result } = renderHook(() => useShipmentForm(mockFormData))
    
    act(() => {
      result.current.handleInputChange({
        target: { name: 'clientName', value: 'Updated Name' }
      } as React.ChangeEvent<HTMLInputElement>)
    })
    
    expect(result.current.formData.clientName).toBe('Updated Name')
  })

  it('handles select input changes', () => {
    const { result } = renderHook(() => useShipmentForm(mockFormData))
    
    act(() => {
      result.current.handleInputChange({
        target: { name: 'packageType', value: 'envelope' }
      } as React.ChangeEvent<HTMLSelectElement>)
    })
    
    expect(result.current.formData.packageType).toBe('envelope')
  })

  it('handles textarea input changes', () => {
    const { result } = renderHook(() => useShipmentForm(mockFormData))
    
    act(() => {
      result.current.handleInputChange({
        target: { name: 'packageDescription', value: 'Updated description' }
      } as React.ChangeEvent<HTMLTextAreaElement>)
    })
    
    expect(result.current.formData.packageDescription).toBe('Updated description')
  })

  it('updates nested form data correctly', () => {
    const { result } = renderHook(() => useShipmentForm(mockFormData))
    
    act(() => {
      result.current.setFormData(prev => ({
        ...prev,
        clientEmail: 'newemail@example.com'
      }))
    })
    
    expect(result.current.formData.clientEmail).toBe('newemail@example.com')
  })

  it('resets form to initial data', () => {
    const { result } = renderHook(() => useShipmentForm(mockFormData))
    
    // Modify the form data
    act(() => {
      result.current.handleInputChange({
        target: { name: 'clientName', value: 'Modified Name' }
      } as React.ChangeEvent<HTMLInputElement>)
    })
    
    expect(result.current.formData.clientName).toBe('Modified Name')
    
    // Reset the form
    act(() => {
      result.current.resetForm()
    })
    
    expect(result.current.formData.clientName).toBe(mockFormData.clientName)
  })

  it('preserves other fields when updating one field', () => {
    const { result } = renderHook(() => useShipmentForm(mockFormData))
    
    act(() => {
      result.current.handleInputChange({
        target: { name: 'clientName', value: 'New Name' }
      } as React.ChangeEvent<HTMLInputElement>)
    })
    
    expect(result.current.formData.clientName).toBe('New Name')
    expect(result.current.formData.clientEmail).toBe(mockFormData.clientEmail)
    expect(result.current.formData.packageType).toBe(mockFormData.packageType)
  })

  it('handles empty values correctly', () => {
    const { result } = renderHook(() => useShipmentForm(mockFormData))
    
    act(() => {
      result.current.handleInputChange({
        target: { name: 'clientName', value: '' }
      } as React.ChangeEvent<HTMLInputElement>)
    })
    
    expect(result.current.formData.clientName).toBe('')
  })
})
