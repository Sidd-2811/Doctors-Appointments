import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Button } from './ui/button'
import { checkUser } from '@/lib/checkUser'
import {  Calendar, CreditCard, ShieldCheck, Stethoscope, User } from 'lucide-react'
import { checkAndAllocateCredits } from '@/actions/credits'
import { Badge } from './ui/badge'
const Header =async () => {
  const user = await checkUser();
  if(user?.role === "PATIENT"){
    await checkAndAllocateCredits(user)
  }
  return (
    <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-10 supports-[backdrop-filter]:bg-background/60'>
        <nav className='container mx-auto px-4 h-16 flex items-center justify-between'>
            <Link href='/'>
            <Image
                src="/logo-single.png"
                alt="Logo"
                width={200}
                height={60}
                className="h-10 w-auto object-contain"
            />
             </Link>
             {/* all buttons section */}
             <div className='flex items-center space-x-2'>
              <SignedIn>
                {/* after signed in if the user role is admin then */}
                 {
                  user?.role === "ADMIN" && <Link href='/admin'>
                    <Button variant='outline' className="hidden md:inline-flex items-center gap-2">
                      <ShieldCheck className='h-4 w-4'/>
                      Admin Dashboard
                    </Button>
                    {/* for smaller screens */}
                    <Button variant='ghost' className='md:hidden w-10 h-10 p-0'>
                      <ShieldCheck className='h-4 w-4'/>
                    </Button>
                  </Link>
                }
                {/* after signed in if the user role is doctor then */}
                 {
                  user?.role === "DOCTOR" && <Link href='/doctor'>
                    <Button variant='outline' className="hidden md:inline-flex items-center gap-2">
                      <Stethoscope className='h-4 w-4'/>
                      Doctor Dashboard
                    </Button>
                    {/* for smaller screens */}
                    <Button variant='ghost' className='md:hidden w-10 h-10 p-0'>
                      <Stethoscope className='h-4 w-4'/>
                    </Button>
                  </Link>
                }
                {/* after signed in if the user role is patient then */}
                {
                  user?.role === "PATIENT" && <Link href='/appointments'>
                    <Button variant='outline' className="hidden md:inline-flex items-center gap-2">
                      <Calendar className='h-4 w-4'/>
                      My appointments
                    </Button>
                    {/* for smaller screens */}
                    <Button variant='ghost' className='md:hidden w-10 h-10 p-0'>
                      <Calendar className='h-4 w-4'/>
                    </Button>
                  </Link>
                }
                {
                  user?.role === "UNASSIGNED" && <Link href="/onboarding">
                    <Button variant='outline' className='hidden md:inline-flex items-center gap-2'>
                      <User className='h-4 w-4'/>
                        Complete Profile
                    </Button>
                    {/* for smaller screens */}
                    <Button variant='ghost' className='md:hidden w-10 h-10 p-0'>
                      <User className='h-4 w-4'/>
                    </Button>
                  </Link>
                }
              </SignedIn>

           {
         (!user || user?.role === "PATIENT") && (
      <Link href="/pricing">
        <Badge
          variant="outline"
          className="h-9 bg-emerald-900/20 border-emerald-700/30 px-3 py-1 flex items-center gap-2"
        >
          <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-emerald-400">
            {user && user?.role === "PATIENT" ? (
              <>
                {user.credits}{" "}
                <span className="hidden md:inline">  Credits  </span>
              </>
            ) : (
              <>Pricing</>
            )}
          </span>
        </Badge>
      </Link>
    )}


                <SignedOut>
              <SignInButton>
                <Button variant="secondary">Sign In</Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>

              <UserButton
              appearance={{
                elements : {
                    avatarBox: 'h-10 w-10 rounded-full',
                    userButtonPopoverCard : "shadow-xl",
                    userPreviewMainIdentifier : "font-semibold"
                }
              }}>

              </UserButton>
            </SignedIn>
             </div>
        </nav>
    </header>
  )
}

export default Header