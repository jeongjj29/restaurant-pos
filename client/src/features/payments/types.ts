export interface Payment {
  id: number;
  amount: number;
  order_id: number;
  type: string;
}

export interface PaymentsState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
}
