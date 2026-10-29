import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { BillingProvider } from './context/BillingContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessDenied, LoginScreen } from './components/LoginScreen';
import { NavigationSidebar } from './components/NavigationSidebar';
import { TopBar } from './components/TopBar';
import { BoardToolbar } from './components/BoardToolbar';
import { OverviewView } from './components/OverviewView';
import { CommandPalette } from './components/CommandPalette';
import { Toasts } from './components/Toasts';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { AutomationEngine } from './components/AutomationEngine';

// Views and heavy dialogs load on demand, keeping the first load small
const named = <T extends Record<string, React.ComponentType>>(loader: () => Promise<T>, name: keyof T) =>
  lazy(() => loader().then((m) => ({ default: m[name] })));

const TableView = named(() => import('./components/TableView'), 'TableView');
const KanbanView = named(() => import('./components/KanbanView'), 'KanbanView');
const TimelineView = named(() => import('./components/TimelineView'), 'TimelineView');
const AutomationsCenter = named(() => import('./components/AutomationsCenter'), 'AutomationsCenter');
const MetricsView = named(() => import('./components/MetricsView'), 'MetricsView');
const GithubView = named(() => import('./components/GithubView'), 'GithubView');
const BillingView = named(() => import('./components/billing/BillingView'), 'BillingView');
const ArchiveView = named(() => import('./components/ArchiveView'), 'ArchiveView');
const TaskDetailDrawer = named(() => import('./components/TaskDetailDrawer'), 'TaskDetailDrawer');
const IntegrationsModal = named(() => import('./components/IntegrationsModal'), 'IntegrationsModal');

const FullScreenLoader: React.FC = () => (
  <div className="h-screen flex items-center justify-center bg-[var(--bg-canvas)] text-[var(--text-muted)]">
    <Loader2 className="w-5 h-5 animate-spin" />
  </div>
);

const ViewLoader: React.FC = () => (
  <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]">
    <Loader2 className="w-5 h-5 animate-spin" />
  </div>
);

/** Asks before completing a task whose blockers aren't done yet */
const BlockerConfirm: React.FC = () => {
  const { pendingStatusChange, confirmPendingStatusChange, cancelPendingStatusChange } = useProject();
  const names = pendingStatusChange?.blockers.map((b) => `"${b.title}"`).join(', ');
  return (
    <ConfirmDialog
      isOpen={Boolean(pendingStatusChange)}
      onClose={cancelPendingStatusChange}
      onConfirm={confirmPendingStatusChange}
      title="Demanda bloqueada"
      description={`Ainda não concluída(s): ${names}. Concluir mesmo assim?`}
      confirmText="Concluir mesmo assim"
      variant="primary"
    />
  );
};

const AppContent: React.FC = () => {
  const { currentView, isDataLoaded, syncError, selectedTaskId, isIntegrationsOpen } = useProject();

  if (!isDataLoaded) return <FullScreenLoader />;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans transition-colors duration-150">
      {/* Left Navigation */}
      <NavigationSidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Page header */}
        <TopBar />

        {/* Toolbar (Filters, search, New Task button) - visible in table, kanban, timeline */}
        {(currentView === 'table' || currentView === 'kanban' || currentView === 'timeline') && (
          <BoardToolbar />
        )}

        {syncError && (
          <div className="px-4 sm:px-6 py-2 text-xs text-rose-500 border-b border-[var(--border-subtle)]">
            Erro ao sincronizar com o banco: {syncError}
          </div>
        )}

        {/* Dynamic Views */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <Suspense fallback={<ViewLoader />}>
            {currentView === 'overview' && <OverviewView />}
            {currentView === 'table' && <TableView />}
            {currentView === 'kanban' && <KanbanView />}
            {currentView === 'timeline' && <TimelineView />}
            {currentView === 'github' && <GithubView />}
            {currentView === 'billing' && <BillingView />}
            {currentView === 'archive' && <ArchiveView />}
            {currentView === 'automations' && <AutomationsCenter />}
            {currentView === 'metrics' && <MetricsView />}
          </Suspense>
        </main>
      </div>

      {/* Drawers & Modals (only mounted, and therefore only loaded, when open) */}
      <Suspense fallback={null}>
        {selectedTaskId && <TaskDetailDrawer />}
        {isIntegrationsOpen && <IntegrationsModal />}
      </Suspense>
      <AutomationEngine />
      <CommandPalette />
      <BlockerConfirm />
      <Toasts />
    </div>
  );
};

const AuthGate: React.FC = () => {
  const { user, isMember, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <LoginScreen />;
  if (isMember === null) return <FullScreenLoader />;
  if (!isMember) return <AccessDenied />;
  return (
    <ProjectProvider>
      <BillingProvider>
        <AppContent />
      </BillingProvider>
    </ProjectProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
