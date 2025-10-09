"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { VendorAPI, VendorRegistrationData } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Button,
  Textarea,
} from "@/components/ui";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function VendorRegistrationPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState<VendorRegistrationData>({
    businessName: "",
    ownerName: "",
    contactNumbers: [""],
    email: "",
    businessAddress: "",
    googleMapsLink: "",
    gstNumber: "",
    panNumber: "",
    aadhaarNumber: "",
    vendorType: "HOTEL",
    bankDetails: {
      bankName: "",
      branchName: "",
      accountNumber: "",
      ifscCode: "",
      accountHolder: "",
    },
  });

  // Check if user already has a vendor application
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!user) return;

      try {
        const response = await VendorAPI.getVendorStatus();
        if (response.data.status !== "NOT_APPLIED") {
          setHasExistingApplication(true);
        }
      } catch (error) {
        // If there's an error checking status, allow them to proceed
        console.log("Could not check vendor status:", error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkExistingApplication();
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("bankDetails.")) {
      const bankField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [bankField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleContactNumberChange = (index: number, value: string) => {
    const newContactNumbers = [...formData.contactNumbers];
    newContactNumbers[index] = value;
    setFormData((prev) => ({ ...prev, contactNumbers: newContactNumbers }));
  };

  const addContactNumber = () => {
    setFormData((prev) => ({
      ...prev,
      contactNumbers: [...prev.contactNumbers, ""],
    }));
  };

  const removeContactNumber = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      contactNumbers: prev.contactNumbers.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Filter out empty contact numbers
      const filteredData = {
        ...formData,
        contactNumbers: formData.contactNumbers.filter(
          (num) => num.trim() !== ""
        ),
      };

      console.log("Submitting vendor registration with data:", filteredData);
      console.log("Current user:", user);

      const response = await VendorAPI.registerVendor(filteredData);
      console.log("Registration response:", response);

      showToast(
        "Vendor application submitted successfully! Pending admin approval.",
        "success"
      );
      router.push("/vendor-status");
    } catch (error: unknown) {
      console.error("Vendor registration error:", error);

      let errorMessage =
        (error as Error).message || "Failed to submit vendor application";

      // Provide more specific error messages
      if (
        errorMessage.includes("CUSTOMER") ||
        errorMessage.includes("customer")
      ) {
        errorMessage = `Registration Error: Your account role (${
          user?.role || "unknown"
        }) may not be eligible for vendor registration. Please contact support if you believe this is an error.`;
      } else if (
        errorMessage.includes("401") ||
        errorMessage.includes("Authentication")
      ) {
        errorMessage =
          "Session expired. Please log out and log back in to try again.";
      } else if (
        errorMessage.includes("403") ||
        errorMessage.includes("forbidden")
      ) {
        errorMessage =
          "Access denied. Please ensure you're logged in with the correct account.";
      }

      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
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
              Please log in to apply for vendor status.
            </p>
            <Link href='/auth'>
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is already a vendor
  if (user.role === "VENDOR") {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <Card className='max-w-md w-full'>
          <CardContent className='text-center py-12'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Already a Vendor
            </h3>
            <p className='text-gray-600 mb-4'>
              You are already approved as a vendor. You can access your
              dashboard.
            </p>
            <Link href='/dashboard'>
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading while checking existing application
  if (isCheckingStatus) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  // If user already has an application, redirect to status page
  if (hasExistingApplication) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <Card className='max-w-md w-full'>
          <CardContent className='text-center py-12'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Application Already Submitted
            </h3>
            <p className='text-gray-600 mb-4'>
              You have already submitted a vendor application. Check your status
              below.
            </p>
            <Link href='/vendor-status'>
              <Button>Check Application Status</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Become a Vendor
          </h1>
          <p className='text-gray-600'>
            Join Sojourn as a hotel vendor and start managing your property
          </p>
          <div className='mt-2 text-sm text-gray-500'>
            Current user: {user.phoneNumber} | Role: {user.role} | Status:{" "}
            {user.isActive ? "Active" : "Inactive"}
          </div>
          {user.role !== "CUSTOMER" && (
            <div className='mt-2 p-3 bg-yellow-100 border border-yellow-300 rounded-md'>
              <p className='text-sm text-yellow-800'>
                ⚠️ Note: Your current role is &quot;{user.role}&quot;. Vendor
                registration typically requires &quot;CUSTOMER&quot; role.
              </p>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Registration Application</CardTitle>
            <p className='text-sm text-gray-600'>
              Please fill in all required information. Your application will be
              reviewed by our admin team.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Basic Business Information */}
              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>
                  Business Information
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <Label htmlFor='businessName'>Business Name *</Label>
                    <Input
                      id='businessName'
                      name='businessName'
                      value={formData.businessName}
                      onChange={handleInputChange}
                      required
                      placeholder='e.g., Grand Palace Hotels'
                    />
                  </div>

                  <div>
                    <Label htmlFor='ownerName'>Owner Name *</Label>
                    <Input
                      id='ownerName'
                      name='ownerName'
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      required
                      placeholder='e.g., John Doe'
                    />
                  </div>

                  <div>
                    <Label htmlFor='email'>Email *</Label>
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder='contact@grandpalace.com'
                    />
                  </div>
                </div>

                <div className='mt-4'>
                  <Label htmlFor='businessAddress'>Business Address *</Label>
                  <Textarea
                    id='businessAddress'
                    name='businessAddress'
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    rows={3}
                    required
                    placeholder='123 Hotel Street, Mumbai, Maharashtra 400001'
                  />
                </div>

                <div className='mt-4'>
                  <Label htmlFor='googleMapsLink'>
                    Google Maps Link (Optional)
                  </Label>
                  <Input
                    id='googleMapsLink'
                    name='googleMapsLink'
                    type='url'
                    value={formData.googleMapsLink}
                    onChange={handleInputChange}
                    placeholder='https://maps.google.com/place/your-business'
                  />
                </div>
              </div>

              {/* Contact Numbers */}
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <Label>Contact Numbers *</Label>
                  <Button type='button' size='sm' onClick={addContactNumber}>
                    Add Number
                  </Button>
                </div>
                <div className='space-y-2'>
                  {formData.contactNumbers.map((number, index) => (
                    <div key={index} className='flex space-x-2'>
                      <Input
                        value={number}
                        onChange={(e) =>
                          handleContactNumberChange(index, e.target.value)
                        }
                        placeholder='+91-9876543214'
                        className='flex-1'
                        required={index === 0}
                      />
                      {formData.contactNumbers.length > 1 && (
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => removeContactNumber(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Documents */}
              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>
                  Legal Documents
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div>
                    <Label htmlFor='gstNumber'>GST Number *</Label>
                    <Input
                      id='gstNumber'
                      name='gstNumber'
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      required
                      placeholder='27AAAAA0000A1Z5'
                    />
                  </div>

                  <div>
                    <Label htmlFor='panNumber'>PAN Number *</Label>
                    <Input
                      id='panNumber'
                      name='panNumber'
                      value={formData.panNumber}
                      onChange={handleInputChange}
                      required
                      placeholder='AAAAA0000A'
                    />
                  </div>

                  <div>
                    <Label htmlFor='aadhaarNumber'>Aadhaar Number *</Label>
                    <Input
                      id='aadhaarNumber'
                      name='aadhaarNumber'
                      value={formData.aadhaarNumber}
                      onChange={handleInputChange}
                      required
                      placeholder='1234-5678-9012'
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>
                  Bank Details
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <Label htmlFor='bankDetails.bankName'>Bank Name *</Label>
                    <Input
                      id='bankDetails.bankName'
                      name='bankDetails.bankName'
                      value={formData.bankDetails.bankName}
                      onChange={handleInputChange}
                      required
                      placeholder='State Bank of India'
                    />
                  </div>

                  <div>
                    <Label htmlFor='bankDetails.branchName'>
                      Branch Name *
                    </Label>
                    <Input
                      id='bankDetails.branchName'
                      name='bankDetails.branchName'
                      value={formData.bankDetails.branchName}
                      onChange={handleInputChange}
                      required
                      placeholder='Main Branch'
                    />
                  </div>

                  <div>
                    <Label htmlFor='bankDetails.accountHolder'>
                      Account Holder Name *
                    </Label>
                    <Input
                      id='bankDetails.accountHolder'
                      name='bankDetails.accountHolder'
                      value={formData.bankDetails.accountHolder}
                      onChange={handleInputChange}
                      required
                      placeholder='John Doe'
                    />
                  </div>

                  <div>
                    <Label htmlFor='bankDetails.accountNumber'>
                      Account Number *
                    </Label>
                    <Input
                      id='bankDetails.accountNumber'
                      name='bankDetails.accountNumber'
                      value={formData.bankDetails.accountNumber}
                      onChange={handleInputChange}
                      required
                      placeholder='123456789012'
                    />
                  </div>

                  <div>
                    <Label htmlFor='bankDetails.ifscCode'>IFSC Code *</Label>
                    <Input
                      id='bankDetails.ifscCode'
                      name='bankDetails.ifscCode'
                      value={formData.bankDetails.ifscCode}
                      onChange={handleInputChange}
                      required
                      placeholder='SBIN0000123'
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className='flex justify-between items-center pt-6 border-t'>
                <Link href='/'>
                  <Button type='button' variant='outline'>
                    Cancel
                  </Button>
                </Link>
                <Button type='submit' disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600'>
            Already applied?{" "}
            <Link
              href='/vendor-status'
              className='text-blue-600 hover:text-blue-800'
            >
              Check your application status
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
