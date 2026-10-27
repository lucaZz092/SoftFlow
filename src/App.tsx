import React from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { NavigationSidebar } from './components/NavigationSidebar';
import { TopBar } from './components/TopBar';
import { BoardToolbar } from './components/BoardToolbar';
import { OverviewView } from './components/OverviewView';
import { TableView } from './components/TableView';
import { KanbanView } from './components/KanbanView';
import { TimelineView } from './components/TimelineView';
import { AutomationsCenter } from './components/AutomationsCenter';
import { MetricsView } from './components/MetricsView';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { IntegrationsModal } from './components/IntegrationsModal';
import { NewAutomationModal } from './components/NewAutomationModal';
import { AiSuggestionModal } from './components/AiSuggestionModal';
import { Toasts } from './components/Toasts';

const AppContent: React.FC = () => {
  const { currentView } = useProject();

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

        {/* Dynamic Views */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {currentView === 'overview' && <OverviewView />}
          {currentView === 'table' && <TableView />}
          {currentView === 'kanban' && <KanbanView />}
          {currentView === 'timeline' && <TimelineView />}
          {currentView === 'automations' && <AutomationsCenter />}
          {currentView === 'metrics' && <MetricsView />}
        </main>
      </div>

      {/* Drawers & Modals */}
      <TaskDetailDrawer />
      <IntegrationsModal />
      <NewAutomationModal />
      <AiSuggestionModal />
      <Toasts />
    </div>
  );
};

export default function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}
