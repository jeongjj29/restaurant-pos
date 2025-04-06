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

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="text-lg font-semibold flex flex-col justify-center items-center rounded-md mr-2 px-2 py-4 transition duration-200 hover:bg-white/10"
    >
      <p>Table: {number}</p>
      <p>Seats: {capacity}</p>
    </div>
  );
}

export default DraggableTable;
