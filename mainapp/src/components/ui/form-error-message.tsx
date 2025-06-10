"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2 } from "lucide-react"

/**
 * FormErrorMessage Component
 * 
 * A professional error message component that displays validation errors with appropriate icons.
 * 
 * @param message - The error or success message to display
 * @param type - The type of message (error, success, warning)
 * @param className - Additional CSS classes
 */
interface FormErrorMessageProps {
  message?: string
  type?: 'error' | 'success' | 'warning'
  className?: string
}

/**
 * FormErrorMessage Component Implementation
 * 
 * Renders a message with an appropriate icon based on the message type
 */
const FormErrorMessage = React.forwardRef<HTMLParagraphElement, FormErrorMessageProps>(
  ({ message, type = 'error', className }, ref) => {
    // Return null if no message is provided
    if (!message) return null

    // Map of icons for different message types
    const iconMap = {
      error: AlertCircle,
      success: CheckCircle2,
      warning: AlertCircle,
    }

    // Map of colors for different message types
    const colorMap = {
      error: 'text-red-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
    }

    // Get the appropriate icon based on the message type
    const Icon = iconMap[type]

    // Render the message with the appropriate icon and styling
    return (
      <div className={cn("flex items-center gap-2 mt-1", className)}>
        <Icon className={cn("h-4 w-4 flex-shrink-0", colorMap[type])} />
        <p
          ref={ref}
          className={cn("text-sm font-medium", colorMap[type])}
        >
          {message}
        </p>
      </div>
    )
  }
)

// Set display name for React DevTools
FormErrorMessage.displayName = "FormErrorMessage"

export { FormErrorMessage }
