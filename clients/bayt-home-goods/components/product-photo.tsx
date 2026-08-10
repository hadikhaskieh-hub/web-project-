import Image from "next/image";

/**
 * A product photo, or a designed tile when the owner has not uploaded one
 * yet. Never a broken image and never an empty grey box.
 */
export function ProductPhoto({
  name,
  imagePath,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  priority = false,
  className = "",
  /** Off for thumbnails, where the caption would not fit. */
  showLabel = true,
}: {
  name: string;
  imagePath: string | null;
  sizes?: string;
  priority?: boolean;
  className?: string;
  showLabel?: boolean;
}) {
  if (imagePath) {
    return (
      <div className={`relative overflow-hidden bg-surface ${className}`}>
        <Image
          src={imagePath}
          alt={name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  const initial = name.trim().charAt(0).toUpperCase() || "B";

  return (
    <div className={`photo-soon ${className}`}>
      <span
        aria-hidden="true"
        className={`price-mono relative z-10 font-medium text-accent/60 ${
          showLabel ? "text-6xl sm:text-7xl" : "text-xl"
        }`}
      >
        {initial}
      </span>
      {showLabel && (
        <span className="label-mono absolute bottom-3 left-3 z-10 text-accent/60">
          Photo soon
        </span>
      )}
    </div>
  );
}
