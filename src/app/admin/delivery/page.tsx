"use client";

import { DeliverySettingsPanel } from "../delivery-settings-panel";
import { useAdminToken } from "../admin-shell";

export default function AdminDeliveryPage() {
  const token = useAdminToken();
  return <DeliverySettingsPanel token={token} />;
}
