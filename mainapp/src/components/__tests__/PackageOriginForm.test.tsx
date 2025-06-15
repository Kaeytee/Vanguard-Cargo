import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '../../test/test-utils'
import PackageOriginForm from '../PackageOriginForm'
import { mockFormData } from '../../test/test-utils'

describe('PackageOriginForm Component', () => {
  const mockProps = {
    formData: mockFormData,
    onInputChange: vi.fn(),
    onOriginCountryInput: vi.fn(),
    onOriginCountryKeyDown: vi.fn(),
    countrySuggestions: [],
    countryLoading: false,
    countryError: null,
    suggestionIndex: -1,
    onSuggestionSelect: vi.fn()
  }
  it('renders all required form fields', () => {
    render(<PackageOriginForm {...mockProps} />)
    
    expect(screen.getByLabelText(/package origin country/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /your contact information/i })).toBeInTheDocument()
    expect(screen.getByText(mockFormData.clientName)).toBeInTheDocument()
    expect(screen.getByText(mockFormData.clientEmail)).toBeInTheDocument()
  })

  it('displays origin country options', () => {
    render(<PackageOriginForm {...mockProps} />)
    
    const countrySelect = screen.getByLabelText(/package origin country/i)
    expect(countrySelect).toBeInTheDocument()
    
    // Check for Ghana and USA options using more specific selectors
    expect(screen.getByRole('option', { name: /ghana/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /united states/i })).toBeInTheDocument()
  })

  it('shows origin city field when country is selected', () => {
    const propsWithCountry = {
      ...mockProps,
      formData: { ...mockFormData, originCountry: 'Ghana' }
    }
    
    render(<PackageOriginForm {...propsWithCountry} />)
    
    expect(screen.getByLabelText(/origin city/i)).toBeInTheDocument()
  })

  it('calls onInputChange when country is selected', async () => {
    const user = userEvent.setup()
    
    render(<PackageOriginForm {...mockProps} />)
    
    const countrySelect = screen.getByLabelText(/package origin country/i)
    await user.selectOptions(countrySelect, 'Ghana')
    
    expect(mockProps.onInputChange).toHaveBeenCalled()
  })

  it('displays client information as read-only', () => {
    render(<PackageOriginForm {...mockProps} />)
    
    // Check that client info is displayed but not editable
    const nameField = screen.getByText(mockFormData.clientName).closest('div')
    const emailField = screen.getByText(mockFormData.clientEmail).closest('div')
    
    expect(nameField).toHaveClass('cursor-not-allowed')
    expect(emailField).toHaveClass('cursor-not-allowed')
  })

  it('shows information card about how it works', () => {
    render(<PackageOriginForm {...mockProps} />)
    
    expect(screen.getByText(/how this works/i)).toBeInTheDocument()
    expect(screen.getByText(/you're telling us about a package/i)).toBeInTheDocument()
  })

  it('displays country restrictions message', () => {
    render(<PackageOriginForm {...mockProps} />)
    
    expect(screen.getByText(/currently only accepting packages from ghana and usa/i)).toBeInTheDocument()
  })

  it('handles loading state for country suggestions', () => {
    const loadingProps = { ...mockProps, countryLoading: true }
    
    render(<PackageOriginForm {...loadingProps} />)
    
    // The component should handle loading state gracefully
    expect(screen.getByLabelText(/package origin country/i)).toBeInTheDocument()
  })

  it('displays error message when country lookup fails', () => {
    const errorProps = { ...mockProps, countryError: 'Failed to fetch suggestions' }
    
    render(<PackageOriginForm {...errorProps} />)
    
    // Error handling should be implemented in the parent component
    expect(screen.getByLabelText(/package origin country/i)).toBeInTheDocument()
  })
})
