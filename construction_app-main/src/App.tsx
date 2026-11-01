import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { AppProvider, useApp } from './lib/context';
import { Navbar } from './components/Navbar';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProjectsView } from './components/ProjectsView';
import { TasksView } from './components/TasksView';
import { DailyLogsView } from './components/DailyLogsView';
import { BudgetView } from './components/BudgetView';
import { DocumentsView } from './components/DocumentsView';
import { TeamView } from './components/TeamView';
import { ClientPortalView } from './components/ClientPortalView';

// Modals
import { NewDailyLogModal } from './components/modals/NewDailyLogModal';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { NewTaskModal } from './components/modals/NewTaskModal';
import { NewExpenseModal } from './components/modals/NewExpenseModal';
import { NewDocumentModal } from './components/modals/NewDocumentModal';

function MainApp() {
  const { currentUser } = useApp();

  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals state
  const [isNewLogModalOpen, setIsNewLogModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser.role === 'client') {
      setCurrentTab('client-portal');
    } else if (currentTab === 'client-portal') {
      setCurrentTab('dashboard');
    }
  }, [currentUser.role, currentTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        onOpenMobileMenu={() => setIsSidebarOpen(true)}
        onOpenNewLogModal={() => setIsNewLogModalOpen(true)}
        onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
        onOpenNewExpenseModal={() => setIsNewExpenseModalOpen(true)}
        onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenNewLogModal={() => setIsNewLogModalOpen(true)}
              onOpenNewExpenseModal={() => setIsNewExpenseModalOpen(true)}
              onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
              onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsView
              onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
              onOpenNewLogModal={() => setIsNewLogModalOpen(true)}
              onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
              onOpenNewExpenseModal={() => setIsNewExpenseModalOpen(true)}
            />
          )}

          {currentTab === 'tasks' && (
            <TasksView onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)} />
          )}

          {currentTab === 'daily-logs' && (
            <DailyLogsView onOpenNewLogModal={() => setIsNewLogModalOpen(true)} />
          )}

          {currentTab === 'budget' && (
            <BudgetView onOpenNewExpenseModal={() => setIsNewExpenseModalOpen(true)} />
          )}

          {currentTab === 'documents' && (
            <DocumentsView onOpenNewDocModal={() => setIsNewDocModalOpen(true)} />
          )}

          {currentTab === 'team' && <TeamView />}

          {currentTab === 'client-portal' && <ClientPortalView />}
        </main>
      </div>

      {/* Modals */}
      <NewDailyLogModal
        isOpen={isNewLogModalOpen}
        onClose={() => setIsNewLogModalOpen(false)}
      />
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
      />
      <NewExpenseModal
        isOpen={isNewExpenseModalOpen}
        onClose={() => setIsNewExpenseModalOpen(false)}
      />
      <NewDocumentModal
        isOpen={isNewDocModalOpen}
        onClose={() => setIsNewDocModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppGate />
    </AppProvider>
  );
}

function AppGate() {
  const { authLoading, currentUser } = useApp();
  if (authLoading) return <div className="min-h-screen bg-slate-950 text-slate-300 grid place-items-center">Connecting to SiteFlow…</div>;
  if (!currentUser?.uid) return <AuthScreen />;
  return <MainApp />;
}
