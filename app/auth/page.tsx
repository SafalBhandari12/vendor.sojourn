"use client";

import { useState } from "react";
import { PhoneLogin } from "@/components/auth/PhoneLogin";
import { OTPVerification } from "../../components/auth/OTPVerification";

interface VerificationData {
  phoneNumber: string;
  verificationId: string;
  timeout: string;
}

export default function AuthPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [verificationData, setVerificationData] =
    useState<VerificationData | null>(null);

  const handleOTPSent = (data: VerificationData) => {
    setVerificationData(data);
    setStep("otp");
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setVerificationData(null);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
            Welcome to Sojourn
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            {step === "phone"
              ? "Enter your phone number to get started"
              : "Enter the OTP sent to your phone"}
          </p>
        </div>

        <div className='bg-white py-8 px-6 shadow-xl rounded-lg'>
          {step === "phone" ? (
            <PhoneLogin onOTPSent={handleOTPSent} />
          ) : (
            <OTPVerification
              verificationData={verificationData!}
              onBackToPhone={handleBackToPhone}
            />
          )}
        </div>

        {step === "phone" && (
          <div className='text-center'>
            <p className='text-sm text-gray-600'>
              New hotel owner? After logging in, you can apply for vendor status
              to manage your property.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
