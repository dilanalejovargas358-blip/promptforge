import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

// ✅ Versión de API corregida
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-08-26.dahlia',
});

export async function POST(req: Request) {
  try {
    console.log('📥 Webhook recibido');
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('📦 Evento:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        
        if (userId) {
          console.log('✅ Activando Premium para usuario:', userId);
          const premiumUntil = new Date();
          premiumUntil.setDate(premiumUntil.getDate() + 30);

          await prisma.user.update({
            where: { id: userId },
            data: {
              isPremium: true,
              premiumUntil,
              credits: { increment: 500 },
            },
          });

          await prisma.transaction.create({
            data: {
              userId,
              type: 'PREMIUM',
              amount: 500,
              description: 'Suscripción Premium activada',
            },
          });
          console.log('✅ Premium activado exitosamente');
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // ✅ Corrección: usar "as any" para acceder a subscription
        const subscriptionId = (invoice as any).subscription as string;
        
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.userId;
          
          if (userId) {
            console.log('🔄 Renovando Premium para usuario:', userId);
            const premiumUntil = new Date();
            premiumUntil.setDate(premiumUntil.getDate() + 30);

            await prisma.user.update({
              where: { id: userId },
              data: { premiumUntil },
            });
            console.log('✅ Premium renovado exitosamente');
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (userId) {
          console.log('❌ Cancelando Premium para usuario:', userId);
          await prisma.user.update({
            where: { id: userId },
            data: { isPremium: false },
          });
          console.log('✅ Premium cancelado exitosamente');
        }
        break;
      }

      default:
        console.log(`⚠️ Evento no manejado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}