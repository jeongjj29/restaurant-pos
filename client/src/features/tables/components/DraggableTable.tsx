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
      className="text-lg font-semibold flex flex-col justify-center items-center rounded-md mr-2 px-2 py-4 transition duration-200 hover:bg-white/10"
    >
      <p>Table: {number}</p>
      <p>Seats: {capacity}</p>
    </div>
  );
}

export default DraggableTable;
