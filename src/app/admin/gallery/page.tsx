"use client";

import { GalleryPanel } from "../gallery-panel";
import { useAdminToken } from "../admin-shell";

export default function AdminGalleryPage() {
  const token = useAdminToken();
  return <GalleryPanel token={token} />;
}
