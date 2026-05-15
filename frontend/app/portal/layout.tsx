"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, FileText, LogOut } from "lucide-react";
import { Toaster } from "react-hot-toast";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState("");

  useEffect(() => {
    if (pathname === "/portal/login") return;
    const token = localStorage.getItem("supplier_token");
    if (!token) { router.push("/portal/login"); return; }
    setName(localStorage.getItem("supplier_name") || "Supplier");
  }, [pathname, router]);

  const logout = () => {
    localStorage.removeItem("supplier_token");
    localStorage.removeItem("supplier_name");
    localStorage.removeItem("supplier_id");
    router.push("/portal/login");
  };

  if (pathname === "/portal/login") return <>{children}<Toaster /></>;

  const nav = [
    { href: "/portal/products", label: "Products", icon: Package },
    { href: "/portal/orders", label: "Orders", icon: ShoppingBag },
    { href: "/portal/invoices", label: "Invoices", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="text-sm font-semibold text-gray-900">Supplier Portal</div>
          <div className="text-xs text-gray-500 mt-0.5 truncate">{name}</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith(href) ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 w-full">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
