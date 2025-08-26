export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: 'active' | 'paused' | 'completed';
  tags: string[];
  lastContact: string;
  starred: boolean;
  coachingProgram: string;
  startDate: string;
  sessionsCompleted: number;
  totalSessions: number;
  nextSession?: string;
  goals: string[];
  progress: string;
  value: number;
  assignedCoachId: number;
  billing: {
    hourlyRate: number;
    packagePrice?: number;
    paymentMethod: 'monthly' | 'per_session' | 'package';
    invoices: Invoice[];
    totalPaid: number;
    totalDue: number;
  };
}

export interface Invoice {
  id: number;
  clientId: number;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  notes?: string;
}

export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}