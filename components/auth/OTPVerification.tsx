"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthAPI, TokenStorage } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

interface OTPVerificationProps {
  verificationData: {
    phoneNumber: string;
    verificationId: string;
    timeout: string;
  };
  onBackToPhone: () => void;
}

export function OTPVerification({
  verificationData,
  onBackToPhone,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(parseInt(verificationData.timeout));
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      setError("Please enter the complete 4-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthAPI.verifyOTP(
        verificationData.phoneNumber,
        verificationData.verificationId,
        otpCode
      );

      if (response.success) {
        // Store tokens
        TokenStorage.setTokens(
          response.data.accessToken,
          response.data.refreshToken
        );

        // Update AuthContext with user information
        login(
          response.data.accessToken,
          response.data.refreshToken,
          response.data.user
        );

        // Redirect based on user role and intent
        if (response.data.user.role === "VENDOR") {
          // Existing vendors go to dashboard
          router.push("/dashboard");
        } else {
          // New users (CUSTOMER role) go to vendor registration
          router.push("/vendor-register");
        }
      } else {
        setError(response.message || "Invalid OTP. Please try again.");
        setOtp(["", "", "", ""]);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError("Failed to verify OTP. Please try again.");
      setOtp(["", "", "", ""]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError("");

    try {
      const response = await AuthAPI.sendOTP(verificationData.phoneNumber);

      if (response.success) {
        setTimeLeft(parseInt(response.data.timeout));
        setOtp(["", "", "", ""]);
        // You might want to update the verificationId here
      } else {
        setError("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='text-center'>
        <p className='text-sm text-gray-600'>
          OTP sent to +91 {verificationData.phoneNumber}
        </p>
        <button
          type='button'
          onClick={onBackToPhone}
          className='text-indigo-600 hover:text-indigo-500 text-sm font-medium'
        >
          Change number
        </button>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 text-center mb-4'>
          Enter 4-digit OTP
        </label>
        <div className='flex justify-center space-x-2'>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type='text'
              inputMode='numeric'
              pattern='[0-9]*'
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className='w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
              maxLength={1}
            />
          ))}
        </div>
        {error && (
          <p className='mt-2 text-sm text-red-600 text-center' role='alert'>
            {error}
          </p>
        )}
      </div>

      <div className='text-center'>
        {timeLeft > 0 ? (
          <p className='text-sm text-gray-600'>
            Resend OTP in {formatTime(timeLeft)}
          </p>
        ) : (
          <button
            type='button'
            onClick={handleResendOTP}
            disabled={isResending}
            className='text-indigo-600 hover:text-indigo-500 text-sm font-medium disabled:opacity-50'
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        )}
      </div>

      <div>
        <button
          type='submit'
          disabled={isLoading || otp.join("").length !== 4}
          className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? (
            <div className='flex items-center'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              Verifying...
            </div>
          ) : (
            "Verify OTP"
          )}
        </button>
      </div>
    </form>
  );
}
