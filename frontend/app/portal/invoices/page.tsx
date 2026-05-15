"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("supplier_token");
    fetch("/api/v1/portal/invoices", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setInvoices)
      .catch(() => toast.error("Failed to load invoices"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400">Loading…</div>;

  return (
    <div>
      <h1 className="page-title mb-6">Invoices</h1>
      <div className="card table-wrapper">
        <table>
          <thead><tr>
            <th>Invoice #</th><th>Period</th><th>Amount</th><th>Status</th><th>Paid At</th>
          </tr></thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No invoices yet.</td></tr>
            ) : invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="font-mono text-xs">{inv.invoice_number}</td>
                <td className="text-xs text-gray-500">
                  {new Date(inv.period_start).toLocaleDateString()} — {new Date(inv.period_end).toLocaleDateString()}
                </td>
                <td className="font-medium">${inv.total_amount.toFixed(2)}</td>
                <td>
                  <span className={`badge text-xs ${inv.status === "paid" ? "badge-green" : inv.status === "overdue" ? "badge-red" : "badge-yellow"}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="text-xs text-gray-500">{inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
