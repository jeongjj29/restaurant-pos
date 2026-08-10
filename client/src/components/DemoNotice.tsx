function DemoNotice() {
  return (
    <aside
      role="note"
      className="rounded-xl border border-amber-400/35 bg-amber-400/10 px-4 py-2 text-sm text-amber-100"
    >
      <strong>Shared public demo.</strong>{" "}
      Changes may be visible to other visitors and periodically reset. Do not enter
      real customer or payment data.
    </aside>
  );
}

export default DemoNotice;
