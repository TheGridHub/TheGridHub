"use client"

import React from 'react'
import IntegrationSettings from '@/components/IntegrationSettings'

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <IntegrationSettings />
    </div>
  )
}
