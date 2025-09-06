'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Globe,
  ChevronDown
} from 'lucide-react'

const translations = {
  en: {
    step: 'Step',
    of: 'of',
    continue: 'Continue',
    back: 'Back',
    companyQuestion: 'What is your company called?',
    companyHelp: "Let us know the name of your team, department, or company, and we'll use this information to enhance your experience.",
    companyPlaceholder: 'e.g., Taskworld',
    workingQuestion: "What is your team working on?",
    workingHelp: 'Let us know what your team is currently focused on, such as launching a website, selling subscriptions, or planning events.',
    workingPlaceholder: 'e.g., planning events',
    whoQuestion: 'Who do you work with?',
    whoHelp: "Collaboration is key! Let's bring in the rest of the team.",
    inviteByEmail: 'Invite by email – We\'ll send them an invitation email',
    invitePlaceholder: 'email@company.com',
    members: 'Members',
    guests: 'Guests',
    almostDone: 'Almost done!',
    almostHelp: 'Just a few more details and your account will be set up.',
    firstName: 'First name',
    lastName: 'Last name',
    phoneNumber: 'Phone number',
    getStarted: 'Get Started',
  },
  fr: {
    step: 'Étape',
    of: 'sur',
    continue: 'Continuer',
    back: 'Retour',
    companyQuestion: "Comment s'appelle votre entreprise ?",
    companyHelp: "Dites-nous le nom de votre équipe, service ou entreprise pour améliorer votre expérience.",
    companyPlaceholder: 'ex. Taskworld',
    workingQuestion: "Sur quoi votre équipe travaille-t-elle ?",
    workingHelp: "Indiquez votre objectif actuel (lancement de site, abonnements, événements...).",
    workingPlaceholder: 'ex. planification d’événements',
    whoQuestion: 'Avec qui travaillez-vous ?',
    whoHelp: "La collaboration est essentielle ! Invitez le reste de l'équipe.",
    inviteByEmail: "Inviter par e‑mail – nous leur enverrons une invitation",
    invitePlaceholder: 'email@entreprise.com',
    members: 'Membres',
    guests: 'Invités',
    almostDone: 'Presque terminé !',
    almostHelp: "Encore quelques détails pour terminer la configuration.",
    firstName: 'Prénom',
    lastName: 'Nom',
    phoneNumber: 'Numéro de téléphone',
    getStarted: 'Commencer',
  },
  es: {
    step: 'Paso',
    of: 'de',
    continue: 'Continuar',
    back: 'Atrás',
    companyQuestion: '¿Cómo se llama tu empresa?',
    companyHelp: 'Cuéntanos el nombre de tu equipo, departamento o empresa para mejorar tu experiencia.',
    companyPlaceholder: 'p. ej., Taskworld',
    workingQuestion: '¿En qué está trabajando tu equipo?',
    workingHelp: 'Indica el enfoque actual: lanzar un sitio web, vender suscripciones o planificar eventos.',
    workingPlaceholder: 'p. ej., planificar eventos',
    whoQuestion: '¿Con quién trabajas?',
    whoHelp: '¡La colaboración es clave! Invita al resto del equipo.',
    inviteByEmail: 'Invitar por correo – Les enviaremos una invitación',
    invitePlaceholder: 'email@empresa.com',
    members: 'Miembros',
    guests: 'Invitados',
    almostDone: '¡Casi listo!',
    almostHelp: 'Solo unos detalles más y tu cuenta estará lista.',
    firstName: 'Nombre',
    lastName: 'Apellido',
    phoneNumber: 'Número de teléfono',
    getStarted: 'Empezar',
  },
  de: {
    step: 'Schritt',
    of: 'von',
    continue: 'Weiter',
    back: 'Zurück',
    companyQuestion: 'Wie heißt dein Unternehmen?',
    companyHelp: 'Teile den Namen deines Teams, Bereichs oder Unternehmens mit, um deine Erfahrung zu verbessern.',
    companyPlaceholder: 'z. B. Taskworld',
    workingQuestion: 'Woran arbeitet dein Team?',
    workingHelp: 'Gib den aktuellen Fokus an: Website-Launch, Abos verkaufen oder Events planen.',
    workingPlaceholder: 'z. B. Eventplanung',
    whoQuestion: 'Mit wem arbeitest du?',
    whoHelp: 'Zusammenarbeit ist der Schlüssel! Lade den Rest des Teams ein.',
    inviteByEmail: 'Per E‑Mail einladen – Wir senden eine Einladung',
    invitePlaceholder: 'email@firma.com',
    members: 'Mitglieder',
    guests: 'Gäste',
    almostDone: 'Fast fertig!',
    almostHelp: 'Nur noch wenige Details, dann ist dein Konto eingerichtet.',
    firstName: 'Vorname',
    lastName: 'Nachname',
    phoneNumber: 'Telefonnummer',
    getStarted: 'Los geht’s',
  },
} as const

type LangKey = keyof typeof translations

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { user } = useUser()
  const [lang, setLang] = useState<LangKey>('en')
  const [showLang, setShowLang] = useState(false)
  const langMenuRef = useRef<HTMLDivElement|null>(null)
  const t = translations[lang]

  const [currentStep, setCurrentStep] = useState(0)
  const [companyName, setCompanyName] = useState('')
  const [focus, setFocus] = useState('')
  const [invites, setInvites] = useState('') // comma-separated
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const steps = [t.companyQuestion, t.workingQuestion, t.whoQuestion, t.almostDone]

  // Redirect onboarded users
  useEffect(() => {
    const check = async () => {
      if (!user) return
      const uid = await getUserId()
      if (!uid) return
      const { data } = await supabase
        .from('user_onboarding')
        .select('id')
        .eq('userId', uid)
        .maybeSingle()
      if (data) router.push('/dashboard')
    }
    void check()
  }, [user, supabase, router])

  // Close language dropdown on outside click
  useEffect(()=>{
    if (!showLang) return
    const onClick = (e: MouseEvent) => {
      if (!langMenuRef.current) return
      if (!(e.target instanceof Node)) return
      if (!langMenuRef.current.contains(e.target)) setShowLang(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [showLang])

  const getUserId = async (): Promise<string | null> => {
    if (!user) return null
    try {
      const res = await fetch('/api/users/ensure', { method: 'POST' })
      if (!res.ok) return null
      const json = await res.json().catch(()=>({}))
      return json?.id || null
    } catch {
      return null
    }
  }

  const isEmail = (s:string) => /.+@.+\..+/.test(s)
  const isValidStep = () => {
    if (currentStep === 0) return companyName.trim().length >= 2
    if (currentStep === 1) return focus.trim().length >= 2
    if (currentStep === 2) {
      if (!invites.trim()) return true
      return invites.split(/[,\s]+/).filter(Boolean).every(isEmail)
    }
    if (currentStep === 3) return firstName.trim().length >= 2
    return true
  }

  const handleNext = async () => {
    if (!isValidStep()) return
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      await completeOnboarding()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

  const completeOnboarding = async () => {
    if (!user) return router.push('/login')

    const userId = await getUserId()
    if (!userId) return router.push('/dashboard')

    // Save onboarding data
    const invitedEmails = invites
      .split(/[,\s]+/)
      .map(e => e.trim())
      .filter(Boolean)

    const { error } = await supabase
      .from('user_onboarding')
      .insert({
        userId,
        companyName: companyName || null,
        focus: focus || null,
        invitedEmails: invitedEmails.length ? invitedEmails : null,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        language: lang,
      })
    if (error) console.error(error)

    // Update auth profile metadata & users table name
    try { await supabase.auth.updateUser({ data: { first_name: firstName, last_name: lastName, phone } }) } catch {}

    await supabase
      .from('users')
      .update({ name: [firstName, lastName].filter(Boolean).join(' ') || undefined })
      .eq('id', userId)

    try { 
      localStorage.setItem('onboarded', '1')
      // Mark that the welcome screen has not yet been shown on this device
      localStorage.removeItem('welcomed')
    } catch {}
    router.push('/welcome?first=1')
  }

  const StepHeader = (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {/* Logo */}
        <Image src="/images/logo.svg" alt="TheGridHub" width={28} height={28} />
        <span className="text-sm text-gray-600">{t.step} {currentStep + 1} {t.of} {steps.length}</span>
      </div>
      {/* Language selector */}
      <div className="relative" ref={langMenuRef}>
        <button onClick={()=>setShowLang(v=>!v)} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm">
          <Globe className="w-4 h-4" /> {lang.toUpperCase()} <ChevronDown className="w-4 h-4" />
        </button>
        {showLang && (
          <div className="absolute right-0 mt-2 w-28 rounded-md shadow bg-white border border-gray-200 z-10">
            {(['en','fr','es','de'] as LangKey[]).map(l => (
              <button key={l} onClick={() => { setLang(l); setShowLang(false) }} className={`block w-full text-left px-3 py-2 text-sm ${lang===l?'bg-gray-100':''}`}>{l.toUpperCase()}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-fuchsia-50">
      <div className="grid md:grid-cols-2 min-h-screen">
        {/* Left: Brand/hero */}
        <div className="relative hidden md:flex flex-col justify-between bg-gradient-to-br from-gray-900 via-purple-900 to-fuchsia-900 text-white p-10 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-fuchsia-500/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <Image src="/images/logo.svg" alt="TheGridHub" width={140} height={36} />
            </div>
            <h2 className="text-3xl font-semibold leading-tight">Build smarter workflows</h2>
            <p className="mt-3 text-white/80">Set up your workspace, invite teammates, and personalize your dashboard. We'll have you productive in minutes.</p>
            <div className="mt-8 grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></span>
                <span className="text-sm text-white/80">Modern, accessible UI</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></span>
                <span className="text-sm text-white/80">AI-powered suggestions</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></span>
                <span className="text-sm text-white/80">Integrates with your tools</span>
              </div>
            </div>
          </div>
          <div className="relative z-10 text-xs text-white/60">© {new Date().getFullYear()} TheGridHub</div>
        </div>

        {/* Right: Form */}
        <div className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-xl bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-white/60 p-8">
            <div className="flex items-center justify-between mb-6">
              {/* Stepper */}
              <div className="flex items-center gap-3">
                {steps.map((label, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i <= currentStep ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{i+1}</div>
                    {i < steps.length - 1 && (
                      <div className={`h-0.5 w-8 ${i < currentStep ? 'bg-purple-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
              {/* Language selector */}
              <div className="relative" ref={langMenuRef}>
                <button onClick={()=>setShowLang(v=>!v)} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm">
                  <Globe className="w-4 h-4" /> {lang.toUpperCase()} <ChevronDown className="w-4 h-4" />
                </button>
                {showLang && (
                  <div className="absolute right-0 mt-2 w-28 rounded-md shadow bg-white border border-gray-200 z-10">
                    {(['en','fr','es','de'] as LangKey[]).map(l => (
                      <button key={l} onClick={() => { setLang(l); setShowLang(false) }} className={`block w-full text-left px-3 py-2 text-sm ${lang===l?'bg-gray-100':''}`}>{l.toUpperCase()}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Titles */}
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-gray-900 mb-1">{steps[currentStep]}</h1>
              <p className="text-sm text-gray-600">{currentStep+1} {t.of} {steps.length}</p>
            </div>

            {/* Step content */}
            {currentStep === 0 && (
              <div>
                <p className="text-gray-600 mb-4 text-sm">{t.companyHelp}</p>
                <input
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  placeholder={t.companyPlaceholder}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                {companyName && companyName.trim().length < 2 && (
                  <div className="text-xs text-red-600 mt-1">Please enter at least 2 characters.</div>
                )}
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <p className="text-gray-600 mb-4 text-sm">{t.workingHelp}</p>
                <input
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  placeholder={t.workingPlaceholder}
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                />
                {focus && focus.trim().length < 2 && (
                  <div className="text-xs text-red-600 mt-1">Please enter at least 2 characters.</div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <p className="text-gray-600 mb-4 text-sm">{t.whoHelp}</p>
                <div className="text-sm text-gray-700 font-medium mb-2">{t.inviteByEmail}</div>
                <textarea
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  rows={3}
                  placeholder={t.invitePlaceholder}
                  value={invites}
                  onChange={(e) => setInvites(e.target.value)}
                />
                {invites.trim() && !invites.split(/[ ,\n]+/).filter(Boolean).every(v=>/.+@.+\..+/.test(v)) && (
                  <div className="text-xs text-red-600 mt-1">Enter valid emails separated by commas or spaces.</div>
                )}
                <p className="text-xs text-gray-500 mt-2">Separate emails with commas , or spaces.</p>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <p className="text-gray-600 mb-4 text-sm">{t.almostHelp}</p>
                <div className="grid grid-cols-2 gap-3">
                  <input className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-200" placeholder={t.firstName} value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
                  <input className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-200" placeholder={t.lastName} value={lastName} onChange={(e)=>setLastName(e.target.value)} />
                </div>
                {firstName && firstName.trim().length < 2 && (
                  <div className="text-xs text-red-600 mt-1">Please enter at least 2 characters for first name.</div>
                )}
                <div className="mt-3">
                  <input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-200" placeholder={t.phoneNumber} value={phone} onChange={(e)=>setPhone(e.target.value)} />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center px-5 py-2 rounded-lg font-medium ${currentStep===0? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ArrowLeft className="h-5 w-5 mr-2" /> {t.back}
              </button>
              <button
                onClick={handleNext}
                disabled={!isValidStep()}
                className={`flex items-center px-5 py-2 rounded-lg font-medium ${isValidStep()? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
              >
                {currentStep === steps.length - 1 ? t.getStarted : t.continue}
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
