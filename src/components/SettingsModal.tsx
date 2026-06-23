import { useState } from "react";
import { X, Save, Info } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SettingsModal({ open, onClose }: Props) {
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-800 dark:text-white">Configurações</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-xl p-4 mb-5 flex gap-3">
          <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1.5">
            <p className="font-semibold">Como configurar a API do Zabbix</p>
            <p>As credenciais do Zabbix devem ser configuradas como <strong>secrets</strong> na Edge Function do Supabase:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><code className="bg-blue-100 dark:bg-blue-800/50 px-1 rounded">ZABBIX_API_URL</code> — URL da API JSON-RPC</li>
              <li><code className="bg-blue-100 dark:bg-blue-800/50 px-1 rounded">ZABBIX_API_TOKEN</code> — Token de autenticação</li>
            </ul>
            <p className="mt-1">Exemplo de URL: <code className="bg-blue-100 dark:bg-blue-800/50 px-1 rounded">https://seu-zabbix.com/api_jsonrpc.php</code></p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Auto-refresh interval
            </label>
            <select className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="30">30 segundos</option>
              <option value="60">1 minuto</option>
              <option value="120">2 minutos</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={() => { setSaved(true); setTimeout(() => { setSaved(false); onClose(); }, 800); }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <Save size={14} />
            {saved ? "Salvo!" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
