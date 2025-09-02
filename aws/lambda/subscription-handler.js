const AWS = require('aws-sdk');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const dynamodb = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();

// Main handler for subscription operations
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    const { httpMethod, path, body, queryStringParameters } = event;
    const userId = event.requestContext?.authorizer?.userId; // From custom authorizer

    if (!userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Route to appropriate handler
    switch (httpMethod) {
      case 'GET':
        if (path.includes('/billing')) {
          return await handleGetBilling(userId, headers);
        } else if (path.includes('/check-limit')) {
          return await handleCheckLimit(userId, queryStringParameters, headers);
        }
        break;

      case 'POST':
        const requestBody = JSON.parse(body || '{}');
        
        if (path.includes('/create-checkout')) {
          return await handleCreateCheckout(userId, requestBody, headers);
        } else if (path.includes('/billing-portal')) {
          return await handleBillingPortal(userId, headers);
        } else if (path.includes('/check-limit')) {
          return await handleCheckLimitPost(userId, requestBody, headers);
        } else if (path.includes('/webhooks')) {
          return await handleStripeWebhook(event, headers);
        }
        break;

      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Not found' })
        };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found' })
    };

  } catch (error) {
    console.error('Lambda error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

// Get user billing data
async function handleGetBilling(userId, headers) {
  try {
    // Get user from DynamoDB
    const userResponse = await dynamodb.get({
      TableName: process.env.USERS_TABLE,
      Key: { userId }
    }).promise();

    if (!userResponse.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    const user = userResponse.Item;
    
    // Get usage data
    const usage = await getUserUsage(userId);
    
    let billingData = {
      subscription: null,
      usage,
      invoices: [],
      paymentMethod: null
    };

    // Fetch Stripe data if customer exists
    if (user.stripeCustomerId) {
      try {
        // Get subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          limit: 1
        });

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          billingData.subscription = {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            plan: getPlanFromPriceId(subscription.items.data[0]?.price?.id),
            amount: subscription.items.data[0]?.price?.unit_amount || 0,
            currency: subscription.items.data[0]?.price?.currency || 'usd',
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
          };
        }

        // Get payment methods
        const paymentMethods = await stripe.paymentMethods.list({
          customer: user.stripeCustomerId,
          type: 'card'
        });

        if (paymentMethods.data.length > 0) {
          const pm = paymentMethods.data[0];
          billingData.paymentMethod = {
            brand: pm.card?.brand || '',
            last4: pm.card?.last4 || '',
            expiryMonth: pm.card?.exp_month || 0,
            expiryYear: pm.card?.exp_year || 0
          };
        }

        // Get invoices
        const invoices = await stripe.invoices.list({
          customer: user.stripeCustomerId,
          limit: 12
        });

        billingData.invoices = invoices.data.map(invoice => ({
          id: invoice.id,
          date: new Date(invoice.created * 1000).toISOString(),
          amount: invoice.amount_paid,
          status: invoice.status || 'draft',
          downloadUrl: invoice.invoice_pdf || ''
        }));

      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(billingData)
    };

  } catch (error) {
    console.error('Get billing error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}

// Create Stripe checkout session
async function handleCreateCheckout(userId, requestBody, headers) {
  try {
    const { priceId, mode = 'subscription' } = requestBody;

    if (!priceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Price ID is required' })
      };
    }

    // Get or create Stripe customer
    let customer = await getOrCreateStripeCustomer(userId);

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode,
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      subscription_data: mode === 'subscription' ? {
        trial_period_days: 14,
        metadata: { userId }
      } : undefined,
      metadata: { userId }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url
      })
    };

  } catch (error) {
    console.error('Create checkout error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create checkout session' })
    };
  }
}

// Create billing portal session
async function handleBillingPortal(userId, headers) {
  try {
    const customer = await getOrCreateStripeCustomer(userId);

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.FRONTEND_URL}/billing`
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url })
    };

  } catch (error) {
    console.error('Billing portal error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create billing portal session' })
    };
  }
}

// Check subscription limits
async function handleCheckLimitPost(userId, requestBody, headers) {
  try {
    const { action, ...additionalData } = requestBody;

    if (!action) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Action is required' })
      };
    }

    const result = await checkSubscriptionLimit(userId, action, additionalData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Check limit error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}

// Handle Stripe webhooks
async function handleStripeWebhook(event, headers) {
  try {
    const sig = event.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
    } catch (err) {
      console.log('Webhook signature verification failed.', err.message);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    // Handle the webhook event
    switch (stripeEvent.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Webhook handler failed' })
    };
  }
}

// Helper functions
async function getUserUsage(userId) {
  try {
    // Get projects count
    const projectsResponse = await dynamodb.query({
      TableName: process.env.PROJECTS_TABLE,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      Select: 'COUNT'
    }).promise();

    // Get tasks count  
    const tasksResponse = await dynamodb.query({
      TableName: process.env.TASKS_TABLE,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      Select: 'COUNT'
    }).promise();

    // Get user data for other usage metrics
    const userResponse = await dynamodb.get({
      TableName: process.env.USERS_TABLE,
      Key: { userId }
    }).promise();

    const user = userResponse.Item || {};

    return {
      projects: projectsResponse.Count || 0,
      tasks: tasksResponse.Count || 0,
      teamMembers: user.teamMembers || 0,
      aiSuggestions: user.aiSuggestionsUsed || 0,
      storage: user.storageUsed || 0
    };

  } catch (error) {
    console.error('Error getting user usage:', error);
    return {
      projects: 0,
      tasks: 0,
      teamMembers: 0,
      aiSuggestions: 0,
      storage: 0
    };
  }
}

async function getOrCreateStripeCustomer(userId) {
  // Get user from DynamoDB
  const userResponse = await dynamodb.get({
    TableName: process.env.USERS_TABLE,
    Key: { userId }
  }).promise();

  if (!userResponse.Item) {
    throw new Error('User not found');
  }

  const user = userResponse.Item;

  // Return existing customer if available
  if (user.stripeCustomerId) {
    return await stripe.customers.retrieve(user.stripeCustomerId);
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId }
  });

  // Update user record with Stripe customer ID
  await dynamodb.update({
    TableName: process.env.USERS_TABLE,
    Key: { userId },
    UpdateExpression: 'SET stripeCustomerId = :customerId',
    ExpressionAttributeValues: {
      ':customerId': customer.id
    }
  }).promise();

  return customer;
}

async function checkSubscriptionLimit(userId, action, additionalData = {}) {
  try {
    const usage = await getUserUsage(userId);
    const plan = await getUserPlan(userId);

    const planLimits = {
      FREE: { maxProjects: 3, maxTasks: 50, maxTeamMembers: 1, maxAiSuggestions: 5 },
      PRO: { maxProjects: 50, maxTasks: 1000, maxTeamMembers: 10, maxAiSuggestions: 100 },
      BUSINESS: { maxProjects: -1, maxTasks: -1, maxTeamMembers: 50, maxAiSuggestions: 500 },
      ENTERPRISE: { maxProjects: -1, maxTasks: -1, maxTeamMembers: -1, maxAiSuggestions: -1 }
    };

    const limits = planLimits[plan] || planLimits.FREE;

    switch (action) {
      case 'create_project':
        if (limits.maxProjects !== -1 && usage.projects >= limits.maxProjects) {
          return {
            allowed: false,
            reason: `You've reached your project limit (${limits.maxProjects})`,
            upgradeRequired: getRecommendedUpgrade(plan)
          };
        }
        break;

      case 'create_task':
        if (limits.maxTasks !== -1 && usage.tasks >= limits.maxTasks) {
          return {
            allowed: false,
            reason: `You've reached your task limit (${limits.maxTasks})`,
            upgradeRequired: getRecommendedUpgrade(plan)
          };
        }
        break;

      case 'invite_member':
        if (limits.maxTeamMembers !== -1 && usage.teamMembers >= limits.maxTeamMembers) {
          return {
            allowed: false,
            reason: `You've reached your team member limit (${limits.maxTeamMembers})`,
            upgradeRequired: getRecommendedUpgrade(plan)
          };
        }
        break;

      case 'use_ai':
        if (limits.maxAiSuggestions !== -1 && usage.aiSuggestions >= limits.maxAiSuggestions) {
          return {
            allowed: false,
            reason: `You've reached your AI suggestions limit (${limits.maxAiSuggestions})`,
            upgradeRequired: getRecommendedUpgrade(plan)
          };
        }
        break;

      default:
        return { allowed: false, reason: 'Unknown action' };
    }

    return { allowed: true };

  } catch (error) {
    console.error('Error checking subscription limit:', error);
    return { allowed: false, reason: 'Internal error' };
  }
}

async function getUserPlan(userId) {
  try {
    const subscriptionResponse = await dynamodb.get({
      TableName: process.env.SUBSCRIPTIONS_TABLE,
      Key: { userId }
    }).promise();

    const subscription = subscriptionResponse.Item;
    
    if (!subscription || subscription.status !== 'active') {
      return 'FREE';
    }

    return subscription.plan;

  } catch (error) {
    console.error('Error getting user plan:', error);
    return 'FREE';
  }
}

function getPlanFromPriceId(priceId) {
  const priceIdMap = {
    [process.env.STRIPE_PRO_PRICE_ID]: 'PRO',
    [process.env.STRIPE_BUSINESS_PRICE_ID]: 'BUSINESS', 
    [process.env.STRIPE_ENTERPRISE_PRICE_ID]: 'ENTERPRISE'
  };
  
  return priceIdMap[priceId] || 'FREE';
}

function getRecommendedUpgrade(currentPlan) {
  const upgradeMap = {
    'FREE': 'PRO',
    'PRO': 'BUSINESS',
    'BUSINESS': 'ENTERPRISE'
  };
  
  return upgradeMap[currentPlan] || 'PRO';
}

// Webhook handlers
async function handleSubscriptionUpdate(subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const planName = getPlanFromPriceId(subscription.items.data[0]?.price?.id);

  await dynamodb.put({
    TableName: process.env.SUBSCRIPTIONS_TABLE,
    Item: {
      userId,
      stripeSubscriptionId: subscription.id,
      plan: planName,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      updatedAt: new Date().toISOString()
    }
  }).promise();
}

async function handleSubscriptionDeleted(subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await dynamodb.update({
    TableName: process.env.SUBSCRIPTIONS_TABLE,
    Key: { userId },
    UpdateExpression: 'SET #status = :status, cancelAtPeriodEnd = :cancel',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':status': 'canceled',
      ':cancel': false
    }
  }).promise();
}

async function handlePaymentSucceeded(invoice) {
  // Log successful payment, send confirmation email, etc.
  console.log('Payment succeeded for invoice:', invoice.id);
}

async function handlePaymentFailed(invoice) {
  // Handle failed payment, send notification, etc.
  console.log('Payment failed for invoice:', invoice.id);
}
