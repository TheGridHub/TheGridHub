'use client'

import { useState, useEffect } from 'react'
import { Slack, AlertCircle, Loader2, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SlackChannelSelectorProps {
  projectId: string
  currentChannel?: string
  onChannelSelect: (channel: string) => void
}

export default function SlackChannelSelector({ 
  projectId, 
  currentChannel, 
  onChannelSelect 
}: SlackChannelSelectorProps) {
  const [channels, setChannels] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState(currentChannel || '')
  const { toast } = useToast()

  useEffect(() => {
    checkSlackConnection()
  }, [])

  const checkSlackConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/integrations/slack/status')
      if (response.ok) {
        const data = await response.json()
        setConnected(data.connected)
        if (data.connected) {
          fetchChannels()
        }
      }
    } catch (error) {
      console.error('Error checking Slack connection:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/integrations/slack/channels')
      if (response.ok) {
        const data = await response.json()
        setChannels(data.channels || [])
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
      toast({
        title: "Error",
        description: "Failed to fetch Slack channels",
        variant: "destructive",
      })
    }
  }

  const handleConnectSlack = async () => {
    // Redirect to Slack OAuth
    window.location.href = '/api/integrations/slack/auth'
  }

  const handleChannelChange = (channel: string) => {
    setSelectedChannel(channel)
    onChannelSelect(channel)
    
    toast({
      title: "Success",
      description: `Slack channel updated to #${channels.find(c => c.id === channel)?.name}`,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="bg-purple-50/50 backdrop-blur-sm border border-purple-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Slack className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">Connect Slack</h3>
            <p className="mt-1 text-sm text-gray-600">
              Connect your Slack workspace to receive notifications and updates about this project.
            </p>
            <button
              onClick={handleConnectSlack}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 shadow-lg shadow-purple-500/25"
            >
              <Slack className="h-4 w-4 mr-2" />
              Connect Slack Workspace
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Slack className="h-5 w-5 text-purple-600" />
        <span className="text-sm font-medium text-gray-900">Slack Integration</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Check className="h-3 w-3 mr-1" />
          Connected
        </span>
      </div>

      <div className="space-y-2">
        <label htmlFor="slack-channel" className="block text-sm font-medium text-gray-700">
          Default Channel for Notifications
        </label>
        <select
          id="slack-channel"
          value={selectedChannel}
          onChange={(e) => handleChannelChange(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white/80 backdrop-blur-sm"
        >
          <option value="">Select a channel...</option>
          {channels.map((channel) => (
            <option key={channel.id} value={channel.id}>
              #{channel.name}
            </option>
          ))}
        </select>
        {selectedChannel && (
          <p className="text-xs text-gray-500 mt-1">
            Project updates will be posted to #{channels.find(c => c.id === selectedChannel)?.name}
          </p>
        )}
      </div>

      {channels.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                No channels available. Make sure the Slack app has been added to at least one channel.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}