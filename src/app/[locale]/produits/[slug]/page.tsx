import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { localized } from "@/lib/localize";
import { getProducts } from "@/lib/products-store";
import { getSettings } from "@/lib/settings-store";
import { ProductDetail } from "@/components/sections/product-detail";

export const dynamic = "force-dynamic";

const MEDIA_URL = (key: string) => `/api/media/${key}`;

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale; slug: string };
}): Promise<Metadata> {
  const { locale, slug } = params;
  const dict = getDictionary(locale);
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) return {};

  return buildMetadata({
    locale,
    dict,
    page: "products",
    pathname: `/produits/${slug}`,
    title: `${localized(product.name, locale)} — Emade3D`,
    description: localized(product.description, locale),
  });
}

export default async function ProductPage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  const { locale, slug } = params;
  const [products, settings] = await Promise.all([
    getProducts(),
    getSettings(),
  ]);
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const images = (product.images ?? []).map(MEDIA_URL);
  const currency = settings.currency || "DA";

  return (
    <ProductDetail
      product={{
        slug: product.slug,
        name: localized(product.name, locale),
        description: localized(product.description, locale),
        price: product.price,
        available: product.available,
        images,
      }}
      delivery={{
        pickupAvailable: settings.delivery.pickupAvailable,
        homeFee: settings.delivery.homeFee,
        wilayas: settings.delivery.wilayas.map((w) => ({
          id: w.id,
          name: locale === "ar" && w.nameAr ? w.nameAr : w.name,
          homeFee: w.homeFee,
          stopDeskFee: w.stopDeskFee ?? w.homeFee,
        })),
        communes: settings.delivery.communes.map((c) => ({
          id: c.id,
          wilayaId: c.wilayaId,
          name: locale === "ar" && c.nameAr ? c.nameAr : c.name,
        })),
      }}
      currency={currency}
      locale={locale}
    />
  );
}
