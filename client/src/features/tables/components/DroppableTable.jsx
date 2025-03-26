import { useDroppable } from "@dnd-kit/core";

function DroppableTable({ xIndex, yIndex, isTable, number }) {
  const { setNodeRef } = useDroppable({
    id: `${xIndex}-${yIndex}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`text-2xl flex items-center justify-center w-24 h-24 border-border rounded-lg text-white cursor-pointer ${
        isTable
          ? "bg-blue-500 hover:bg-blue-600"
          : "bg-white/10 hover:bg-white/20"
      }`}
    >
      {number}
    </div>
  );
}

export default DroppableTable;
