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

export interface PaymentType {
  type: "amex" | "cash" | "discover" | "mastercard" | "visa";
}

export interface AddPaymentPayload {
  amount: number;
  order_id: number;
  type: PaymentType;
}
