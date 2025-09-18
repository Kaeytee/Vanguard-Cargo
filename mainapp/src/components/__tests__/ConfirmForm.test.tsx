import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render } from '../../test/test-utils'
import { screen } from '@testing-library/react'
import ConfirmForm from '../ConfirmForm'
import { mockFormData } from '../../test/test-utils'

describe('ConfirmForm Component', () => {
  const mockProps = {
    formData: mockFormData,
    onInputChange: vi.fn(),
    onBack: vi.fn(),
    onSubmit: vi.fn(),
    isSubmitting: false
  }

  it('renders confirmation form with all data', () => {
    render(<ConfirmForm {...mockProps} />)
    
    expect(screen.getByText(/confirm package request/i)).toBeInTheDocument()
    expect(screen.getByText(mockFormData.clientName)).toBeInTheDocument()
    expect(screen.getByText(mockFormData.clientEmail)).toBeInTheDocument()
    expect(screen.getByText(mockFormData.originCountry)).toBeInTheDocument()
    expect(screen.getByText(mockFormData.packageDescription)).toBeInTheDocument()
  })

  it('displays formatted package category', () => {
    render(<ConfirmForm {...mockProps} />)
    
    // Package category should be formatted from camelCase to proper case
    expect(screen.getByText(/standard/i)).toBeInTheDocument()
  })

  it('displays formatted delivery type', () => {
    render(<ConfirmForm {...mockProps} />)
    
    // Delivery type should be formatted
    expect(screen.getByText(/air/i)).toBeInTheDocument()
  })
  it('shows information cards about the process', () => {
    render(<ConfirmForm {...mockProps} />)
    
    expect(screen.getByText(/review all information/i)).toBeInTheDocument()
    expect(screen.getByText(/next steps/i)).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    
    render(<ConfirmForm {...mockProps} />)
    
    const backButton = screen.getByText(/back/i)
    await user.click(backButton)
    
    expect(mockProps.onBack).toHaveBeenCalledTimes(1)
  })

  it('calls onSubmit when submit button is clicked', async () => {
    const user = userEvent.setup()
    
    render(<ConfirmForm {...mockProps} />)
    
    const submitButton = screen.getByText(/submit package request/i)
    await user.click(submitButton)
    
    expect(mockProps.onSubmit).toHaveBeenCalledTimes(1)
  })
  it('disables submit button when submitting', () => {
    const submittingProps = { ...mockProps, isSubmitting: true }
    
    render(<ConfirmForm {...submittingProps} />)
    
    const submitButton = screen.getByRole('button', { name: /processing/i })
    expect(submitButton).toBeDisabled()
  })

  it('shows loading state in submit button when submitting', () => {
    const submittingProps = { ...mockProps, isSubmitting: true }
    
    render(<ConfirmForm {...submittingProps} />)
    
    expect(screen.getByText(/processing.../i)).toBeInTheDocument()
  })

  it('displays all form sections', () => {
    render(<ConfirmForm {...mockProps} />)
    
    expect(screen.getByText(/your information/i)).toBeInTheDocument()
    expect(screen.getByText(/package origin/i)).toBeInTheDocument()
    expect(screen.getByText(/package information/i)).toBeInTheDocument()
  })

  it('formats phone numbers correctly', () => {
    render(<ConfirmForm {...mockProps} />)
    
    // Phone number should be displayed
    expect(screen.getByText(mockFormData.clientPhone)).toBeInTheDocument()
  })

  it('handles missing optional fields gracefully', () => {
    const incompleteFormData = {
      ...mockFormData,
      clientAddress: '',
      clientCity: '',
      clientState: ''
    }
    
    const incompleteProps = { ...mockProps, formData: incompleteFormData }
    
    render(<ConfirmForm {...incompleteProps} />)
    
    // Should still render without errors
    expect(screen.getByText(/confirm package request/i)).toBeInTheDocument()
  })

  it('shows correct delivery information', () => {
    render(<ConfirmForm {...mockProps} />)
    
    // Should show air delivery information
    expect(screen.getByText(/air/i)).toBeInTheDocument()
  })
})
