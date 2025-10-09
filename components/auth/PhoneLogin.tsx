"use client";

import { useState } from "react";
import { AuthAPI } from "@/lib/auth";

interface PhoneLoginProps {
  onOTPSent: (data: {
    phoneNumber: string;
    verificationId: string;
    timeout: string;
  }) => void;
}

export function PhoneLogin({ onOTPSent }: PhoneLoginProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic validation for 10-digit phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthAPI.sendOTP(phoneNumber);

      if (response.success) {
        onOTPSent({
          phoneNumber,
          verificationId: response.data.verificationId,
          timeout: response.data.timeout,
        });
      } else {
        setError(response.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div>
        <label
          htmlFor='phoneNumber'
          className='block text-sm font-medium text-gray-700'
        >
          Phone Number
        </label>
        <div className='mt-1 relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <span className='text-gray-500 sm:text-sm'>+91</span>
          </div>
          <input
            id='phoneNumber'
            name='phoneNumber'
            type='tel'
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className='appearance-none block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
            placeholder='Enter your phone number'
            maxLength={10}
          />
        </div>
        {error && (
          <p className='mt-2 text-sm text-red-600' role='alert'>
            {error}
          </p>
        )}
      </div>

      <div>
        <button
          type='submit'
          disabled={isLoading || !phoneNumber}
          className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? (
            <div className='flex items-center'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              Sending OTP...
            </div>
          ) : (
            "Send OTP"
          )}
        </button>
      </div>

      <div className='text-xs text-gray-500 text-center'>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </div>
    </form>
  );
}
