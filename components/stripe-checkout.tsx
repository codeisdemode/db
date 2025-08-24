"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@clerk/nextjs"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  priceId: string
  planName: string
  children: React.ReactNode
}

export function StripeCheckout({ priceId, planName, children }: StripeCheckoutProps) {
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const { userId, getToken } = useAuth()

  const fetchClientSecret = async () => {
    try {
      const token = await getToken()
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          priceId,
          userId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      
      // For embedded checkout, we need to get the client secret
      const sessionResponse = await fetch(`/api/stripe/checkout/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!sessionResponse.ok) {
        throw new Error('Failed to get checkout session')
      }

      const session = await sessionResponse.json()
      setClientSecret(session.clientSecret)
      setShowCheckout(true)
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to start checkout. Please try again.')
    }
  }

  const handleClick = () => {
    if (!userId) {
      alert('Please sign in to subscribe')
      return
    }
    fetchClientSecret()
  }

  return (
    <>
      <div onClick={handleClick}>
        {children}
      </div>

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Subscribe to {planName}</DialogTitle>
          </DialogHeader>
          
          <div className="h-[500px] overflow-auto">
            {clientSecret && (
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ clientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}