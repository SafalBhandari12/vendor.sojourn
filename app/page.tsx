"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && user.role === "VENDOR") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-4 border-emerald-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100'>
      <div className='min-h-screen flex items-center py-8'>
        <div className='container mx-auto px-4'>
          <div className='text-center'>
            {/* Header Section */}
            <div className='mb-8 mt-2'>
              <div className='inline-block mb-4'>
                <div className='flex items-center justify-center space-x-3'>
                  <div className='w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg'>
                    <svg
                      className='w-7 h-7 text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                      />
                    </svg>
                  </div>
                  <h1 className='text-4xl font-bold bg-gradient-to-r from-emerald-700 to-green-800 bg-clip-text text-transparent'>
                    Sojourn Vendor Portal
                  </h1>
                </div>
              </div>
              <p className='text-lg text-gray-700 max-w-2xl mx-auto'>
                Manage your hotel properties, rooms, and bookings with our
                comprehensive vendor management system.
              </p>
            </div>

            {/* Feature Cards */}
            <div className='grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8'>
              <div className='bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow'>
                <div className='w-14 h-14 bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-3'>
                  <svg
                    className='w-7 h-7 text-emerald-700'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-semibold mb-2 text-gray-900'>
                  Hotel Management
                </h3>
                <p className='text-sm text-gray-600'>
                  Create and manage your hotel profiles with detailed
                  information and images.
                </p>
              </div>

              <div className='bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow'>
                <div className='w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-3'>
                  <svg
                    className='w-7 h-7 text-green-700'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-semibold mb-2 text-gray-900'>
                  Room Management
                </h3>
                <p className='text-sm text-gray-600'>
                  Add, update, and manage all your hotel rooms with pricing and
                  availability.
                </p>
              </div>

              <div className='bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow'>
                <div className='w-14 h-14 bg-gradient-to-br from-teal-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-3'>
                  <svg
                    className='w-7 h-7 text-teal-700'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m-2 0v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2h-2m-2 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v0'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-semibold mb-2 text-gray-900'>
                  Booking Management
                </h3>
                <p className='text-sm text-gray-600'>
                  Track and manage all customer bookings and reservations in
                  real-time.
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className='mt-8'>
              {!isAuthenticated ? (
                <div className='space-y-4'>
                  <Link href='/auth'>
                    <Button
                      size='lg'
                      className='text-lg px-10 py-6 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all'
                    >
                      Login to Your Account
                    </Button>
                  </Link>
                  <div className='text-center mt-3'>
                    <Link href='/auth'>
                      <Button
                        variant='outline'
                        size='lg'
                        className='border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50'
                      >
                        Sign Up & Apply for Vendor Status
                      </Button>
                    </Link>
                    <p className='text-sm text-gray-600 mt-2'>
                      New hotel owner? Join as a vendor
                    </p>
                  </div>
                </div>
              ) : user && user.role === "VENDOR" ? (
                <Link href='/dashboard'>
                  <Button
                    size='lg'
                    className='text-lg px-10 py-6 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all'
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <div className='text-center'>
                  <div className='bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-8 max-w-md mx-auto shadow-lg mb-8'>
                    <div className='w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <svg
                        className='w-8 h-8 text-amber-700'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                        />
                      </svg>
                    </div>
                    <h3 className='text-xl font-semibold text-amber-900 mb-2'>
                      Vendor Access Only
                    </h3>
                    <p className='text-sm text-amber-800 mb-6'>
                      This portal is designed for hotel vendors. Your account
                      role is &quot;{user?.role}&quot;.
                    </p>
                    <div className='space-y-4'>
                      <Link href='/vendor-status'>
                        <Button className='w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-md mb-3'>
                          Check Vendor Application Status
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
