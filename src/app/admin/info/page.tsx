"use client";

import { InfoSettingsPanel } from "../info-settings-panel";
import { useAdminToken } from "../admin-shell";

export default function AdminInfoPage() {
  const token = useAdminToken();
  return <InfoSettingsPanel token={token} />;
}
