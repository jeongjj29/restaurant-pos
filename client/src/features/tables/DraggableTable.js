import { useDraggable } from "@dnd-kit/core";

function DraggableTable({ tableId, number, capacity }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: tableId,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-36 h-24 text-lg font-semibold flex flex-col justify-center items-center bg-slate-200 p-4 mr-4 rounded-lg shadow-md hover:bg-gray-50 transition duration-200"
    >
      <p>Table: {number}</p>
      <p>Seats: {capacity}</p>
    </div>
  );
}

export default DraggableTable;
