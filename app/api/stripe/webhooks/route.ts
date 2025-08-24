import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Columnist } from '@/lib/columnist'
import { SubscriptionService } from '@/lib/subscription-service'
import { getPlanFromStripePriceId } from '@/lib/subscription-schema'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Initialize database and subscription service
let subscriptionService: SubscriptionService

async function getSubscriptionService() {
  if (!subscriptionService) {
    const db = new Columnist('subscriptions')
    subscriptionService = new SubscriptionService(db)
    await subscriptionService.initialize()
  }
  return subscriptionService
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
  const customerId = session.customer as string
  const userId = session.metadata?.userId
  
  if (!userId) {
    console.error('No user ID found in session metadata')
    return
  }

  const priceId = subscription.items.data[0].price.id
  const plan = getPlanFromStripePriceId(priceId)
  
  const service = await getSubscriptionService()
  
  await service.updateUserSubscription(userId, {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    plan: plan
  })

  console.log('Subscription created and stored:', {
    subscriptionId: subscription.id,
    customerId,
    userId,
    plan,
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const service = await getSubscriptionService()
  const userSubscriptions = await service.db.query("subscriptions", {
    where: { stripeSubscriptionId: subscription.id }
  })

  if (userSubscriptions.length > 0) {
    const userSubscription = userSubscriptions[0]
    await service.updateUserSubscription(userSubscription.userId, {
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false
    })

    console.log('Subscription updated in database:', {
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
    })
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const service = await getSubscriptionService()
  const userSubscriptions = await service.db.query("subscriptions", {
    where: { stripeSubscriptionId: subscription.id }
  })

  if (userSubscriptions.length > 0) {
    const userSubscription = userSubscriptions[0]
    await service.updateUserSubscription(userSubscription.userId, {
      status: "canceled",
      stripeSubscriptionId: undefined,
      plan: "free",
      cancelAtPeriodEnd: false
    })

    console.log('Subscription deleted, user moved to free plan:', {
      subscriptionId: subscription.id,
      userId: userSubscription.userId
    })
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', {
    invoiceId: invoice.id,
    amountPaid: invoice.amount_paid,
    customerId: invoice.customer
  })
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', {
    invoiceId: invoice.id,
    amountDue: invoice.amount_due,
    customerId: invoice.customer
  })

  // TODO: Handle payment failure (send email, update status, etc.)
}