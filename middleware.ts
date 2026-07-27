import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Protects /dashboard/** and /admin/** routes. Admin routes additionally
// require role === "ADMIN". Unauthenticated users are redirected to /login.
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

    if (isAdminRoute && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
