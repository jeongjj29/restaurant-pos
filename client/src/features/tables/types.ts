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
