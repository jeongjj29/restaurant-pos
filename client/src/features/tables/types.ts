import { Order } from "@features/orders/types";

export interface Table {
  id: number;
  number: number;
  capacity: number;
  location_x: number | null;
  location_y: number | null;
  orders?: Order[];
}

export interface TablesState {
  tables: Table[];
  loading: boolean;
  error: string | null;
  layout: TableCell[][];
}

export interface TablesLayoutProps {
  tables: Table[];
}

export interface UpdateTablePayload {
  tableId: number;
  updatedData: Partial<Table>;
}

export interface AddTablePayload {
  number: number;
  capacity: number;
}

export interface TableCell {
  isTable: boolean;
  id?: number | null;
  number?: number | null;
  location_x?: number | null;
  location_y?: number | null;
  orders?: Order[];
}
