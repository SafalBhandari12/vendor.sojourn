"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user, checkTokenExpiration } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log(
      "AuthGuard - isLoading:",
      isLoading,
      "isAuthenticated:",
      isAuthenticated,
      "user:",
      user
    ); // Debug log

    if (!isLoading) {
      // Check token expiration on component mount
      const isTokenValid = checkTokenExpiration();

      if (!isAuthenticated || !isTokenValid) {
        console.log(
          "Redirecting to /auth - user not authenticated or token expired"
        ); // Debug log
        router.push("/auth");
        return;
      }
    }

    // Check if user has vendor role
    if (!isLoading && isAuthenticated && user) {
      console.log(
        "User role check - role:",
        user.role,
        "isVendor:",
        user.role === "VENDOR"
      );
    }
  }, [isLoading, isAuthenticated, router, checkTokenExpiration, user]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("AuthGuard: Not rendering children - user not authenticated");
    return null; // Will redirect to auth
  }

  // Check if user is not a vendor - show access denied message
  if (user && user.role !== "VENDOR") {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='max-w-md w-full text-center'>
          <div className='bg-white p-8 rounded-lg shadow-lg'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Access Denied
            </h2>
            <p className='text-gray-600 mb-6'>
              This dashboard is only accessible to vendors. Your account role is
              "{user.role}".
            </p>
            <p className='text-sm text-gray-500 mb-6'>
              Please contact support if you believe this is an error, or sign up
              with a vendor account.
            </p>
            <button
              onClick={() => {
                // Clear tokens and redirect to auth
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/auth";
              }}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors'
            >
              Sign in with different account
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log("AuthGuard: Rendering children - user is authenticated");
  return <>{children}</>;
}
