import Link from 'next/link'
import { ArrowRight, Users, DollarSign, TrendingUp, Shield } from 'lucide-react'

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'

export default function WhyTheGridHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <img 
                src="/images/logo.svg" 
                alt="TheGridHub" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">TheGridHub</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</Link>
              <Link href="/#pricing" className="text-gray-600 hover:text-purple-600 transition-colors">Pricing</Link>
              <Link href="/why-thegridhub" className="text-purple-600 font-medium">Why TheGridHub?</Link>
              <Link href="/login" className="text-gray-600 hover:text-purple-600 transition-colors">Sign In</Link>
              <Link href="/login" className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-2 rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30">
                Start for Free
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-white/60 backdrop-blur-lg z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why We Built TheGridHub
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The productivity tool industry had it backwards. We're changing that.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white/80 backdrop-blur-lg relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              We know that moment. Your team is hitting its stride, projects are flowing, collaboration is clicking—and then you get the notification. You've reached your user limit. Time to upgrade.
            </p>
            
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Suddenly, that $15/month tool becomes $150/month. Per user fees stack up. Essential features get locked behind enterprise tiers. The tool that helped you grow is now holding you back.
            </p>
            
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              We've been there. As builders ourselves, we watched productivity tools become luxury subscriptions. We saw teams forced to choose between functionality and affordability. We realized the industry had it backwards:
            </p>
            
            <blockquote className="text-2xl font-semibold text-purple-600 text-center my-12 py-8 border-l-4 border-purple-600 pl-8 bg-purple-50/80 backdrop-blur-sm rounded-r-lg">
              "The teams doing the hardest work shouldn't pay the highest prices."
            </blockquote>
            
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              TheGridHub changes that equation. We built a platform that scales with your ambitions, not your budget. Full-featured project management, unlimited workspaces, real collaboration—all accessible from day one. No user limits that surprise you. No features held hostage behind price walls.
            </p>
            
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              When your team of 5 becomes 15, your costs don't triple. When your startup lands that big client, your tools don't become your biggest expense.
            </p>
            
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              This is productivity software for the real world. Where great teams shouldn't have to choose between growth and tools that grow with them.
            </p>
            
            <p className="text-lg text-gray-700 mb-12 leading-relaxed font-medium">
              Because building something amazing is hard enough without your software working against you.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white/70 backdrop-blur-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Core Principles
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No User Limits</h3>
              <p className="text-gray-600">
                Your team shouldn't shrink to fit your budget. Invite everyone from day one.
              </p>
            </div>
            
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparent Pricing</h3>
              <p className="text-gray-600">
                No surprises, no hidden fees. What you see is what you pay.
              </p>
            </div>
            
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="w-16 h-16 bg-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth-Friendly</h3>
              <p className="text-gray-600">
                Tools that scale with your success, not against it.
              </p>
            </div>
            
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="w-16 h-16 bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise-Grade</h3>
              <p className="text-gray-600">
                Full features for everyone, not just enterprise customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-purple-500 relative z-10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to experience the difference?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join teams who've chosen tools that grow with them, not against them.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/login" className="bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 flex items-center shadow-lg hover:shadow-xl transition-all">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/#pricing" className="text-white px-8 py-4 rounded-xl text-lg font-semibold hover:text-purple-100 border border-white/20 hover:border-white/40 transition-all">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/images/logo.svg" 
                  alt="TheGridHub" 
                  className="h-8 w-auto brightness-0 invert"
                />
                <span className="text-xl font-bold text-white">TheGridHub</span>
              </div>
              <p className="text-gray-400 max-w-md">
                AI-powered task management that helps teams stay organized and productive. 
                Built for the modern workplace.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/#features" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link href="/#pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><Link href="/sign-up" className="text-gray-400 hover:text-white">Free Trial</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/why-thegridhub" className="text-gray-400 hover:text-white">Why TheGridHub?</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white">Careers</Link></li>
                <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 TheGridHub. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-white text-sm">Privacy</Link>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-white text-sm">Terms</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white text-sm">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
