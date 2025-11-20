import { OrdersChart } from "@/components/admin/OrdersChart";

export default function AdminPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <OrdersChart />
    </div>
  );
}
