import Image from "next/image"
import Link from "next/link"

export default function Logo({ size = "default" }) {
  const dimensions = size === "small" ? { width: 32, height: 32 } : { width: 40, height: 40 }

  return (
    <Link href="/" className="flex items-center">
      <div className="relative mr-2" style={{ width: dimensions.width, height: dimensions.height }}>
        <Image
          src="/ridepals-logo.png"
          alt="ridepals.ai logo"
          width={dimensions.width}
          height={dimensions.height}
          className="rounded-md"
        />
      </div>
      <span className="font-bold text-xl text-rose-600">ridepals.ai</span>
    </Link>
  )
}
