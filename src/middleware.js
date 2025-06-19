import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// to create protected routes
const isProtected = createRouteMatcher([
  "/doctors(.*)",
  "/onboarding(.*)",
  "/doctor(.*)",
  "/admin(.*)",
  "/video call(.*)",
  "/appointments(.*)",
])

export default clerkMiddleware(async (auth,request)=>{
  const {userId} = await auth();
  if(!userId && isProtected(request)){
    const {redirectToSignIn} = await auth();
    return redirectToSignIn();
  }
  // If the user is authenticated, allow the request to proceed
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};