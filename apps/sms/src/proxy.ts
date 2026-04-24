import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

export default async function proxy(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id) {
    const res = await auth.api.signInWithOAuth2({
      body: {
        providerId: "login",
        callbackURL: "/",
      },
    });
    const location = res.url;

    if (location) {
      return NextResponse.redirect(location);
    }

    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
