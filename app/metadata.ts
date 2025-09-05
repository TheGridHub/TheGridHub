import type { Metadata, MetadataRoute } from 'next'

export const metadata: Metadata = {
  title: 'TheGridHub — Modern Task Management for Teams',
  description: 'AI-powered task and project management with enterprise-grade integrations.',
  openGraph: {
    title: 'TheGridHub',
    description: 'AI-powered task and project management with enterprise-grade integrations.',
    url: 'https://thegridhub.co',
    siteName: 'TheGridHub',
    images: [
      { url: '/og.png', width: 1200, height: 630, alt: 'TheGridHub' }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TheGridHub',
    description: 'AI-powered task and project management with enterprise-grade integrations.',
    images: ['/og.png']
  }
}

