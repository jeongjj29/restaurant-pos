import { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  DragEndEvent,
  pointerWithin,
} from "@dnd-kit/core";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchTables, updateTable } from "@tables/slices/tablesSlice";
import DndMonitor from "@tables/DndMonitor";
import TableLayout from "@tables/components/TableLayout";
import TableList from "@tables/components/TableList";
import { Table } from "@tables/types";

function TableManagementPage() {
  const dispatch = useAppDispatch();

  const tables = useAppSelector((state) => state.tables.tables);

  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const [fetchLoading, setFetchLoading] = useState(tables.length === 0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [layoutError, setLayoutError] = useState<string | null>(null);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const [overX, overY] = over.id.toString().split("-").map(Number);

    const occupiedLocation = tables.find(
      (table) => table.location_x === overX && table.location_y === overY
    );

    setLayoutError(null);

    try {
      if (occupiedLocation && occupiedLocation.id !== Number(active.id)) {
        await dispatch(
          updateTable({
            tableId: occupiedLocation.id,
            updatedData: { location_x: null, location_y: null },
          })
        ).unwrap();
      }

      await dispatch(
        updateTable({
          tableId: Number(active.id),
          updatedData: { location_x: overX, location_y: overY },
        })
      ).unwrap();
    } catch (error: unknown) {
      setLayoutError(
        typeof error === "string"
          ? error
          : "The floor-plan change could not be saved"
      );
    }
  };

  const loadTables = useCallback(async () => {
    setFetchLoading(true);
    setFetchError(null);

    try {
      await dispatch(fetchTables()).unwrap();
    } catch (error: unknown) {
      setFetchError(
        typeof error === "string" ? error : "Tables could not be loaded"
      );
    } finally {
      setFetchLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    void loadTables();
  }, [loadTables]);

  if (fetchLoading && tables.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-border bg-white/5 text-text-secondary">
        Loading floor plan…
      </div>
    );
  }

  if (fetchError && tables.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-error/40 bg-error/10 p-6 text-center">
        <p className="text-error">Could not load the floor plan: {fetchError}</p>
        <button
          type="button"
          onClick={() => void loadTables()}
          className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-white/10"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl p-0">
      {(fetchError || layoutError) && (
        <div
          role="alert"
          className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-sm text-error"
        >
          <span>{layoutError || `Floor plan refresh failed: ${fetchError}`}</span>
          {fetchError && (
            <button
              type="button"
              onClick={() => void loadTables()}
              className="rounded-md border border-error/40 px-2.5 py-1.5 font-semibold text-text-primary"
            >
              Retry
            </button>
          )}
        </div>
      )}
      <DndContext
        collisionDetection={pointerWithin}
        onDragEnd={(event) => void handleDragEnd(event)}
      >
        <DndMonitor setActiveTable={setActiveTable} tables={tables} />

        <div className="grid min-h-0 w-full flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,2.4fr)_minmax(220px,0.7fr)]">
          <TableLayout tables={tables} />
          <TableList tables={tables} />
        </div>

        <DragOverlay>
          {activeTable && (
            <div className="flex min-w-[120px] flex-col items-start justify-center rounded-md border border-accent/50 bg-accent/20 px-2 py-2 text-sm font-semibold text-text-primary shadow-lg">
              <p>Table {activeTable.number}</p>
              <p className="text-text-secondary">Seats {activeTable.capacity}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default TableManagementPage;
