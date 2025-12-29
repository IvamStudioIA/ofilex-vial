'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS, PLANS_ORDER } from '@/lib/plans';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PricingPage() {
  const { user } = useAuth();
  const { plan: currentPlan, loading } = useSubscription();
  const router = useRouter();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const plan = PLANS[planId as keyof typeof PLANS];
    if (planId === 'free' || !plan.stripe_price_id) return;

    setProcessingPlan(planId);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.stripe_price_id,
          userId: user.id,
          userEmail: user.email
        })
      });

      const { url, error } = await response.json();

      if (error) {
        alert('Error: ' + error);
        setProcessingPlan(null);
        return;
      }

      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error al crear checkout');
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-white mb-4">
          Planes y Precios
        </h1>
        <p className="text-xl text-center text-gray-400 mb-12">
          Elige el plan que mejor se adapte a tus necesidades
        </p>

        <div className="grid md:grid-cols-4 gap-6">
          {PLANS_ORDER.map(planId => {
            const plan = PLANS[planId];
            const isCurrent = planId === currentPlan;
            const isPopular = 'popular' in plan && plan.popular;
            const isProcessing = processingPlan === planId;

            return (
              <div
                key={planId}
                className={`relative bg-gray-800 rounded-lg p-6 border-2 transition-transform ${
                  isPopular ? 'border-cyan-500 scale-105 shadow-2xl shadow-cyan-500/20' : 'border-gray-700'
                } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    MÁS POPULAR
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name.toUpperCase()}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 h-10">
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-cyan-400">
                      €{plan.price}
                    </span>
                    <span className="text-gray-400">/mes</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6 text-sm min-h-[300px]">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="text-gray-300 flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(planId)}
                  disabled={isCurrent || isProcessing}
                  className={`w-full py-3 rounded-lg font-bold transition transform ${
                    isCurrent
                      ? 'bg-green-600 cursor-not-allowed'
                      : isProcessing
                      ? 'bg-gray-600 cursor-wait'
                      : isPopular
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:scale-105 shadow-lg shadow-yellow-500/50'
                      : planId === 'unidad'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:bg-purple-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  } text-white`}
                >
                  {isProcessing
                    ? 'Procesando...'
                    : isCurrent
                    ? 'Plan Actual'
                    : planId === 'free'
                    ? 'Gratis'
                    : planId === 'profesional'
                    ? 'Comenzar Ahora'
                    : planId === 'unidad'
                    ? 'Contactar'
                    : 'Seleccionar'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center text-gray-400">
          <p className="mb-4">💳 Aceaptamos todas las tarjetas principales</p>
          <p className="text-sm">🔒 Pagos seguros procesados por Stripe</p>
          <p className="text-sm mt-2">Cancela en cualquier momento, sin compromiso</p>
        </div>
      </div>
    </div>
  );
}
