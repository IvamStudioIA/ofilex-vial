'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { PLANS } from '@/lib/plans';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface LockedFeatureProps {
  feature: string;
  requiredPlan: 'agente' | 'profesional' | 'unidad';
  children: ReactNode;
  title?: string;
  description?: string;
}

export function LockedFeature({
  feature,
  requiredPlan,
  children,
  title,
  description
}: LockedFeatureProps) {
  const { canUseFeature } = useSubscription();
  const router = useRouter();
  
  if (canUseFeature(feature)) {
    return <>{children}</>;
  }

  const planInfo = PLANS[requiredPlan];

  return (
    <div className="relative min-h-[400px]">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm rounded-lg border border-cyan-500 p-8">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-2xl font-bold text-white mb-2">
          {title || 'Función Premium'}
        </h3>
        <p className="text-gray-300 mb-4 text-center max-w-md">
          {description || `Disponible en plan ${planInfo.name}`}
        </p>
        <p className="text-cyan-400 text-xl font-bold mb-6">
          Desde €{planInfo.price}/mes
        </p>
        <button
          onClick={() => router.push('/pricing')}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:scale-105 transition transform"
        >
          Desbloquear Ahora
        </button>
      </div>
      <div className="blur-md pointer-events-none select-none opacity-50">
        {children}
      </div>
    </div>
  );
}
