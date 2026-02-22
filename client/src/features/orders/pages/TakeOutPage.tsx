import OrderInput from "@orders/components/OrderInput";

function TakeOutPage() {
  return (
    <div className="glass-panel h-full rounded-2xl p-1.5 md:p-2.5">
      <OrderInput tableId={undefined} />
    </div>
  );
}

export default TakeOutPage;
