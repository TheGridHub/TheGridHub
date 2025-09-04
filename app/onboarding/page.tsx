'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'
import { 
  Briefcase, 
  Users, 
  Target, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Sparkles
} from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState({
    role: '',
    teamSize: '',
    goals: [],
    experience: ''
  })

  const steps = [
    {
      title: 'Welcome to TheGridHub!',
      subtitle: 'Let\'s get you set up in just a few steps'
    },
    {
      title: 'What\'s your role?',
      subtitle: 'This helps us customize your experience'
    },
    {
      title: 'How big is your team?',
      subtitle: 'We\'ll set up the right features for you'
    },
    {
      title: 'What are your main goals?',
      subtitle: 'Select all that apply'
    }
  ]

  const roles = [
    { id: 'individual', label: 'Individual Contributor', icon: Briefcase },
    { id: 'manager', label: 'Team Manager', icon: Users },
    { id: 'executive', label: 'Executive', icon: Target },
    { id: 'freelancer', label: 'Freelancer', icon: Sparkles }
  ]

  const teamSizes = [
    { id: 'solo', label: 'Just me' },
    { id: 'small', label: '2-10 people' },
    { id: 'medium', label: '11-50 people' },
    { id: 'large', label: '50+ people' }
  ]

  const goals = [
    { id: 'tasks', label: 'Manage personal tasks' },
    { id: 'projects', label: 'Track project progress' },
    { id: 'team', label: 'Collaborate with team' },
    { id: 'clients', label: 'Manage client work' },
    { id: 'deadlines', label: 'Meet deadlines better' },
    { id: 'productivity', label: 'Increase productivity' }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  const completeOnboarding = async () => {
    // Here you would save the onboarding data to your database
    console.log('Onboarding completed:', onboardingData)
    
    // Mark user as onboarded (you'd save this to your database)
    localStorage.setItem('onboarded', 'true')
    
    router.push('/dashboard')
  }

  const toggleGoal = (goalId: string) => {
    setOnboardingData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-600 mb-8">
            {steps[currentStep].subtitle}
          </p>

          {/* Step 1: Welcome */}
          {currentStep === 0 && (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-blue-600" />
              </div>
              <p className="text-lg text-gray-700 mb-6">
                Hi {user?.firstName || 'there'}! We're excited to have you on board.
              </p>
              <p className="text-gray-600">
                This quick setup will help us personalize TheGridHub for your needs.
              </p>
            </div>
          )}

          {/* Step 2: Role Selection */}
          {currentStep === 1 && (
            <div className="grid grid-cols-2 gap-4">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setOnboardingData({ ...onboardingData, role: role.id })}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    onboardingData.role === role.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <role.icon className={`h-8 w-8 mb-3 ${
                    onboardingData.role === role.id ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className="font-medium text-gray-900">{role.label}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Team Size */}
          {currentStep === 2 && (
            <div className="space-y-3">
              {teamSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setOnboardingData({ ...onboardingData, teamSize: size.id })}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    onboardingData.teamSize === size.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{size.label}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Goals */}
          {currentStep === 3 && (
            <div className="space-y-3">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    onboardingData.goals.includes(goal.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                      onboardingData.goals.includes(goal.id)
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {onboardingData.goals.includes(goal.id) && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <p className="font-medium text-gray-900">{goal.label}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !onboardingData.role) ||
                (currentStep === 2 && !onboardingData.teamSize) ||
                (currentStep === 3 && onboardingData.goals.length === 0)
              }
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                (currentStep === 1 && !onboardingData.role) ||
                (currentStep === 2 && !onboardingData.teamSize) ||
                (currentStep === 3 && onboardingData.goals.length === 0)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
