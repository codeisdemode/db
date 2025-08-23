"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Check, 
  X, 
  Zap, 
  Crown, 
  Users, 
  Database, 
  Cloud,
  Shield,
  BarChart3,
  Globe,
  Clock,
  Server,
  ArrowRight,
  BookOpen
} from "lucide-react"

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for personal projects and getting started",
    icon: Zap,
    features: [
      "Up to 10,000 records",
      "Basic semantic search",
      "1GB storage limit",
      "Single user",
      "Community support",
      "Local storage only"
    ],
    limitations: [
      "No cloud synchronization",
      "Limited to 3 tables",
      "No advanced analytics"
    ],
    cta: "Get Started",
    href: "/docs"
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing applications and small teams",
    icon: Crown,
    popular: true,
    features: [
      "Up to 100,000 records",
      "Advanced semantic search",
      "10GB storage",
      "Up to 5 team members",
      "Priority support",
      "Cloud synchronization",
      "Real-time updates",
      "Basic analytics",
      "Unlimited tables",
      "Email support"
    ],
    limitations: [],
    cta: "Start Free Trial",
    href: "/docs"
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale applications and organizations",
    icon: Users,
    features: [
      "Unlimited records",
      "Enterprise-grade semantic search",
      "Unlimited storage",
      "Unlimited team members",
      "24/7 dedicated support",
      "Multi-region sync",
      "Advanced analytics dashboard",
      "Custom integrations",
      "SLA guarantees",
      "On-premise deployment",
      "Custom embedding models",
      "Audit logging"
    ],
    limitations: [],
    cta: "Contact Sales",
    href: "/docs"
  }
]

const featureComparison = [
  {
    feature: "Records Limit",
    free: "10,000",
    pro: "100,000",
    enterprise: "Unlimited"
  },
  {
    feature: "Storage",
    free: "1GB",
    pro: "10GB",
    enterprise: "Unlimited"
  },
  {
    feature: "Team Members",
    free: "1",
    pro: "5",
    enterprise: "Unlimited"
  },
  {
    feature: "Cloud Sync",
    free: false,
    pro: true,
    enterprise: true
  },
  {
    feature: "Real-time Updates",
    free: false,
    pro: true,
    enterprise: true
  },
  {
    feature: "Advanced Analytics",
    free: false,
    pro: "Basic",
    enterprise: "Advanced"
  },
  {
    feature: "Priority Support",
    free: false,
    pro: true,
    enterprise: "24/7 Dedicated"
  },
  {
    feature: "Custom Integrations",
    free: false,
    pro: false,
    enterprise: true
  },
  {
    feature: "SLA Guarantee",
    free: false,
    pro: false,
    enterprise: true
  }
]

const includedFeatures = [
  {
    name: "Columnar Storage",
    description: "Efficient column-based storage for fast queries",
    icon: Database
  },
  {
    name: "Semantic Search",
    description: "AI-powered search across all your data",
    icon: Cloud
  },
  {
    name: "Offline Support",
    description: "Works completely offline with automatic sync",
    icon: Shield
  },
  {
    name: "Real-time Analytics",
    description: "Built-in analytics and data visualization",
    icon: BarChart3
  },
  {
    name: "Multi-platform",
    description: "Works across web, mobile, and desktop",
    icon: Globe
  },
  {
    name: "Always Available",
    description: "99.9% uptime guarantee for paid plans",
    icon: Clock
  }
]

export default function Pricing() {
  const [annualBilling, setAnnualBilling] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Columnist Pricing</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/docs">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Documentation
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the plan that works best for your application. All plans include our core 
            columnar database with semantic search capabilities.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${!annualBilling ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  annualBilling ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${annualBilling ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Annual
              </span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 transition-all ${
                plan.popular
                  ? 'border-primary bg-primary/5 shadow-xl scale-105'
                  : 'border-border bg-background hover:shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <plan.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold">
                    {annualBilling && plan.name === "Pro" ? "$24" : plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground ml-2">
                      {annualBilling ? "/year" : plan.period}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation, index) => (
                  <div key={index} className="flex items-center text-muted-foreground">
                    <X className="h-5 w-5 text-red-400 mr-3" />
                    <span className="text-sm">{limitation}</span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                size="lg"
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Plan Comparison</h2>
          <div className="bg-muted/50 rounded-lg p-6">
            <div className="grid grid-cols-4 gap-4 text-sm font-medium mb-4">
              <div>Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center">Pro</div>
              <div className="text-center">Enterprise</div>
            </div>
            
            {featureComparison.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-4 py-4 border-b border-border last:border-b-0"
              >
                <div className="font-medium">{item.feature}</div>
                <div className="text-center">
                  {typeof item.free === 'boolean' ? (
                    item.free ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    )
                  ) : (
                    item.free
                  )}
                </div>
                <div className="text-center">
                  {typeof item.pro === 'boolean' ? (
                    item.pro ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    )
                  ) : (
                    item.pro
                  )}
                </div>
                <div className="text-center">
                  {typeof item.enterprise === 'boolean' ? (
                    item.enterprise ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    )
                  ) : (
                    item.enterprise
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Included Features */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">Everything You Need</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            All plans include our powerful columnar database engine with these core features:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {includedFeatures.map((feature) => (
              <div key={feature.name} className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
            <div>
              <h4 className="font-semibold mb-2">Can I switch plans later?</h4>
              <p className="text-muted-foreground text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Your data will be preserved during the transition.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Is there a free trial?</h4>
              <p className="text-muted-foreground text-sm">
                The Free plan is always free. Pro plan comes with a 14-day free trial with no credit card required.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-muted-foreground text-sm">
                We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Do you offer discounts for startups?</h4>
              <p className="text-muted-foreground text-sm">
                Yes! We offer special discounts for startups and educational institutions. Contact us for more information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}