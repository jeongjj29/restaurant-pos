import { TABLE_LAYOUT } from "@constants";
import { Table, TableCell } from "@tables/types";

export const createTableLayout = (tables: Table[]): TableCell[][] => {
  const cols = TABLE_LAYOUT.HEIGHT;
  const rows = TABLE_LAYOUT.WIDTH;

  const layout: TableCell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ isTable: false }))
  );

  tables.forEach((table) => {
    if (table.location_x !== null && table.location_y !== null) {
      layout[table.location_y][table.location_x] = {
        isTable: true,
        ...table,
      };
    }
  });

  return layout;
};
