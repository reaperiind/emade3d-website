"use client";

import { ProductsPanel } from "../products-panel";
import { useAdminToken } from "../admin-shell";

export default function AdminProductsPage() {
  const token = useAdminToken();
  return <ProductsPanel token={token} />;
}
