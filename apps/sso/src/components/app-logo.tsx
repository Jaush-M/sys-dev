import { GalleryVerticalEndIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export function AppLogo() {
  const searchParams = useSearchParams()
  const params = searchParams.toString()

  return (
    <div className="flex justify-center gap-2 md:justify-start">
      <Link
        href={params ? `/${params}` : "/"}
        className="flex items-center gap-2 font-medium"
      >
        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEndIcon className="size-4" />
        </div>
        LMS Portal SSO
      </Link>
    </div>
  )
}
