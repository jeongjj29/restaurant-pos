import { useDndMonitor } from "@dnd-kit/core";
import { Table } from "@tables/types";

interface DndMonitorProps {
  setActiveTable: (table: Table | null) => void;
  tables: Table[];
}

function DndMonitor({ setActiveTable, tables }: DndMonitorProps) {
  useDndMonitor({
    onDragStart(event) {
      const draggedId = event.active.id;
      const table = tables.find((t) => t.id === Number(draggedId));
      if (table) setActiveTable(table);
    },
    onDragEnd() {
      setActiveTable(null);
    },
    onDragCancel() {
      setActiveTable(null);
    },
  });

  return null;
}

export default DndMonitor;
