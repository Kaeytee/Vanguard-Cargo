import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface EmailRequest {
  userEmail: string
  userName: string
  packageId: string
  trackingNumber: string
  storeName: string
  oldStatus: string
  newStatus: string
  description?: string
  suiteNumber?: string
}

// Professional email templates for each status
const getEmailTemplate = (data: EmailRequest) => {
  const { userName, trackingNumber, storeName, newStatus, oldStatus, suiteNumber } = data
  
  const statusMessages = {
    'received': {
      subject: `📦 Package Received - ${trackingNumber}`,
      title: 'Package Received at Warehouse',
      message: `Great news! Your package from ${storeName} has been received at our ALX-E2 warehouse and is being processed.`,
      color: '#3B82F6',
      icon: '📦'
    },
    'processing': {
      subject: `⚡ Package Processing - ${trackingNumber}`,
      title: 'Package Being Processed',
      message: `Your package from ${storeName} is currently being processed and prepared for consolidation.`,
      color: '#F59E0B',
      icon: '⚡'
    },
    'shipped': {
      subject: `🚚 Package Shipped - ${trackingNumber}`,
      title: 'Package Shipped!',
      message: `Excellent! Your package from ${storeName} has been shipped and is on its way to you.`,
      color: '#10B981',
      icon: '🚚'
    },
    'delivered': {
      subject: `✅ Package Delivered - ${trackingNumber}`,
      title: 'Package Delivered Successfully',
      message: `Your package from ${storeName} has been delivered successfully. Thank you for choosing Vanguard Cargo!`,
      color: '#059669',
      icon: '✅'
    }
  }

  const template = statusMessages[newStatus as keyof typeof statusMessages] || {
    subject: `📋 Package Status Update - ${trackingNumber}`,
    title: 'Package Status Updated',
    message: `Your package from ${storeName} status has been updated from ${oldStatus} to ${newStatus}.`,
    color: '#6B7280',
    icon: '📋'
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
            ${template.icon} Vanguard Cargo
          </h1>
          <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">
            Your Trusted Logistics Partner
          </p>
        </div>

        <!-- Status Banner -->
        <div style="background-color: ${template.color}; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">
            ${template.title}
          </h2>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 18px; color: #374151; margin: 0 0 20px 0;">
            Hello ${userName},
          </p>
          
          <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
            ${template.message}
          </p>

          <!-- Package Details Card -->
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">
              📋 Package Details
            </h3>
            
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="font-weight: 600; color: #374151;">Tracking Number:</span>
                <span style="color: #1f2937; font-family: monospace; background: #e5e7eb; padding: 2px 8px; border-radius: 4px;">${trackingNumber}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="font-weight: 600; color: #374151;">Store/Vendor:</span>
                <span style="color: #1f2937;">${storeName}</span>
              </div>
              
              ${suiteNumber ? `
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="font-weight: 600; color: #374151;">Suite Number:</span>
                <span style="color: #1f2937; font-weight: 600;">${suiteNumber}</span>
              </div>
              ` : ''}
              
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="font-weight: 600; color: #374151;">Current Status:</span>
                <span style="color: ${template.color}; font-weight: 600; text-transform: capitalize;">${newStatus}</span>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="https://vanguardcargo.co/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
                      color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; 
                      font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
              🏠 View in Dashboard
            </a>
          </div>

          <!-- Warehouse Info -->
          <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h4 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">
              📍 Warehouse Information
            </h4>
            <p style="color: #4b5563; margin: 0; line-height: 1.5;">
              <strong>ALX-E2 Warehouse</strong><br>
              4700 Eisenhower Avenue<br>
              Alexandria, VA 22304, USA
            </p>
          </div>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 30px 0 0 0;">
            Thank you for choosing Vanguard Cargo for your shipping needs. If you have any questions, 
            please don't hesitate to contact our support team.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #1f2937; padding: 30px; text-align: center;">
          <p style="color: #9ca3af; margin: 0 0 15px 0; font-size: 14px;">
            © 2024 Vanguard Cargo. All rights reserved.
          </p>
          
          <div style="margin: 20px 0;">
            <a href="https://vanguardcargo.co" style="color: #60a5fa; text-decoration: none; margin: 0 15px;">Website</a>
            <a href="https://vanguardcargo.co/support" style="color: #60a5fa; text-decoration: none; margin: 0 15px;">Support</a>
            <a href="https://vanguardcargo.co/tracking" style="color: #60a5fa; text-decoration: none; margin: 0 15px;">Track Package</a>
          </div>
          
          <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const emailData: EmailRequest = await req.json()
    
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const template = getEmailTemplate(emailData)
    const statusMessages = {
      'received': `📦 Package Received - ${emailData.trackingNumber}`,
      'processing': `⚡ Package Processing - ${emailData.trackingNumber}`,
      'shipped': `🚚 Package Shipped - ${emailData.trackingNumber}`,
      'delivered': `✅ Package Delivered - ${emailData.trackingNumber}`
    }

    const subject = statusMessages[emailData.newStatus as keyof typeof statusMessages] || 
                   `📋 Package Status Update - ${emailData.trackingNumber}`

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        // IMPORTANT: Change this to your verified domain once set up in Resend
        // For now, using Resend's test domain for immediate functionality
        from: 'Vanguard Cargo <onboarding@resend.dev>',
        // Production: from: 'Vanguard Cargo <noreply@vanguardcargo.co>',
        to: [emailData.userEmail],
        subject: subject,
        html: template,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Failed to send email: ${error}`)
    }

    const result = await res.json()

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: result.id,
      message: 'Email sent successfully' 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 200,
    })

  } catch (error) {
    console.error('Error sending email:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 500,
    })
  }
})
