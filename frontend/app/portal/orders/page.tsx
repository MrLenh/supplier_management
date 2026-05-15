"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Printer, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  unfulfilled: "badge-yellow",
  pending: "badge-yellow",
  shipped: "badge-blue",
  delivered: "badge-green",
  cancelled: "badge-red",
};

export default function PortalOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("unfulfilled");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [shipping, setShipping] = useState<Record<number, string>>({});

  const load = () => {
    const token = localStorage.getItem("supplier_token");
    const q = filter ? `?status=${filter}` : "";
    fetch(`/api/v1/portal/orders${q}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setOrders)
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); load(); }, [filter]);

  const markShipped = async (itemId: number) => {
    const token = localStorage.getItem("supplier_token");
    const tracking = shipping[itemId] || "";
    const resp = await fetch(`/api/v1/portal/orders/${itemId}/ship`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ tracking_number: tracking }),
    });
    if (resp.ok) {
      toast.success("Marked as shipped");
      load();
    } else {
      toast.error("Failed to update");
    }
  };

  const printLabel = (url: string) => {
    if (!url) { toast.error("No label available"); return; }
    window.open(url, "_blank");
  };

  const addr = (a: any) => a ? [a.name, a.line1, a.line2, a.city, a.state, a.zip, a.country].filter(Boolean).join(", ") : "—";

  if (loading) return <div className="text-gray-400">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Orders to Fulfill</h1>
        <div className="flex gap-2">
          {["unfulfilled", "shipped", ""].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No orders found.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.line_item_id} className="card overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">#{o.order_id}</span>
                    {o.external_order_id && <span className="text-xs text-gray-400 font-mono">{o.external_order_id}</span>}
                    <span className={`badge text-xs ${STATUS_COLORS[o.fulfill_status] || "badge-gray"}`}>{o.fulfill_status}</span>
                  </div>
                  <div className="text-sm text-gray-700 line-clamp-1">{o.product_name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Qty: {o.quantity} · {o.buyer_name || "—"}</div>
                </div>
                <div className="flex items-center gap-2">
                  {o.label_url && (
                    <button onClick={() => printLabel(o.label_url)} className="btn-secondary text-xs py-1.5">
                      <Printer className="w-3 h-3" /> Print Label
                    </button>
                  )}
                  <button onClick={() => setExpanded(expanded === o.line_item_id ? null : o.line_item_id)}
                    className="p-1.5 hover:bg-gray-100 rounded text-gray-400">
                    {expanded === o.line_item_id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {expanded === o.line_item_id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">SHIP TO</div>
                    <div className="text-sm text-gray-700">{addr(o.shipping_address)}</div>
                  </div>
                  {o.tracking_number && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">TRACKING</div>
                      <div className="text-sm font-mono text-gray-700">{o.tracking_number}</div>
                    </div>
                  )}
                  {o.fulfill_status !== "shipped" && o.fulfill_status !== "delivered" && (
                    <div className="flex gap-2 items-center">
                      <input
                        className="input flex-1 text-sm"
                        placeholder="Tracking number (optional)"
                        value={shipping[o.line_item_id] || ""}
                        onChange={(e) => setShipping((p) => ({ ...p, [o.line_item_id]: e.target.value }))}
                      />
                      <button onClick={() => markShipped(o.line_item_id)} className="btn-primary text-sm py-2">
                        <CheckCircle className="w-4 h-4" /> Mark Shipped
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
