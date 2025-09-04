#!/usr/bin/env node
/*
  Stripe bootstrap: creates products and prices for TheGridHub plans if missing.
  - Idempotent: uses lookup_key on prices and metadata on products
  - Requires: process.env.STRIPE_SECRET_KEY
  - Outputs: price IDs and ready-to-paste `vercel env add` commands

  Usage:
    STRIPE_SECRET_KEY=sk_live_... node scripts/stripe/bootstrap.js
*/

const main = async () => {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    console.error('\n[ERROR] STRIPE_SECRET_KEY is not set.\n')
    console.error('Set it temporarily for this command:')
    console.error('  STRIPE_SECRET_KEY=sk_live_... node scripts/stripe/bootstrap.js\n')
    process.exit(1)
  }

  const stripe = require('stripe')(secret, { apiVersion: '2022-11-15' })

  // Define pricing in USD cents (aligns with lib/pricing.ts)
  const plans = {
    PERSONAL: { name: 'TheGridHub Personal', monthly: 699, yearly: 559 },
    PRO: { name: 'TheGridHub Pro', monthly: 1299, yearly: 1039 },
    BUSINESS: { name: 'TheGridHub Business', monthly: 2499, yearly: 1999 },
    ENTERPRISE: { name: 'TheGridHub Enterprise', monthly: 4999, yearly: 3999 },
  }

  const created = {
    PERSONAL: { MONTHLY: '', YEARLY: '' },
    PRO: { MONTHLY: '', YEARLY: '' },
    BUSINESS: { MONTHLY: '', YEARLY: '' },
    ENTERPRISE: { MONTHLY: '', YEARLY: '' },
  }

  // Helper to find or create product by metadata.tgh_plan
  async function getOrCreateProduct(planKey, name) {
    // Try to find an existing product with metadata.tgh_plan = planKey
    const list = await stripe.products.list({ limit: 100, active: true })
    const found = list.data.find(p => p.metadata && p.metadata.tgh_plan === planKey)
    if (found) return found

    // Create new product
    return await stripe.products.create({
      name,
      active: true,
      metadata: { tgh_plan: planKey },
    })
  }

  // Helper to find or create price by lookup_key
  async function getOrCreatePrice(productId, planKey, interval, amountCents) {
    const lookup_key = `tgh_${planKey.toLowerCase()}_${interval}_usd_${amountCents}`
    // Attempt to find by lookup_key
    const priceList = await stripe.prices.list({ product: productId, active: true, limit: 100 })
    const existing = priceList.data.find(pr => pr.lookup_key === lookup_key)
    if (existing) return existing

    // Create price
    return await stripe.prices.create({
      product: productId,
      currency: 'usd',
      unit_amount: amountCents,
      nickname: `${planKey} ${interval.toUpperCase()} USD`,
      recurring: { interval: interval === 'monthly' ? 'month' : 'year' },
      lookup_key,
      active: true,
    })
  }

  console.log('\nBootstrapping Stripe products and prices for TheGridHub...')

  for (const planKey of Object.keys(plans)) {
    const plan = plans[planKey]
    const product = await getOrCreateProduct(planKey, plan.name)

    const monthly = await getOrCreatePrice(product.id, planKey, 'monthly', plan.monthly)
    const yearly = await getOrCreatePrice(product.id, planKey, 'yearly', plan.yearly)

    created[planKey].MONTHLY = monthly.id
    created[planKey].YEARLY = yearly.id

    console.log(`  ✓ ${planKey} -> product=${product.id}, monthly=${monthly.id}, yearly=${yearly.id}`)
  }

  // Print summary and Vercel env add commands
  console.log('\nCreated/Found Price IDs:')
  console.table({
    PERSONAL: created.PERSONAL,
    PRO: created.PRO,
    BUSINESS: created.BUSINESS,
    ENTERPRISE: created.ENTERPRISE,
  })

  console.log('\nSet these public env vars in Vercel (Production and Preview):\n')

  const lines = [
    `NEXT_PUBLIC_STRIPE_PRICE_PERSONAL_MONTHLY=${created.PERSONAL.MONTHLY}`,
    `NEXT_PUBLIC_STRIPE_PRICE_PERSONAL_YEARLY=${created.PERSONAL.YEARLY}`,
    `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=${created.PRO.MONTHLY}`,
    `NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=${created.PRO.YEARLY}`,
    `NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY=${created.BUSINESS.MONTHLY}`,
    `NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_YEARLY=${created.BUSINESS.YEARLY}`,
    `NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY=${created.ENTERPRISE.MONTHLY}`,
    `NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_YEARLY=${created.ENTERPRISE.YEARLY}`,
  ]
  for (const l of lines) console.log('  ' + l)

  console.log('\nVercel CLI (paste the value when prompted):\n')
  const cmd = (name) => `vercel env add ${name} production`
  const names = [
    'NEXT_PUBLIC_STRIPE_PRICE_PERSONAL_MONTHLY',
    'NEXT_PUBLIC_STRIPE_PRICE_PERSONAL_YEARLY',
    'NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY',
    'NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY',
    'NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY',
    'NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_YEARLY',
    'NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY',
    'NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_YEARLY',
  ]
  for (const n of names) console.log('  ' + cmd(n))
  console.log('\nRepeat with "preview" instead of "production" if needed.')

  console.log('\nDone. ✅')
}

main().catch((err) => {
  console.error('\n[ERROR] Stripe bootstrap failed:')
  console.error(err && err.message ? err.message : err)
  process.exit(1)
})

