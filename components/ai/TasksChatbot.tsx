'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, RefreshCw, Trash2, Copy } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useDashboardData } from '@/hooks/useDashboardData'
import toast from 'react-hot-toast'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
  tokens_used?: number
  metadata?: any
}

interface TasksChatbotProps {
  className?: string
  onTaskCreate?: (tasks: any[]) => void
}

export function TasksChatbot({ className = '', onTaskCreate }: TasksChatbotProps) {
  const { profile } = useUserProfile()
  const { dashboardData } = useDashboardData()
  const [input, setInput] = useState('')
  const [threadId, setThreadId] = useState<string>(() => `thread_${Date.now()}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Load chat history
  const {
    data: messages = [],
    isLoading: historyLoading
  } = useQuery<ChatMessage[]>({
    queryKey: ['ai-chat-history', profile?.user_id, threadId],
    queryFn: async () => {
      if (!profile?.user_id) return []

      const { data, error } = await supabase
        .from('ai_chats')
        .select('*')
        .eq('user_id', profile.user_id)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    },
    enabled: !!profile?.user_id,
    staleTime: 1000, // Fresh data
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, role = 'user' }: { message: string; role?: 'user' | 'assistant' }) => {
      if (!profile?.user_id) throw new Error('Not authenticated')

      // Save user message to database
      if (role === 'user') {
        const { error } = await supabase
          .from('ai_chats')
          .insert({
            user_id: profile.user_id,
            workspace_id: dashboardData?.workspace_id,
            thread_id: threadId,
            role: 'user',
            content: message,
            model_used: 'gpt-3.5-turbo'
          })

        if (error) throw error
      }

      // Get AI response from your existing API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: 'tasks',
          user_id: profile.user_id,
          thread_id: threadId,
          workspace_data: {
            projects_count: dashboardData?.projects_count || 0,
            tasks_count: dashboardData?.tasks_count || 0,
            workspace_name: dashboardData?.workspace_display_name
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      // Save AI response to database
      const { error: aiError } = await supabase
        .from('ai_chats')
        .insert({
          user_id: profile.user_id,
          workspace_id: dashboardData?.workspace_id,
          thread_id: threadId,
          role: 'assistant',
          content: data.message,
          tokens_used: data.tokens_used || 0,
          model_used: data.model_used || 'gpt-3.5-turbo',
          metadata: data.metadata || {}
        })

      if (aiError) throw aiError

      return data
    },
    onSuccess: (data) => {
      // Refresh chat history
      queryClient.invalidateQueries({ queryKey: ['ai-chat-history', profile?.user_id, threadId] })
      
      // If AI created tasks, notify parent component
      if (data.metadata?.created_tasks && onTaskCreate) {
        onTaskCreate(data.metadata.created_tasks)
      }
      
      setInput('')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send message')
    }
  })

  // Clear chat mutation
  const clearChatMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.user_id) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('ai_chats')
        .delete()
        .eq('user_id', profile.user_id)
        .eq('thread_id', threadId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-chat-history', profile?.user_id, threadId] })
      toast.success('Chat history cleared')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to clear chat')
    }
  })

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sendMessageMutation.isPending) return

    const message = input.trim()
    sendMessageMutation.mutate({ message })
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Copy message to clipboard
  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success('Message copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy message')
    }
  }

  // Start new conversation
  const startNewConversation = () => {
    setThreadId(`thread_${Date.now()}`)
    queryClient.invalidateQueries({ queryKey: ['ai-chat-history'] })
  }

  // Suggested prompts
  const suggestedPrompts = [
    "Create 5 tasks for launching a new product",
    "Break down 'Website Redesign' project into tasks",
    "Suggest tasks for improving team productivity",
    "Create a task checklist for client onboarding",
    "Generate tasks for the next sprint planning"
  ]

  return (
    <div className={`flex flex-col h-full bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#873bff]/10 rounded-lg">
            <Bot className="w-5 h-5 text-[#873bff]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Task Assistant</h3>
            <p className="text-sm text-gray-500">Get help organizing your work</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={startNewConversation}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="New conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => clearChatMutation.mutate()}
            disabled={clearChatMutation.isPending}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {historyLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#873bff]" />
          </div>
        )}

        {messages.length === 0 && !historyLoading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#873bff]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-[#873bff]" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">AI Task Assistant</h4>
            <p className="text-sm text-gray-600 mb-4">
              I can help you create and organize tasks. Try asking me to:
            </p>
            
            <div className="space-y-2 text-left max-w-md mx-auto">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt)}
                  className="block w-full text-sm text-gray-600 hover:text-[#873bff] hover:bg-[#873bff]/5 p-3 rounded-lg border border-gray-200 hover:border-[#873bff]/20 transition-all text-left"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-[#873bff]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-[#873bff]" />
              </div>
            )}
            
            <div
              className={`max-w-[70%] relative group ${
                message.role === 'user'
                  ? 'bg-[#873bff] text-white rounded-lg p-3'
                  : 'bg-gray-100 text-gray-900 rounded-lg p-3'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/20">
                <span className="text-xs opacity-70">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
                
                <button
                  onClick={() => copyMessage(message.content)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/10 rounded transition-all"
                  title="Copy message"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {sendMessageMutation.isPending && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-[#873bff]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-[#873bff]" />
            </div>
            <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
              <span className="text-sm text-gray-600">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to create tasks, break down projects, or organize your work..."
            className="flex-1 resize-none border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#873bff] focus:ring-1 focus:ring-[#873bff] max-h-32"
            rows={2}
            disabled={sendMessageMutation.isPending}
          />
          
          <button
            type="submit"
            disabled={!input.trim() || sendMessageMutation.isPending}
            className="px-4 py-2 bg-[#873bff] text-white rounded-lg hover:bg-[#7a35e6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        
        <p className="text-xs text-gray-500 mt-2">
          💡 AI Assistant is free for all users. Try asking me to create task lists or break down projects!
        </p>
      </div>
    </div>
  )
}
