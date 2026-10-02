"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { CheckIcon } from "@/components/ui/icons";

interface DetailProduct {
  slug: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  images: string[];
  options?: DetailOption[];
}

interface DetailOption {
  /** Localized option label, e.g. "Forme" / "شكل". */
  label: string;
  /** Localized choices, each already localized for the current locale. */
  values: string[];
}

interface DetailWilaya {
  id: number;
  name: string;
  homeFee: number;
  stopDeskFee: number;
}

const LABELS = {
  fr: {
    back: "Tous les produits",
    inStock: "En stock",
    outOfStock: "Rupture de stock",
    orderTitle: "Commander maintenant",
    orderNote:
      "Remplissez le formulaire — nous vous appelons pour confirmer. Paiement à la livraison.",
    name: "Nom complet",
    namePlaceholder: "Votre nom et prénom",
    phone: "Téléphone",
    phonePlaceholder: "05 XX XX XX XX",
    quantity: "Quantité",
    delivery: "Livraison",
    homeOption: "À domicile",
    officeOption: "Bureau (Stop Desk)",
    wilaya: "Wilaya",
    selectWilaya: "Choisir la wilaya",
    address: "Adresse",
    addressPlaceholder: "Adresse complète de livraison",
    options: "Options",
    optionsHint: "Sélectionnez une valeur pour chaque option.",
    subtotal: "Sous-total",
    deliveryFee: "Livraison",
    total: "Total à payer",
    submit: "Confirmer la commande",
    sending: "Envoi en cours…",
    successTitle: "Commande reçue !",
    successText:
      "Merci ! Nous vous contacterons très vite pour confirmer votre commande.",
    continueShopping: "Continuer mes achats",
    description: "Description du produit",
    unconfigured:
      "Les frais de livraison ne sont pas encore configurés — contactez-nous pour finaliser la commande.",
  },
  en: {
    back: "All products",
    inStock: "In stock",
    outOfStock: "Out of stock",
    orderTitle: "Order now",
    orderNote:
      "Fill the form — we will call you to confirm. Cash on delivery.",
    name: "Full name",
    namePlaceholder: "Your first and last name",
    phone: "Phone",
    phonePlaceholder: "05 XX XX XX XX",
    quantity: "Quantity",
    delivery: "Delivery",
    homeOption: "Home delivery",
    officeOption: "Office (Stop Desk)",
    wilaya: "Wilaya",
    selectWilaya: "Choose the wilaya",
    address: "Address",
    addressPlaceholder: "Full delivery address",
    options: "Options",
    optionsHint: "Select a value for each option.",
    subtotal: "Subtotal",
    deliveryFee: "Delivery",
    total: "Total",
    submit: "Confirm order",
    sending: "Sending…",
    successTitle: "Order received!",
    successText: "Thank you! We will contact you shortly to confirm.",
    continueShopping: "Continue shopping",
    description: "Product description",
    unconfigured:
      "Delivery fees are not configured yet — contact us to finalize your order.",
  },
  ar: {
    back: "كل المنتجات",
    inStock: "متوفر",
    outOfStock: "نفدت الكمية",
    orderTitle: "اطلب الآن",
    orderNote: "املأ الاستمارة وسنتصل بك للتأكيد. الدفع عند الاستلام.",
    name: "الاسم الكامل",
    namePlaceholder: "الاسم واللقب",
    phone: "رقم الهاتف",
    phonePlaceholder: "05 XX XX XX XX",
    quantity: "الكمية",
    delivery: "التوصيل",
    homeOption: "إلى المنزل",
    officeOption: "مكتب التوصيل (Stop Desk)",
    wilaya: "الولاية",
    selectWilaya: "اختر الولاية",
    address: "العنوان",
    addressPlaceholder: "عنوان التوصيل الكامل",
    options: "الخيارات",
    optionsHint: "اختر قيمة لكل خيار.",
    subtotal: "المجموع الفرعي",
    deliveryFee: "التوصيل",
    total: "المجموع الكلي",
    submit: "تأكيد الطلب",
    sending: "جارٍ الإرسال…",
    successTitle: "تم استلام طلبك!",
    successText: "شكرًا لك! سنتواصل معك قريبًا لتأكيد الطلب.",
    continueShopping: "متابعة التسوق",
    description: "وصف المنتج",
    unconfigured: "لم تُضبط أسعار التوصيل بعد — تواصل معنا لإتمام الطلب.",
  },
} as const;

const inputClass =
  "w-full rounded-xl border border-[#e6d9bf] bg-white px-4 py-3 text-sm text-dzb-navy placeholder:text-[#b3ab9c] transition focus:border-dzb-amber focus:outline-none focus:ring-4 focus:ring-dzb-amber/15";

export function ProductDetail({
  product,
  delivery,
  currency,
  locale,
}: {
  product: DetailProduct;
  delivery: {
    homeFee: number;
    wilayas: DetailWilaya[];
  };
  currency: string;
  locale: Locale;
}) {
  const L = LABELS[locale];
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [option, setOption] = useState<"home" | "office">("home");
  const [wilayaId, setWilayaId] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [selections, setSelections] = useState<Record<string, string>>({});

  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [sent, setSent] = useState(false);

  const fee = useMemo(() => {
    const w = delivery.wilayas.find((x) => x.id === wilayaId);
    if (!w) return -1;
    return option === "office" ? w.stopDeskFee : w.homeFee;
  }, [option, wilayaId, delivery.wilayas]);

  const hasDeliveryData = delivery.wilayas.length > 0;
  const subtotal = product.price * quantity;
  const total = fee < 0 ? null : subtotal + fee;

  function fmt(n: number): string {
    return new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(
      n
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError(false);
    try {
      const res = await fetch("/api/product-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          productName: { [locale]: product.name },
          price: product.price,
          customerName: (
            e.currentTarget.elements.namedItem("name") as HTMLInputElement
          ).value.trim(),
          phone: (
            e.currentTarget.elements.namedItem("phone") as HTMLInputElement
          ).value.trim(),
          quantity,
          locale,
          ...(Object.keys(selections).length > 0
            ? {
                selections: Object.entries(selections).map(([label, value]) => ({
                  label,
                  value,
                })),
              }
            : {}),
          delivery: {
            method: "courier",
            option,
            ...(wilayaId != null ? { wilayaId } : {}),
            ...(option === "home" && address.trim()
              ? { address: address.trim() }
              : {}),
          },
        }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-dzb-cream pb-20 pt-28">
      <div className="container-site max-w-6xl">
        <Link
          href={`/${locale}/produits`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-dzb-muted transition hover:text-dzb-amberink"
        >
          <span aria-hidden>←</span>
          {L.back}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Gallery */}
          <div>
            <div className="overflow-hidden rounded-[24px] border border-dzb-creamline bg-white shadow-[0_18px_44px_-24px_rgba(27,26,45,0.25)]">
              <div className="aspect-square w-full bg-gradient-to-br from-dzb-sand/60 to-dzb-tint">
                {product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.images[imageIndex] ?? product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-medium text-[#9a97a6]">
                    —
                  </div>
                )}
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2.5">
                {product.images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setImageIndex(i)}
                    aria-label={`${product.name} — ${i + 1}`}
                    className={cn(
                      "aspect-square overflow-hidden rounded-xl border-2 bg-white transition",
                      i === imageIndex
                        ? "border-dzb-amber shadow-[0_6px_16px_-8px_rgba(247,169,33,0.8)]"
                        : "border-dzb-creamline opacity-70 hover:opacity-100"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info + order */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-bold",
                  product.available
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-[#e6d9bf] bg-white text-dzb-muted"
                )}
              >
                {product.available ? L.inStock : L.outOfStock}
              </span>
            </div>

            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-dzb-navy sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-4 font-display text-3xl font-extrabold text-dzb-amberdeep sm:text-4xl">
              {fmt(product.price)}
              <span className="ms-2 text-base font-bold text-dzb-faint">
                {currency}
              </span>
            </p>

            {/* Quantity */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-semibold text-dzb-muted">
                {L.quantity}
              </span>
              <div className="flex items-center overflow-hidden rounded-full border border-[#e6d9bf] bg-white">
                <button
                  type="button"
                  aria-label="−"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={!product.available}
                  className="flex h-11 w-11 items-center justify-center text-lg font-bold text-dzb-muted transition hover:bg-dzb-tint hover:text-dzb-amberink disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-10 text-center font-display text-base font-bold text-dzb-navy">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="+"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={!product.available}
                  className="flex h-11 w-11 items-center justify-center text-lg font-bold text-dzb-muted transition hover:bg-dzb-tint hover:text-dzb-amberink disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            {/* Order form */}
            <div className="mt-7 rounded-[24px] border border-dzb-creamline bg-white p-6 shadow-[0_14px_36px_-22px_rgba(27,26,45,0.3)] sm:p-7">
              {sent ? (
                <div className="py-6 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                    <CheckIcon className="h-7 w-7" />
                  </span>
                  <h2 className="mt-4 font-display text-xl font-bold text-dzb-navy">
                    {L.successTitle}
                  </h2>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-dzb-muted">
                    {L.successText}
                  </p>
                  <Link
                    href={`/${locale}/produits`}
                    className="mt-6 inline-block rounded-full bg-gradient-to-br from-dzb-amber to-dzb-amberdeep px-6 py-3 text-sm font-bold text-white shadow-[0_12px_26px_-12px_rgba(247,169,33,0.9)] transition hover:brightness-105"
                  >
                    {L.continueShopping}
                  </Link>
                </div>
              ) : product.available ? (
                <form onSubmit={onSubmit}>
                  <h2 className="font-display text-lg font-bold text-dzb-navy">
                    {L.orderTitle}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-dzb-faint">
                    {L.orderNote}
                  </p>

                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-dzb-muted">
                        {L.name} *
                      </label>
                      <input
                        name="name"
                        required
                        placeholder={L.namePlaceholder}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-dzb-muted">
                        {L.phone} *
                      </label>
                      <input
                        name="phone"
                        required
                        type="tel"
                        dir="ltr"
                        placeholder={L.phonePlaceholder}
                        className={cn(inputClass, "text-start")}
                      />
                    </div>

                    {product.options && product.options.length > 0 && (
                      <div className="rounded-2xl border border-[#f0e6d2] bg-dzb-cream/60 p-4">
                        <p className="text-sm font-bold text-dzb-navy">{L.options}</p>
                        <p className="mt-0.5 text-xs text-dzb-faint">{L.optionsHint}</p>
                        <div className="mt-3 space-y-3">
                          {product.options.map((opt) => (
                            <div key={opt.label}>
                              <p className="text-xs font-semibold text-dzb-muted">{opt.label}</p>
                              <div className="mt-1.5 flex flex-wrap gap-2">
                                {opt.values.map((val) => {
                                  const active = selections[opt.label] === val;
                                  return (
                                    <button
                                      key={val}
                                      type="button"
                                      onClick={() =>
                                        setSelections((s) => ({ ...s, [opt.label]: val }))
                                      }
                                      className={cn(
                                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                                        active
                                          ? "border-dzb-amber bg-dzb-tint text-dzb-amberink"
                                          : "border-[#e6d9bf] bg-white text-dzb-muted hover:border-dzb-amber/50"
                                      )}
                                    >
                                      {val}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Delivery */}
                    <div className="rounded-2xl border border-[#f0e6d2] bg-dzb-cream/60 p-4">
                      <p className="text-sm font-bold text-dzb-navy">
                        {L.delivery}
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <MethodChip
                          active={option === "home"}
                          onClick={() => setOption("home")}
                          label={L.homeOption}
                        />
                        <MethodChip
                          active={option === "office"}
                          onClick={() => setOption("office")}
                          label={L.officeOption}
                        />
                      </div>

                      {hasDeliveryData ? (
                        <div className="mt-3">
                          <label className="mb-1.5 block text-xs font-semibold text-dzb-muted">
                            {L.wilaya} *
                          </label>
                          <select
                            required
                            value={wilayaId ?? ""}
                            onChange={(e) =>
                              setWilayaId(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            className={cn(inputClass, "appearance-none")}
                          >
                            <option value="" disabled>
                              {L.selectWilaya}
                            </option>
                            {delivery.wilayas.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.name}
                              </option>
                            ))}
                          </select>

                          {option === "home" && (
                            <div className="mt-3">
                              <label className="mb-1.5 block text-xs font-semibold text-dzb-muted">
                                {L.address} *
                              </label>
                              <textarea
                                required
                                rows={2}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder={L.addressPlaceholder}
                                className={cn(inputClass, "resize-none")}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="mt-3 rounded-xl bg-white px-3 py-2.5 text-xs text-dzb-muted">
                          {L.unconfigured}
                        </p>
                      )}

                      {/* Totals */}
                      <div className="mt-4 space-y-1.5 border-t border-[#f0e6d2] pt-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-dzb-muted">{L.subtotal}</span>
                          <span className="font-semibold text-dzb-navy">
                            {fmt(subtotal)} {currency}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-dzb-muted">{L.deliveryFee}</span>
                          <span className="font-semibold text-dzb-navy">
                            {fee < 0 ? "—" : `${fmt(fee)} ${currency}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5">
                          <span className="font-display font-bold text-dzb-navy">
                            {L.total}
                          </span>
                          <span className="font-display text-lg font-extrabold text-dzb-amberdeep">
                            {total != null ? `${fmt(total)} ${currency}` : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
                        Une erreur est survenue — réessayez.
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={sending || !hasDeliveryData}
                      className="w-full rounded-full bg-gradient-to-br from-dzb-amber to-dzb-amberdeep py-4 font-display text-base font-bold text-white shadow-[0_14px_30px_-12px_rgba(247,169,33,0.9)] transition hover:brightness-105 disabled:opacity-50"
                    >
                      {sending ? L.sending : L.submit}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="rounded-2xl border border-[#f0e6d2] bg-dzb-cream/60 px-4 py-6 text-center text-sm font-medium text-dzb-muted">
                  {L.outOfStock}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <section className="mt-12 rounded-[24px] border border-dzb-creamline bg-white p-6 shadow-[0_10px_30px_-20px_rgba(27,26,45,0.25)] sm:p-8">
            <h2 className="font-display text-lg font-bold text-dzb-navy">
              {L.description}
            </h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-dzb-muted">
              {product.description}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

function MethodChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3 py-2.5 text-xs font-bold transition sm:text-sm",
        active
          ? "border-dzb-amber bg-dzb-tint text-dzb-amberink shadow-[inset_0_0_0_1px_rgba(247,169,33,0.35)]"
          : "border-[#e6d9bf] bg-white text-dzb-muted hover:border-dzb-amber/50"
      )}
    >
      {label}
    </button>
  );
}
