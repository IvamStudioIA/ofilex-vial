'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { useRouter } from 'next/navigation';

export function ChatbotLimit() {
  const { remainingChatbotQueries, limits } = useSubscription();
  const router = useRouter();
  const remaining = remainingChatbotQueries();

  if (remaining === 'unlimited') {
    return (
      <div className="flex items-center justify-between bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500 px-4 py-2 rounded-lg mb-4">
        <span className="text-white font-medium">🤖 Chatbot ILIMITADO</span>
        <span className="text-cyan-400 text-2xl font-bold">∞</span>
      </div>
    );
  }

  const total = limits.chatbot_daily;
  const used = total - (typeof remaining === 'number' ? remaining : 0);
  const percentage = total > 0 ? (used / total) * 100 : 0;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-medium">
          🤖 Consultas hoy: {used}/{total}
        </span>
        {remaining === 0 && (
          <button
            onClick={() => router.push('/pricing')}
            className="text-cyan-400 hover:underline text-sm font-bold"
          >
            Actualizar a PRO
          </button>
        )}
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {remaining === 0 && (
        <p className="text-yellow-400 text-sm mt-2 flex items-center gap-2">
          <span>⚠️</span>
          <span>Límite alcanzado. Actualiza a PROFESIONAL para consultas ilimitadas.</span>
        </p>
      )}
    </div>
  );
}
