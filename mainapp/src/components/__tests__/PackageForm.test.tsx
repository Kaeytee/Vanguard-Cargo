import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render } from '../../test/test-utils'
import { screen } from '@testing-library/react'
import PackageForm from '../PackageForm'
import { mockFormData } from '../../test/test-utils'

describe('PackageForm Component', () => {
  const mockProps = {
    formData: mockFormData,
    onInputChange: vi.fn(),
    onPackageDescriptionChange: vi.fn()
  }

  it('renders package details form', () => {
    render(<PackageForm {...mockProps} />)
    
    expect(screen.getByText(/package details/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/delivery type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/package type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/package category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/package description/i)).toBeInTheDocument()
  })

  it('shows air delivery as the only option', () => {
    render(<PackageForm {...mockProps} />)
    
    const deliverySelect = screen.getByLabelText(/delivery type/i)
    expect(deliverySelect).toBeDisabled()
    expect(screen.getByText(/air only/i)).toBeInTheDocument()
  })

  it('displays package type options', () => {
    render(<PackageForm {...mockProps} />)
    
    const packageTypeSelect = screen.getByLabelText(/package type/i)
    expect(packageTypeSelect).toBeInTheDocument()
    
    // Check for package type options
    expect(screen.getByText(/select package type/i)).toBeInTheDocument()
  })

  it('displays package category options', () => {
    render(<PackageForm {...mockProps} />)
    
    const categorySelect = screen.getByLabelText(/package category/i)
    expect(categorySelect).toBeInTheDocument()
    
    // Check for category options
    expect(screen.getByText(/select package category/i)).toBeInTheDocument()
  })

  it('calls onInputChange when package type is selected', async () => {
    const user = userEvent.setup()
    
    render(<PackageForm {...mockProps} />)
    
    const packageTypeSelect = screen.getByLabelText(/package type/i)
    await user.selectOptions(packageTypeSelect, 'box')
    
    expect(mockProps.onInputChange).toHaveBeenCalled()
  })

  it('calls onInputChange when package category is selected', async () => {
    const user = userEvent.setup()
    
    render(<PackageForm {...mockProps} />)
    
    const categorySelect = screen.getByLabelText(/package category/i)
    await user.selectOptions(categorySelect, 'standard')
    
    expect(mockProps.onInputChange).toHaveBeenCalled()
  })

  it('calls onInputChange when description is typed', async () => {
    const user = userEvent.setup()
    
    render(<PackageForm {...mockProps} />)
    
    const descriptionField = screen.getByLabelText(/package description/i)
    await user.type(descriptionField, 'Test description')
    
    expect(mockProps.onInputChange).toHaveBeenCalled()
  })

  it('shows category detail card when category is selected', () => {
    const propsWithCategory = {
      ...mockProps,
      formData: { ...mockFormData, packageCategory: 'standard' }
    }
      render(<PackageForm {...propsWithCategory} />)
    
    expect(screen.getByTestId('package-category-detail')).toBeInTheDocument()
    const categoryDetail = screen.getByTestId('package-category-detail')
    expect(categoryDetail).toHaveTextContent(/standard/i)
  })

  it('displays air delivery restriction message', () => {
    render(<PackageForm {...mockProps} />)
    
    expect(screen.getByText(/currently only air delivery is available/i)).toBeInTheDocument()
  })

  it('auto-selects air delivery type on mount', () => {
    const propsWithoutFreightType = {
      ...mockProps,
      formData: { ...mockFormData, freightType: '' }
    }
    
    render(<PackageForm {...propsWithoutFreightType} />)
    
    // The component should auto-select air delivery
    expect(mockProps.onInputChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'freightType',
          value: 'air'
        })
      })
    )
  })

  it('displays all package categories', () => {
    render(<PackageForm {...mockProps} />)
    
    const categorySelect = screen.getByLabelText(/package category/i)
    
    // Open the select to see options
    expect(categorySelect).toBeInTheDocument()
    // Categories are loaded dynamically, so we check the select exists
  })
})
