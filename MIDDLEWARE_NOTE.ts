// Add this to your existing middleware.ts
// Protects /superadmin routes — only SUPER_ADMIN role can access

// In your middleware.ts matcher config, ensure superadmin is protected:
// matcher: ['/dashboard/:path*', '/superadmin/:path*']

// In the middleware logic, add:
// if (pathname.startsWith('/superadmin')) {
//   const payload = verifyToken(token);
//   if (!payload || payload.role !== 'SUPER_ADMIN') {
//     return NextResponse.redirect(new URL('/signin', request.url));
//   }
// }

export {};
