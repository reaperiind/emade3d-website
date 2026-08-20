import type { LocalizedText } from "@/lib/localize";

/**
 * A product displayed on the public "Produits" (Our Products) page and
 * purchasable through a dedicated form. Products are fully managed from the
 * admin "Produits" panel (add / edit / reorder / availability / images).
 */
export interface Product {
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  available: boolean;
  images: string[];
}

/** Demo seed catalog — kept empty, products are entered by the admin. */
export const demoProducts: Product[] = [];