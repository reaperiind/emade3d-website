import type { LocalizedText } from "@/lib/localize";

/**
 * A single selectable characteristic (e.g. color, size, shape). Each option
 * carries a localized label and a list of localized choices. Since the user
 * chose text/shape options, choices are free-form text values that can change
 * the price only if the admin adds a priceDelta.
 */
export interface ProductOption {
  /** Localized label, e.g. "Forme" / "Shape" / "شكل". */
  label: LocalizedText;
  /** Localized choices, e.g. ["Carré", "Rond"] / ["Square", "Round"]. */
  values: LocalizedText[];
}

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
  /** Optional selectable options (color / size / shape...). */
  options?: ProductOption[];
}

/** Demo seed catalog — kept empty, products are entered by the admin. */
export const demoProducts: Product[] = [];