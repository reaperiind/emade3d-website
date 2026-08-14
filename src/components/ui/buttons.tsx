import Link from "next/link";
import { cn } from "@/lib/cn";

export function ButtonLink({
  href,
  className,
  children,
  external,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}