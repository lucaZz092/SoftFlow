import React, { createContext, useContext } from 'react';
import { BillingProject, Client, Invoice, InvoiceItem, InvoiceStatus } from '../types';
import { useSyncedCollection } from '../lib/useSyncedCollection';
import { linkInvoiceSources, nextInvoiceNumber } from '../lib/billing';
import { localDate } from '../lib/dates';
import { useProject } from './ProjectContext';

interface NewInvoice {
  clientId: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes?: string;
  status?: InvoiceStatus;
}

interface BillingContextType {
  clients: Client[];
  projects: BillingProject[];
  invoices: Invoice[];
  isLoaded: boolean;
  error: string | null;

  addClient: (data: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => boolean;

  addProject: (data: Omit<BillingProject, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<BillingProject>) => void;
  deleteProject: (id: string) => boolean;

  createInvoice: (data: NewInvoice) => Invoice;
  setInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  deleteInvoice: (id: string) => void;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

const byCreatedDesc = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);
const byName = (a: Client, b: Client) => a.name.localeCompare(b.name, 'pt-BR');

export const BillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { allTasks, saveTasks } = useProject();

  const clientsSync = useSyncedCollection<Client>('clients', { enabled: true, sort: byName });
  const projectsSync = useSyncedCollection<BillingProject>('billing_projects', { enabled: true, sort: byCreatedDesc });
  const invoicesSync = useSyncedCollection<Invoice>('invoices', { enabled: true, sort: byCreatedDesc });

  const { items: clients, setItems: setClients } = clientsSync;
  const { items: projects, setItems: setProjects } = projectsSync;
  const { items: invoices, setItems: setInvoices } = invoicesSync;

  const now = () => new Date().toISOString();

  const addClient = (data: Omit<Client, 'id' | 'createdAt'>) =>
    void setClients((prev) => [...prev, { ...data, id: 'client-' + Date.now(), createdAt: now() }].sort(byName));

  const updateClient = (id: string, updates: Partial<Client>) =>
    void setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));

  /** Refuses (returns false) while invoices or projects still reference the client */
  const deleteClient = (id: string) => {
    if (invoices.some((i) => i.clientId === id) || projects.some((p) => p.clientId === id)) return false;
    void setClients((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  const addProject = (data: Omit<BillingProject, 'id' | 'createdAt'>) =>
    void setProjects((prev) => [{ ...data, id: 'proj-' + Date.now(), createdAt: now() }, ...prev]);

  const updateProject = (id: string, updates: Partial<BillingProject>) =>
    void setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));

  /** Refuses (returns false) when a milestone has already been invoiced */
  const deleteProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project?.milestones.some((m) => m.invoiceId)) return false;
    void setProjects((prev) => prev.filter((p) => p.id !== id));
    return true;
  };

  /** Marks (or releases) the time entries and milestones an invoice bills */
  const linkSources = (items: InvoiceItem[], invoiceId: string | undefined) => {
    const { changedTasks, changedProjects } = linkInvoiceSources(items, invoiceId, allTasks, projects);
    if (changedTasks.length > 0) void saveTasks(changedTasks);
    if (changedProjects.length > 0) {
      const byId = new Map(changedProjects.map((p) => [p.id, p]));
      void setProjects((prev) => prev.map((p) => byId.get(p.id) ?? p));
    }
  };

  const createInvoice = (data: NewInvoice): Invoice => {
    const invoice: Invoice = {
      id: 'inv-' + Date.now(),
      number: nextInvoiceNumber(invoices, Number(data.issueDate.slice(0, 4))),
      clientId: data.clientId,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      status: data.status ?? 'draft',
      items: data.items,
      notes: data.notes,
      paidAt: data.status === 'paid' ? localDate() : undefined,
      createdAt: now(),
    };
    void setInvoices((prev) => [invoice, ...prev]);
    linkSources(invoice.items, invoice.id);
    return invoice;
  };

  const setInvoiceStatus = (id: string, status: InvoiceStatus) => {
    const invoice = invoices.find((i) => i.id === id);
    // Cancelled is final: its hours may already be on another invoice, so reopening could bill them twice
    if (!invoice || invoice.status === status || invoice.status === 'cancelled') return;
    void setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status, paidAt: status === 'paid' ? localDate() : undefined } : i))
    );
    // A cancelled invoice gives its hours and milestones back so they can be billed again
    if (status === 'cancelled') linkSources(invoice.items, undefined);
  };

  const deleteInvoice = (id: string) => {
    const invoice = invoices.find((i) => i.id === id);
    if (!invoice) return;
    void setInvoices((prev) => prev.filter((i) => i.id !== id));
    if (invoice.status !== 'cancelled') linkSources(invoice.items, undefined);
  };

  return (
    <BillingContext.Provider
      value={{
        clients,
        projects,
        invoices,
        isLoaded: clientsSync.loaded && projectsSync.loaded && invoicesSync.loaded,
        error: clientsSync.error || projectsSync.error || invoicesSync.error,
        addClient,
        updateClient,
        deleteClient,
        addProject,
        updateProject,
        deleteProject,
        createInvoice,
        setInvoiceStatus,
        deleteInvoice,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) throw new Error('useBilling must be used within a BillingProvider');
  return context;
};
