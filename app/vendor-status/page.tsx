"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { VendorAPI, VendorStatus } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";

export default function VendorStatusPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [vendorStatus, setVendorStatus] = useState<VendorStatus | null>(null);
  const { showToast } = useToast();

  const fetchVendorStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check if user is authenticated and token is valid before making API call
      if (!user) {
        showToast("Please log in to view vendor status", "error");
        setIsLoading(false);
        return;
      }

      const response = await VendorAPI.getVendorStatus();
      setVendorStatus(response.data);
    } catch (error: unknown) {
      const errorMessage =
        (error as Error).message || "Failed to fetch vendor status";

      // Handle authentication errors specifically
      if (
        errorMessage.includes("Authentication failed") ||
        errorMessage.includes("session may have expired")
      ) {
        showToast("Your session has expired. Please log in again.", "error");
        // Clear tokens and redirect to auth page
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/auth";
        return;
      }

      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast, user]);

  useEffect(() => {
    // Only fetch vendor status if user is authenticated
    if (user) {
      fetchVendorStatus();
    } else {
      setIsLoading(false);
    }
  }, [fetchVendorStatus, user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600 bg-green-100";
      case "PENDING":
        return "text-yellow-600 bg-yellow-100";
      case "REJECTED":
        return "text-red-600 bg-red-100";
      case "SUSPENDED":
        return "text-red-600 bg-red-100";
      case "NOT_APPLIED":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Congratulations! Your vendor application has been approved. You can now access the vendor dashboard.";
      case "PENDING":
        return "Your vendor application is under review. We'll notify you once it's processed.";
      case "REJECTED":
        return "Your vendor application has been rejected. Please contact support for more information.";
      case "SUSPENDED":
        return "Your vendor account has been suspended. Please contact support for assistance.";
      case "NOT_APPLIED":
        return "You haven't applied for vendor status yet. Click below to start your application.";
      default:
        return "Unable to determine application status.";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "✅";
      case "PENDING":
        return "⏳";
      case "REJECTED":
        return "❌";
      case "SUSPENDED":
        return "🚫";
      case "NOT_APPLIED":
        return "📝";
      default:
        return "❓";
    }
  };

  if (!user) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <Card className='max-w-md w-full'>
          <CardContent className='text-center py-12'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Authentication Required
            </h3>
            <p className='text-gray-600 mb-4'>
              Please log in to check your vendor application status.
            </p>
            <Link href='/auth'>
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-2xl mx-auto px-4'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Vendor Application Status
          </h1>
          <p className='text-gray-600'>
            Check the current status of your vendor application
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='text-center'>
              <span className='text-4xl mr-2'>
                {getStatusIcon(vendorStatus?.status || "NOT_APPLIED")}
              </span>
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Status Badge */}
            <div className='text-center'>
              <span
                className={`inline-flex px-6 py-2 rounded-full text-lg font-medium ${getStatusColor(
                  vendorStatus?.status || "NOT_APPLIED"
                )}`}
              >
                {vendorStatus?.status || "NOT_APPLIED"}
              </span>
            </div>

            {/* Status Message */}
            <div className='text-center'>
              <p className='text-gray-700 text-lg'>
                {getStatusMessage(vendorStatus?.status || "NOT_APPLIED")}
              </p>
            </div>

            {/* Application Details */}
            {vendorStatus && vendorStatus.status !== "NOT_APPLIED" && (
              <div className='bg-gray-50 p-6 rounded-lg space-y-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Application Details
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {vendorStatus.businessName && (
                    <div>
                      <p className='text-sm font-medium text-gray-700'>
                        Business Name
                      </p>
                      <p className='text-gray-900'>
                        {vendorStatus.businessName}
                      </p>
                    </div>
                  )}
                  {vendorStatus.vendorType && (
                    <div>
                      <p className='text-sm font-medium text-gray-700'>
                        Business Type
                      </p>
                      <p className='text-gray-900'>{vendorStatus.vendorType}</p>
                    </div>
                  )}
                  {vendorStatus.createdAt && (
                    <div>
                      <p className='text-sm font-medium text-gray-700'>
                        Applied On
                      </p>
                      <p className='text-gray-900'>
                        {new Date(vendorStatus.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
                {vendorStatus.note && (
                  <div>
                    <p className='text-sm font-medium text-gray-700'>Note</p>
                    <p className='text-gray-900'>{vendorStatus.note}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className='flex justify-center space-x-4'>
              {vendorStatus?.status === "NOT_APPLIED" && (
                <Link href='/vendor-register'>
                  <Button size='lg'>Apply for Vendor Status</Button>
                </Link>
              )}

              {vendorStatus?.status === "APPROVED" &&
                user.role === "VENDOR" && (
                  <Link href='/dashboard'>
                    <Button size='lg'>Go to Dashboard</Button>
                  </Link>
                )}

              {vendorStatus?.status === "REJECTED" && (
                <Link href='/vendor-register'>
                  <Button size='lg'>Reapply</Button>
                </Link>
              )}

              <Button onClick={fetchVendorStatus} variant='outline'>
                Refresh Status
              </Button>
            </div>

            {/* Additional Info */}
            <div className='text-center'>
              <button
                onClick={() => {
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("refreshToken");
                  window.location.reload();
                }}
                className='w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg'
              >
                Sign in
              </button>
            </div>
          </CardContent>
        </Card>

        <div className='mt-6 text-center'>
          <Link href='/' className='text-blue-600 hover:text-blue-800'>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
