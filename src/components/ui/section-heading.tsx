import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/reveal";

export function SectionHeading({
  kicker,
  title,
  subtitle,
  align = "start",
  className,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  align?: "start" | "center";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "max-w-3xl",
        centered && "mx-auto text-center",
        className
      )}
    >
      <Reveal>
        <span className={cn("kicker", centered && "justify-center", centered && "before:hidden gap-0")}>
          {kicker}
        </span>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="h-display mt-4 text-3xl text-balance sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={160}>
          <p className="text-muted mt-5 text-base leading-relaxed sm:text-lg">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}