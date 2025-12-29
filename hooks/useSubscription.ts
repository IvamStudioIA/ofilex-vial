/**
 * OFILEX VIAL - HOOK DE SUSCRIPCIÓN
 * Hook para gestionar el estado de suscripción y límites del usuario
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PLANS, PlanId, planHasFeature, getChatbotLimit } from '@/lib/plans';
import { useAuth } from './useAuth';

const supabase = createClient();

interface SubscriptionState {
  plan: PlanId;
  status: string;
  limits: typeof PLANS.free.limits;
  usage: {
    chatbot_queries: number;
    atestados_created: number;
  };
  loading: boolean;
  error: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;

  // Métodos de utilidad
  canUseFeature: (feature: string) => boolean;
  canQueryChatbot: () => boolean;
  remainingChatbotQueries: () => number | 'unlimited';
  incrementChatbotUsage: () => Promise<number>;
  incrementAtestadosUsage: () => Promise<number>;
  refresh: () => Promise<void>;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanId>('free');
  const [status, setStatus] = useState('active');
  const [usage, setUsage] = useState({ chatbot_queries: 0, atestados_created: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<Date | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);

  // Función para cargar datos de suscripción
  const fetchSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);

      // Obtener suscripción del usuario
      const { data: subscription, error: subError } = await supabase
        .rpc('get_user_subscription', { p_user_id: user.id })
        .single();

      if (subError) {
        console.error('Error fetching subscription:', subError);
        setError('Error al cargar suscripción');
      } else if (subscription && subscription.status === 'active') {
        setPlan(subscription.plan as PlanId);
        setStatus(subscription.status);
        setCurrentPeriodEnd(subscription.current_period_end ? new Date(subscription.current_period_end) : null);
        setCancelAtPeriodEnd(subscription.cancel_at_period_end || false);
      }

      // Obtener uso diario
      const { data: dailyUsage, error: usageError } = await supabase
        .rpc('get_daily_usage', { p_user_id: user.id });

      if (usageError) {
        console.error('Error fetching usage:', usageError);
      } else if (dailyUsage && dailyUsage.length > 0) {
        setUsage({
          chatbot_queries: dailyUsage[0].chatbot_queries || 0,
          atestados_created: dailyUsage[0].atestados_created || 0
        });
      } else {
        setUsage({ chatbot_queries: 0, atestados_created: 0 });
      }

      setLoading(false);
    } catch (err) {
      console.error('Unexpected error in fetchSubscription:', err);
      setError('Error inesperado al cargar datos');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  // Límites del plan actual
  const limits = PLANS[plan].limits;

  // Verificar si puede usar una característica
  const canUseFeature = (feature: string): boolean => {
    return planHasFeature(plan, feature as any);
  };

  // Verificar si puede hacer consultas al chatbot
  const canQueryChatbot = (): boolean => {
    const limit = getChatbotLimit(plan);

    if (limit === 'unlimited') return true;
    if (limit === 0) return false;

    return usage.chatbot_queries < limit;
  };

  // Obtener consultas restantes
  const remainingChatbotQueries = (): number | 'unlimited' => {
    const limit = getChatbotLimit(plan);

    if (limit === 'unlimited') return 'unlimited';

    return Math.max(0, limit - usage.chatbot_queries);
  };

  // Incrementar uso del chatbot
  const incrementChatbotUsage = async (): Promise<number> => {
    if (!user) throw new Error('No user logged in');

    try {
      const { data, error } = await supabase
        .rpc('increment_chatbot_usage', { p_user_id: user.id });

      if (error) throw error;

      const newCount = data as number;
      setUsage(prev => ({ ...prev, chatbot_queries: newCount }));

      return newCount;
    } catch (err) {
      console.error('Error incrementing chatbot usage:', err);
      throw err;
    }
  };

  // Incrementar atestados creados
  const incrementAtestadosUsage = async (): Promise<number> => {
    if (!user) throw new Error('No user logged in');

    try {
      const { data, error } = await supabase
        .rpc('increment_atestados_usage', { p_user_id: user.id });

      if (error) throw error;

      const newCount = data as number;
      setUsage(prev => ({ ...prev, atestados_created: newCount }));

      return newCount;
    } catch (err) {
      console.error('Error incrementing atestados usage:', err);
      throw err;
    }
  };

  // Refrescar datos
  const refresh = async () => {
    setLoading(true);
    await fetchSubscription();
  };

  return {
    plan,
    status,
    limits,
    usage,
    loading,
    error,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    canUseFeature,
    canQueryChatbot,
    remainingChatbotQueries,
    incrementChatbotUsage,
    incrementAtestadosUsage,
    refresh
  };
}
