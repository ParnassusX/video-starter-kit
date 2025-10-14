import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect all routes under /app and /api
        if (req.nextUrl.pathname.startsWith("/app") || 
            req.nextUrl.pathname.startsWith("/api")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/app/:path*", "/api/:path*"],
};