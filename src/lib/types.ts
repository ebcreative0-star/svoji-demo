// Databázové typy

export interface Couple {
  id: string;
  partner1_name: string;
  partner2_name: string;
  wedding_date: string | null;
  wedding_size: 'small' | 'medium' | 'large' | null;
  budget_total: number | null;
  onboarding_completed: boolean;
  created_at: string;
}

export interface ChecklistItemDB {
  id: string;
  couple_id: string;
  title: string;
  description: string | null;
  category: string;
  due_date: string;
  priority: string;
  completed: boolean;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
}

export interface BudgetItem {
  id: string;
  couple_id: string;
  category: string;
  name: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  paid: boolean;
  vendor_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface Guest {
  id: string;
  couple_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  group_name: string | null;
  plus_one: boolean;
  dietary_requirements: string | null;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  rsvp_date: string | null;
  table_assignment: string | null;
  notes: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  couple_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  city: string;
  region: string | null;
  description: string | null;
  price_range: 'budget' | 'mid' | 'premium' | null;
  website: string | null;
  instagram: string | null;
  phone: string | null;
  email: string | null;
  rating: number | null;
  review_count: number;
  verified: boolean;
  created_at: string;
}
