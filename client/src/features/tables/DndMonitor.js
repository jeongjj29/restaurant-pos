import { useDndMonitor } from "@dnd-kit/core";

function DndMonitor({ setActiveTable, tables }) {
  useDndMonitor({
    onDragStart(event) {
      const draggedId = event.active.id;
      const table = tables.find((t) => t.id === draggedId);
      if (table) setActiveTable(table);
    },
    onDragEnd() {
      setActiveTable(null);
    },
    onDragCancel() {
      setActiveTable(null);
    },
  });

  return null; // This component doesn't render anything
}

export default DndMonitor;
