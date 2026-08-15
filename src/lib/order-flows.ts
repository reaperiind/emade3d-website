/**
 * Order status workflows, one per service type.
 *
 * The customer-facing tracking page walks through these steps in order.
 * The admin updates the current status; each change is appended to the
 * order's history with a timestamp.
 */

export const ORDER_FLOWS = {
  IMPRESSION_3D: [
    "SUBMITTED",
    "UNDER_REVIEW",
    "QUOTE_SENT",
    "CONFIRMED",
    "IN_PRODUCTION",
    "QUALITY_CHECK",
    "READY",
    "DELIVERED",
    "CLOSED",
  ],
  CONCEPTION_3D: [
    "SUBMITTED",
    "UNDER_REVIEW",
    "QUOTE_SENT",
    "CONFIRMED",
    "IN_DESIGN",
    "DESIGN_APPROVAL",
    "READY",
    "DELIVERED",
    "CLOSED",
  ],
  CONCEPTION_AND_IMPRESSION: [
    "SUBMITTED",
    "UNDER_REVIEW",
    "QUOTE_SENT",
    "CONFIRMED",
    "IN_DESIGN",
    "DESIGN_APPROVAL",
    "IN_PRODUCTION",
    "QUALITY_CHECK",
    "READY",
    "DELIVERED",
    "CLOSED",
  ],
} as const;

export type ServiceType = keyof typeof ORDER_FLOWS;

export type OrderStatus = (typeof ORDER_FLOWS)[ServiceType][number];

export const ALL_STATUSES = Array.from(
  new Set<OrderStatus>(
    Object.values(ORDER_FLOWS).flat() as OrderStatus[]
  )
);

/** All statuses valid for a given service type. */
export function statusesFor(serviceType: string): OrderStatus[] {
  return (
    (ORDER_FLOWS[serviceType as ServiceType] as readonly OrderStatus[]) ??
    (ORDER_FLOWS.IMPRESSION_3D as readonly OrderStatus[])
  ).slice() as OrderStatus[];
}

export function isStatusInFlow(
  serviceType: string,
  status: string
): boolean {
  return statusesFor(serviceType).includes(status as OrderStatus);
}

/**
 * Delivery method chosen by the customer.
 * - pickup: the customer collects the order at the site.
 * - courier: shipped via a delivery company (office or home).
 */
export type DeliveryMethod = "pickup" | "courier";
export type CourierOption = "office" | "home";

export interface DeliveryInfo {
  method: DeliveryMethod;
  option?: CourierOption;
  /** Selected office id (when option === "office"). */
  officeId?: string;
  /** Delivery address (when option === "home"). */
  address?: string;
  /** Delivery fee computed at order time (currency units). */
  fee?: number;
}

/** One step in the order history, with its timestamp (ISO string). */
export interface HistoryEntry {
  status: OrderStatus;
  at: string;
}