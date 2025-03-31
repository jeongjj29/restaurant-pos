export interface Table {
  id: number;
  number: number;
  capacity: number;
  location_x: number | null;
  location_y: number | null;
}

export interface TablesState {
  tables: Table[];
  loading: boolean;
  error: string | null;
}

export interface TableGridCell {
  isTable: boolean;
  number?: number;
  id?: number;
  location_x?: number | null;
  location_y?: number | null;
}

export interface TablesLayoutProps {
  tables: Table[];
}
