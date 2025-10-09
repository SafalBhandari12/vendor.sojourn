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
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-16'>
        <div className='text-center'>
          <h1 className='text-5xl font-bold text-gray-900 mb-6'>
            Sojourn Vendor Portal
          </h1>
          <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
            Manage your hotel properties, rooms, and bookings with our
            comprehensive vendor management system.
          </p>

          <div className='grid md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto'>
            <div className='bg-white p-8 rounded-lg shadow-lg'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-blue-600'
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
              <h3 className='text-xl font-semibold mb-2'>Hotel Management</h3>
              <p className='text-gray-600'>
                Create and manage your hotel profiles with detailed information
                and images.
              </p>
            </div>

            <div className='bg-white p-8 rounded-lg shadow-lg'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-green-600'
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
              <h3 className='text-xl font-semibold mb-2'>Room Management</h3>
              <p className='text-gray-600'>
                Add, update, and manage all your hotel rooms with pricing and
                availability.
              </p>
            </div>

            <div className='bg-white p-8 rounded-lg shadow-lg'>
              <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-purple-600'
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
              <h3 className='text-xl font-semibold mb-2'>Booking Management</h3>
              <p className='text-gray-600'>
                Track and manage all customer bookings and reservations in
                real-time.
              </p>
            </div>
          </div>

          <div className='mt-12'>
            {!isAuthenticated ? (
              <div className='space-y-4'>
                <Link href='/auth'>
                  <Button size='lg' className='text-lg px-8 py-3 mr-4'>
                    Login to Your Account
                  </Button>
                </Link>
                <div className='text-center'>
                  <p className='text-sm text-gray-600 mb-2'>
                    New hotel owner? Join as a vendor
                  </p>
                  <Link href='/auth'>
                    <Button variant='outline' size='lg'>
                      Sign Up & Apply for Vendor Status
                    </Button>
                  </Link>
                </div>
              </div>
            ) : user && user.role === "VENDOR" ? (
              <Link href='/dashboard'>
                <Button size='lg' className='text-lg px-8 py-3'>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <div className='text-center'>
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto'>
                  <h3 className='text-lg font-medium text-yellow-800 mb-2'>
                    Vendor Access Only
                  </h3>
                  <p className='text-sm text-yellow-700 mb-4'>
                    This portal is designed for hotel vendors. Your account role
                    is &quot;{user?.role}&quot;.
                  </p>
                  <div className='space-y-2'>
                    <Link href='/vendor-status'>
                      <Button className='w-full bg-blue-600 hover:bg-blue-700 text-white'>
                        Check Vendor Application Status
                      </Button>
                    </Link>
                    <Link href='/vendor-register'>
                      <Button variant='outline' className='w-full'>
                        Apply for Vendor Status
                      </Button>
                    </Link>
                    <button
                      onClick={() => {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                        window.location.reload();
                      }}
                      className='w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors'
                    >
                      Sign in with different account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
