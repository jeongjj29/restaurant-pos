import { useDraggable } from "@dnd-kit/core";

interface DraggableTableProps {
  tableId: number;
  number: number;
  capacity: number;
}

function DraggableTable({ tableId, number, capacity }: DraggableTableProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: tableId,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="flex min-w-[120px] flex-col items-start justify-center rounded-md px-2 py-2 text-sm font-semibold transition duration-200 hover:bg-white/10"
    >
      <p>Table {number}</p>
      <p className="text-text-secondary">Seats {capacity}</p>
    </div>
  );
}

export default DraggableTable;
