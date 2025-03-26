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
      className="text-lg font-semibold flex flex-col justify-center items-center rounded-md mr-2 px-2 py-4 hover:bg-white/10 transition duration-200"
    >
      <p>Table: {number}</p>
      <p>Seats: {capacity}</p>
    </div>
  );
}

export default DraggableTable;
