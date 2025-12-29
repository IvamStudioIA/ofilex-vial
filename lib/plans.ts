/**
 * OFILEX VIAL - PLANES DE SUSCRIPCIÓN
 * Configuración de todos los planes disponibles y sus límites
 */

export const PLANS = {
  free: {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    description: 'Para conocer la plataforma',
    limits: {
      chatbot_daily: 0,
      normativa: [] as string[],
      jurisprudencia: false,
      casos_practicos: false,
      cuestionarios: false,
      generador_atestados: false,
      alertas_normativas: false,
      offline: false,
      team_features: false
    },
    features: [
      'Consulta básica de normativas',
      'Acceso limitado a la app',
      'Soporte por email'
    ]
  },
  agente: {
    id: 'agente',
    name: 'Agente',
    price: 4.99,
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENTE || 'price_AGENTE_MONTHLY',
    description: 'Para agentes en formación',
    limits: {
      chatbot_daily: 5,
      normativa: ['cpdcsv', 'lsv_basico', 'rgc_basico'],
      jurisprudencia: false,
      casos_practicos: false,
      cuestionarios: false,
      generador_atestados: false,
      alertas_normativas: false,
      offline: 'cp_only',
      team_features: false
    },
    features: [
      '✓ Código Penal arts. 379-385',
      '✓ LSV y RGC consulta básica',
      '✓ Chatbot: 5 consultas/día',
      '✓ Modo offline (CP)',
      '✓ Soporte por email'
    ]
  },
  profesional: {
    id: 'profesional',
    name: 'Profesional',
    price: 9.99,
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFESIONAL || 'price_PROFESIONAL_MONTHLY',
    description: 'El más completo para profesionales',
    popular: true,
    limits: {
      chatbot_daily: -1, // ilimitado
      normativa: 'all',
      jurisprudencia: true,
      casos_practicos: true,
      cuestionarios: true,
      generador_atestados: true,
      alertas_normativas: true,
      offline: 'full',
      team_features: false
    },
    features: [
      '✓ Todo en Agente',
      '✓ Chatbot ILIMITADO (LEXVIAL, IURISVIAL, VIALTECH)',
      '✓ Normativa completa interconectada',
      '✓ Jurisprudencia 50,000+ sentencias',
      '✓ Casos prácticos',
      '✓ Cuestionario Práctico',
      '✓ Generador borradores de atestado',
      '✓ Duplicar borradores',
      '✓ Alertas normativas',
      '✓ Modo offline completo',
      '✓ Soporte prioritario 24/7'
    ]
  },
  unidad: {
    id: 'unidad',
    name: 'Unidad',
    price: 99.99,
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_UNIDAD || 'price_UNIDAD_MONTHLY',
    description: 'Para equipos de tráfico completos',
    limits: {
      chatbot_daily: -1,
      normativa: 'all',
      jurisprudencia: true,
      casos_practicos: true,
      cuestionarios: true,
      generador_atestados: true,
      alertas_normativas: true,
      offline: 'full',
      team_features: true,
      max_team_members: 20,
      shared_atestados: true,
      team_stats: true,
      export_reports: true
    },
    features: [
      '✓ Todo en Profesional',
      '✓ Hasta 20 usuarios',
      '✓ Panel administración',
      '✓ Estadísticas del equipo',
      '✓ Borradores compartidos',
      '✓ Plantillas de equipo',
      '✓ Duplicar borradores',
      '✓ Soporte personalizado por email'
    ]
  }
} as const;

export type PlanId = keyof typeof PLANS;
export type PlanConfig = typeof PLANS[PlanId];

/**
 * Obtiene la configuración de un plan por su ID
 */
export function getPlan(planId: PlanId): PlanConfig {
  return PLANS[planId];
}

/**
 * Verifica si un plan incluye una característica específica
 */
export function planHasFeature(planId: PlanId, feature: keyof PlanConfig['limits']): boolean {
  const plan = getPlan(planId);
  const value = plan.limits[feature];

  return value === true || value === 'all' || value === 'full' || (typeof value === 'number' && value > 0);
}

/**
 * Obtiene el límite diario de chatbot para un plan
 */
export function getChatbotLimit(planId: PlanId): number | 'unlimited' {
  const limit = getPlan(planId).limits.chatbot_daily;
  return limit === -1 ? 'unlimited' : limit;
}

/**
 * Lista de todos los planes ordenados por precio
 */
export const PLANS_ORDER: PlanId[] = ['free', 'agente', 'profesional', 'unidad'];

/**
 * Mapa de Price ID de Stripe a Plan ID
 */
export const STRIPE_PRICE_TO_PLAN: Record<string, PlanId> = {
  [PLANS.agente.stripe_price_id]: 'agente',
  [PLANS.profesional.stripe_price_id]: 'profesional',
  [PLANS.unidad.stripe_price_id]: 'unidad',
};
