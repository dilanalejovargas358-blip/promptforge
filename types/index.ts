export interface PromptCardData {
  id: string;
  title: string;
  description: string;
  category: string;
  model: string;
  isFeatured: boolean;
  isSponsored?: boolean;
  tags?: string; // JSON string de tags (Prompt.tags)
  views: number;
  savesCount: number;
  totalCredits: number;
  createdAt: Date | string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

// Movimiento contable para mostrar historial en el perfil.
// EARN/SPEND/PREMIUM son créditos IA; RAY_EARN/RAY_SPEND son rayitos.
export type TransactionType =
  | "EARN"
  | "SPEND"
  | "DONATE"
  | "PREMIUM"
  | "RAY_EARN"
  | "RAY_SPEND";

export interface CreditTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: Date | string;
}
