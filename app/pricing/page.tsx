'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started with AI resume analysis',
      price: { monthly: 0, annual: 0 },
      features: [
        '1 Resume Analysis per month',
        'Basic AI feedback',
        'Standard templates',
        'Email support',
        'Basic job matching'
      ],
      limitations: [
        'Limited export formats',
        'Basic templates only',
        'No priority support'
      ],
      cta: 'Get Started Free',
      popular: false,
      color: 'gray'
    },
    {
      name: 'Pro',
      description: 'For serious job seekers who want the best results',
      price: { monthly: 19, annual: 15 },
      features: [
        'Unlimited Resume Analysis',
        'Advanced AI insights',
        'Premium templates',
        'Cover letter generator',
        'Priority job matching',
        'Interview preparation',
        'ATS optimization',
        'Priority email support',
        'Export in all formats',
        'Career analytics dashboard'
      ],
      limitations: [],
      cta: 'Start Pro Trial',
      popular: true,
      color: 'yellow'
    },
    {
      name: 'Enterprise',
      description: 'For companies and career coaches',
      price: { monthly: 99, annual: 79 },
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'White-label solutions',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced analytics',
        'Custom templates',
        'Phone support',
        'Training sessions'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false,
      color: 'purple'
    }
  ]

  const getPrice = (plan: any) => {
    const price = isAnnual ? plan.price.annual : plan.price.monthly
    return price === 0 ? 'Free' : `$${price}`
  }

  const getSavings = (plan: any) => {
    if (plan.price.monthly === 0) return null
    const monthlyCost = plan.price.monthly * 12
    const annualCost = plan.price.annual * 12
    const savings = monthlyCost - annualCost
    return Math.round((savings / monthlyCost) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-5 bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="flex items-center text-2xl font-extrabold">
          <Link href="/" className="flex items-center">
            <span className="text-gray-900">AI Job</span> <span className="text-yellow-400 ml-1">Platform</span>
          </Link>
        </div>
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-900 font-medium hover:text-yellow-500 transition-colors">
            Home
          </Link>
          <Link href="/features" className="text-gray-900 font-medium hover:text-yellow-500 transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-yellow-500 font-medium">
            Pricing
          </Link>
          <Link href="/contact" className="text-gray-900 font-medium hover:text-yellow-500 transition-colors">
            Contact
          </Link>
        </nav>
        <Link 
          href="/auth/sign-in"
          className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
        >
          Sign In
        </Link>
      </header>

      {/* Hero Section */}
      <section className="px-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
            Simple, <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">Transparent Pricing</span>
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed mb-12 max-w-3xl mx-auto">
            Choose the perfect plan for your career goals. Start free and upgrade anytime as your needs grow.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-16">
            <span className={`font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-yellow-400' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Save up to 25%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-10 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-xl p-8 border-2 transition-all hover:shadow-2xl ${
                  plan.popular 
                    ? 'border-yellow-400 transform scale-105' 
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-6 py-2 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">
                      {getPrice(plan)}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-gray-500 ml-2">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    )}
                  </div>

                  {isAnnual && getSavings(plan) && (
                    <div className="text-green-600 text-sm font-medium mb-4">
                      Save {getSavings(plan)}% with annual billing
                    </div>
                  )}

                  <Link
                    href={plan.name === 'Enterprise' ? '/contact' : '/auth/sign-up'}
                    className={`block w-full py-3 px-6 rounded-lg font-bold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-yellow-400 to-pink-400 text-white hover:shadow-lg'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">What's included:</h4>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs mr-3">
                        ✓
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 pt-4 mt-6">
                        <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-4">Limitations:</h4>
                        {plan.limitations.map((limitation, limitIndex) => (
                          <div key={limitIndex} className="flex items-center mb-2">
                            <div className="w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs mr-3">
                              ✗
                            </div>
                            <span className="text-gray-500 text-sm">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-10 py-20 bg-white/70 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-700">
              Everything you need to know about our pricing and plans
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Can I change plans anytime?</h3>
              <p className="text-gray-700">
                Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Is there a free trial?</h3>
              <p className="text-gray-700">
                Yes! The Pro plan comes with a 7-day free trial. No credit card required to start.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">What payment methods do you accept?</h3>
              <p className="text-gray-700">
                We accept all major credit cards, PayPal, and bank transfers for annual plans.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Do you offer refunds?</h3>
              <p className="text-gray-700">
                Yes! We offer a 30-day money-back guarantee on all paid plans. No questions asked.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Is my data secure?</h3>
              <p className="text-gray-700">
                Absolutely! We use enterprise-grade security and encryption to protect your data.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Need a custom plan?</h3>
              <p className="text-gray-700">
                Contact our sales team for custom pricing and features tailored to your organization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-10 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 rounded-3xl p-12 shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Join thousands of professionals who have already accelerated their career growth with our AI-powered platform
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/auth/sign-up"
              className="bg-white text-gray-900 px-10 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-lg"
            >
              Start Free Today
            </Link>
            <Link 
              href="/contact"
              className="bg-white/20 backdrop-blur text-white px-10 py-4 rounded-lg font-bold hover:bg-white/30 transition-all border border-white/30"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-10 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center text-2xl font-bold mb-6">
                <span className="text-white">AI Job</span> <span className="text-yellow-400 ml-1">Platform</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering your career journey with AI-driven insights and professional tools.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">Features</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/resume-upload" className="hover:text-white transition-colors">Resume Analysis</Link></li>
                <li><Link href="/resume-builder" className="hover:text-white transition-colors">Resume Builder</Link></li>
                <li><Link href="/job-match" className="hover:text-white transition-colors">Job Matching</Link></li>
                <li><Link href="/templates" className="hover:text-white transition-colors">Templates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/setup" className="hover:text-white transition-colors">Setup Guide</Link></li>
                <li><Link href="/auth/sign-in" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/auth/sign-up" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Job Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 
