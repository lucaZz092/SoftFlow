import React, { useState } from 'react';
import {
  X,
  GitBranch,
  Bot,
  Zap,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export const IntegrationsModal: React.FC = () => {
  const { isIntegrationsOpen, setIsIntegrationsOpen, simulateGitHubEvent } = useProject();
  const [activeTab, setActiveTab] = useState<'github' | 'claude' | 'codex'>('github');
  const [githubRepo, setGithubRepo] = useState('preventsenior/soft-solutions-core');
  const [webhookSecret, setWebhookSecret] = useState('whsec_99a8b7c6d5e4f3a2b1c0d9e8');
  const [claudeModel, setClaudeModel] = useState('claude-3-5-sonnet');
  const [codexFramework, setCodexFramework] = useState('vitest');

  if (!isIntegrationsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs select-none p-4">
      <div className="w-full max-w-xl bg-[#161922] border border-[#242936] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#212633] bg-[#141720] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <GitBranch className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Configurações de Integração</h2>
              <p className="text-[11px] text-slate-400">GitHub Webhooks, Claude 3.5 Sonnet &amp; Codex Engine</p>
            </div>
          </div>

          <button
            onClick={() => setIsIntegrationsOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1e2330] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selectors */}
        <div className="flex border-b border-[#212633] bg-[#141720] px-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'github'
                ? 'border-purple-500 text-purple-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-purple-400" />
            <span>GitHub Webhooks</span>
          </button>

          <button
            onClick={() => setActiveTab('claude')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'claude'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>Claude (Refinamento)</span>
          </button>

          <button
            onClick={() => setActiveTab('codex')}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'codex'
                ? 'border-amber-500 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Codex (Testes)</span>
          </button>
        </div>

        {/* Tab Bodies */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: GitHub */}
          {activeTab === 'github' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#181b24] border border-purple-500/30">
                <div>
                  <div className="font-semibold text-white">Status da Conexão: Conectado</div>
                  <div className="text-[11px] text-slate-400">Escutando eventos de pull request e push</div>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase">
                  ATIVO
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Repositório Vinculado:</label>
                  <input
                    type="text"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    className="w-full bg-[#1b1f2b] text-slate-200 px-3 py-1.5 rounded border border-[#272e3d] outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Webhook Secret (HMAC SHA-256):</label>
                  <input
                    type="password"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    className="w-full bg-[#1b1f2b] text-slate-200 px-3 py-1.5 rounded border border-[#272e3d] outline-none font-mono text-xs"
                  />
                </div>

                <div className="p-3 rounded-lg bg-[#181b24] border border-[#232835] space-y-2">
                  <div className="text-[11px] font-semibold text-slate-300">Gatilhos de Teste:</div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        simulateGitHubEvent('PR_MERGED');
                        setIsIntegrationsOpen(false);
                      }}
                      className="px-3 py-1 rounded bg-[#202533] hover:bg-[#272e3e] text-purple-300 font-medium transition-colors cursor-pointer"
                    >
                      Disparar PR Merged
                    </button>
                    <button
                      onClick={() => {
                        simulateGitHubEvent('PR_OPENED');
                        setIsIntegrationsOpen(false);
                      }}
                      className="px-3 py-1 rounded bg-[#202533] hover:bg-[#272e3e] text-emerald-300 font-medium transition-colors cursor-pointer"
                    >
                      Disparar Novo PR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Claude */}
          {activeTab === 'claude' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#181b24] border border-indigo-500/30">
                <div>
                  <div className="font-semibold text-white">Claude 3.5 Sonnet Configurado</div>
                  <div className="text-[11px] text-slate-400">Geração de critérios de aceite e refinamento de histórias</div>
                </div>
                <span className="text-[10px] text-indigo-400 font-bold uppercase">
                  PRONTO
                </span>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Modelo Selecionado:</label>
                <select
                  value={claudeModel}
                  onChange={(e) => setClaudeModel(e.target.value)}
                  className="w-full bg-[#1b1f2b] text-slate-200 px-3 py-1.5 rounded border border-[#272e3d] outline-none text-xs cursor-pointer"
                >
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Padrão para Engenharia)</option>
                  <option value="claude-3-haiku">Claude 3.5 Haiku (Respostas Rápidas)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: Codex */}
          {activeTab === 'codex' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#181b24] border border-amber-500/30">
                <div>
                  <div className="font-semibold text-white">Codex Test Runner</div>
                  <div className="text-[11px] text-slate-400">Geração automática de suítes de testes unitários</div>
                </div>
                <span className="text-[10px] text-amber-400 font-bold uppercase">
                  PRONTO
                </span>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Framework de Teste:</label>
                <select
                  value={codexFramework}
                  onChange={(e) => setCodexFramework(e.target.value)}
                  className="w-full bg-[#1b1f2b] text-slate-200 px-3 py-1.5 rounded border border-[#272e3d] outline-none text-xs cursor-pointer"
                >
                  <option value="vitest">Vitest / Testing Library</option>
                  <option value="jest">Jest</option>
                  <option value="playwright">Playwright</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#212633] bg-[#141720] flex items-center justify-end">
          <button
            onClick={() => setIsIntegrationsOpen(false)}
            className="px-3.5 py-1.5 rounded bg-[#0073ea] hover:bg-[#0062c7] text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
