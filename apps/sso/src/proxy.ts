import { NextRequest, NextResponse } from "next/server"
import { auth } from "./lib/auth"

const publicRoutes = ["/login", "/signup"]

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname

  const isPublic = publicRoutes.includes(path)

  const session = await auth.api.getSession({
    headers: req.headers,
  })

  if (isPublic && session?.user.id) {
    return NextResponse.redirect(new URL("/" + req.nextUrl.search, req.nextUrl))
  }

  if (!isPublic && !session?.user.id) {
    return NextResponse.redirect(
      new URL("/login" + req.nextUrl.search, req.nextUrl)
    )
  }

  return NextResponse.next()
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}
