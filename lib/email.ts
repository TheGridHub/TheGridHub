import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}

export class EmailService {
  private fromEmail = process.env.FROM_EMAIL || 'noreply@thegridhub.co'

  async sendEmail({ to, subject, html, text, from }: SendEmailOptions) {
    try {
      const { data, error } = await resend.emails.send({
        from: from || this.fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text: text || this.stripHtml(html)
      })

      if (error) {
        console.error('Email sending error:', error)
        throw new Error(`Failed to send email: ${error.message}`)
      }

      console.log('Email sent successfully:', data?.id)
      return data
    } catch (error) {
      console.error('Email service error:', error)
      throw error
    }
  }

  // Welcome email for new users
  async sendWelcomeEmail(to: string, userName: string) {
    const subject = 'Welcome to TheGridHub!'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1976d2; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Welcome to TheGridHub!</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2>Hi ${userName}!</h2>
          
          <p>Welcome to TheGridHub - the modern task management platform that helps teams get more done.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">🚀 Get Started</h3>
            <ul style="line-height: 1.6;">
              <li>Create your first project</li>
              <li>Invite team members</li>
              <li>Set up integrations (Slack, Google, Microsoft)</li>
              <li>Start managing tasks with AI assistance</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://thegridhub.co/dashboard" 
               style="background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
          
          <p>Best regards,<br>The TheGridHub Team</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2025 TheGridHub. All rights reserved.</p>
          <p>
            <a href="https://thegridhub.co/unsubscribe" style="color: #666;">Unsubscribe</a> | 
            <a href="https://thegridhub.co/privacy" style="color: #666;">Privacy Policy</a>
          </p>
        </div>
      </div>
    `
    
    return this.sendEmail({ to, subject, html })
  }

  // Password reset email
  async sendPasswordResetEmail(to: string, resetUrl: string, userName?: string) {
    const subject = 'Reset Your TheGridHub Password'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1976d2; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Password Reset Request</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2>Hi${userName ? ` ${userName}` : ''}!</h2>
          
          <p>We received a request to reset your TheGridHub password.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours. If you didn't request this reset, you can safely ignore this email.
          </p>
          
          <p>Best regards,<br>The TheGridHub Team</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2025 TheGridHub. All rights reserved.</p>
        </div>
      </div>
    `
    
    return this.sendEmail({ to, subject, html })
  }

  // Subscription confirmation email
  async sendSubscriptionConfirmationEmail(to: string, planName: string, amount: number) {
    const subject = 'Subscription Confirmed - Welcome to TheGridHub Pro!'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1976d2; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🎉 Subscription Confirmed!</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2>Thank you for upgrading!</h2>
          
          <p>Your subscription to <strong>${planName}</strong> has been confirmed.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Subscription Details</h3>
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Amount:</strong> $${amount.toFixed(2)}/month</p>
            <p><strong>Status:</strong> Active</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://thegridhub.co/dashboard" 
               style="background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Access Your Features
            </a>
          </div>
          
          <p>You now have access to all premium features including unlimited projects, advanced analytics, and enterprise integrations.</p>
          
          <p>Best regards,<br>The TheGridHub Team</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>© 2025 TheGridHub. All rights reserved.</p>
          <p>
            <a href="https://thegridhub.co/billing" style="color: #666;">Manage Subscription</a> | 
            <a href="https://thegridhub.co/support" style="color: #666;">Support</a>
          </p>
        </div>
      </div>
    `
    
    return this.sendEmail({ to, subject, html })
  }

  // Utility function to strip HTML for plain text fallback
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  }
}

// Export a default instance
export const emailService = new EmailService()

// Export types for use in other files
export type { SendEmailOptions }
