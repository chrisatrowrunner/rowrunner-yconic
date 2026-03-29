import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const SIZES = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 120, height: 120 },
};

export default function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const { width, height } = SIZES[size];
  const textSize = size === "lg" ? "text-4xl" : size === "md" ? "text-xl" : "text-lg";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.png"
        alt="RowRunner"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
      {showText && (
        <span className={`font-bold ${textSize}`}>
          <span className="text-brand-400">Row</span>
          <span className="text-slate-100">Runner</span>
        </span>
      )}
    </span>
  );
}
