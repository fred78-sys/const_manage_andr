export type UserRole = 'admin' | 'pm' | 'supervisor' | 'client';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  assignedProjectIds: string[];
  avatarUrl?: string;
  companyTitle?: string;
  ncaRegNo?: string;
}

export type ProjectStatus = 'planning' | 'active' | 'delayed' | 'completed' | 'on_hold';

export interface BudgetCategoryBreakdown {
  labor: number;
  materials: number;
  equipment: number;
  other: number;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  clientName: string;
  clientEmail: string;
  address: string;
  county: string; // e.g. Nairobi, Kiambu, Mombasa, Nakuru
  subCounty?: string; // e.g. Westlands, Kilimani, Ruiru, Nyali, Karen
  lrNumber?: string; // Land Reference Number e.g. LR No. 209/18942/2
  ncaProjectNumber?: string; // National Construction Authority Project Registration No.
  ncaCategory?: string; // e.g. NCA 1 - Building Works
  nemaLicenseNumber?: string; // NEMA EIA License No.
  countyPermitNumber?: string; // Nairobi City County / Kiambu County Building Permit No.
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  budgetTotal: number; // in KES (Kenyan Shillings)
  budgetCategories: BudgetCategoryBreakdown;
  percentComplete: number;
  pmId?: string;
  pmName: string;
  supervisorId?: string;
  supervisorName: string;
  description: string;
  coverImage?: string;
  createdAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  description: string;
  trade: string; // Kenyan Trades: Masonry (Mawe), Steel Fixers (Nondo), Carpenters/Shuttering (Mbao), Plumber, Electrician (Stima), Plaster/Screed, Painter, Casuals (Vibarua)
  priority: TaskPriority;
  status: TaskStatus;
  assigneeName: string;
  assigneeRole?: string;
  dueDate: string;
  blockReason?: string;
  checklist?: TaskChecklistItem[];
  createdAt: string;
}

export interface DailyLogWeather {
  condition: string; // Sunny & Clear (Kiangazi), Scattered Rains (Masika), Heavy Downpour, Overcast & Dusty
  tempC: number; // In Celsius (°C)
  notes: string;
}

export interface CrewTradeCount {
  trade: string;
  count: number;
}

export interface DailyLogPhoto {
  id: string;
  url: string;
  storagePath?: string;
  caption: string;
  tradeTag?: string;
  timestamp?: string;
}

export type IssueSeverity = 'none' | 'minor' | 'moderate' | 'critical';

export interface DailyLog {
  id: string;
  projectId: string;
  projectName?: string;
  date: string;
  weather: DailyLogWeather;
  crew: {
    total: number;
    breakdown: CrewTradeCount[];
  };
  materialDeliveries?: string; // e.g., "500 bags Bamburi Tembo Cement, 2 tippers River Sand, 3 tonnes Devki Y16 Steel"
  workDone: string;
  issues?: string;
  issueSeverity: IssueSeverity;
  photos: DailyLogPhoto[];
  supervisorName: string;
  createdAt: string;
}

export type ExpenseCategory = 'labor' | 'materials' | 'equipment' | 'statutory' | 'other';
export type PaymentMethod = 'mpesa' | 'bank_transfer' | 'cheque' | 'petty_cash';

export interface Expense {
  id: string;
  projectId: string;
  projectName?: string;
  date: string;
  category: ExpenseCategory;
  vendor: string; // Kenyan suppliers e.g. Bamburi Cement, Devki Steel, MRM, Crown Paints, Local Casual Payroll
  amount: number; // in KES
  paymentMethod?: PaymentMethod;
  mpesaRef?: string; // M-Pesa Transaction code e.g. QKH719X9P2
  invoiceNumber?: string; // ETR Invoice / BQ Certificate / Voucher No.
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export type DocumentCategory = 'nca_nema' | 'county_permit' | 'structural_arch' | 'bq_financial' | 'contracts_safety' | 'other';

export interface ProjectDocument {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  category: DocumentCategory;
  fileUrl: string;
  storagePath?: string;
  fileName: string;
  fileSize: string;
  version: string;
  uploadDate: string;
  uploadedBy: string;
  notes?: string;
}

export interface ActivityItem {
  id: string;
  projectId: string;
  projectName: string;
  timestamp: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
}
