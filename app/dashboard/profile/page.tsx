"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { VendorAPI, VendorProfile } from "@/lib/auth";
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

export default function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(
    null
  );
  const { showToast } = useToast();
  const [profileForm, setProfileForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    businessAddress: "",
    googleMapsLink: "",
    gstNumber: "",
    panNumber: "",
    aadhaarNumber: "",
    contactNumbers: [] as string[],
  });

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const fetchVendorProfile = async () => {
    try {
      setIsLoading(true);
      const response = await VendorAPI.getVendorProfile();
      setVendorProfile(response.data);
      setProfileForm({
        businessName: response.data.businessName || "",
        ownerName: response.data.ownerName || "",
        email: response.data.email || "",
        businessAddress: response.data.businessAddress || "",
        googleMapsLink: response.data.googleMapsLink || "",
        gstNumber: response.data.gstNumber || "",
        panNumber: response.data.panNumber || "",
        aadhaarNumber: response.data.aadhaarNumber || "",
        contactNumbers: response.data.contactNumbers || [],
      });
    } catch (error: any) {
      showToast(error.message || "Failed to fetch vendor profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactNumberChange = (index: number, value: string) => {
    const newContactNumbers = [...profileForm.contactNumbers];
    newContactNumbers[index] = value;
    setProfileForm((prev) => ({ ...prev, contactNumbers: newContactNumbers }));
  };

  const addContactNumber = () => {
    setProfileForm((prev) => ({
      ...prev,
      contactNumbers: [...prev.contactNumbers, ""],
    }));
  };

  const removeContactNumber = (index: number) => {
    setProfileForm((prev) => ({
      ...prev,
      contactNumbers: prev.contactNumbers.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await VendorAPI.updateVendorProfile({
        ...profileForm,
        contactNumbers: profileForm.contactNumbers.filter(
          (num) => num.trim() !== ""
        ),
      });
      setVendorProfile(response.data);
      setIsEditing(false);
      showToast("Profile updated successfully!", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to update profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

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
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (isLoading && !vendorProfile) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!vendorProfile) {
    return (
      <Card>
        <CardContent className='text-center py-12'>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Vendor Profile Not Found
          </h3>
          <p className='text-gray-600'>
            Unable to load your vendor profile. Please contact support.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Vendor Profile</h1>
          <p className='text-gray-600'>
            Manage your business information and settings
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>
                Your vendor account status:
              </p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  vendorProfile.status
                )}`}
              >
                {vendorProfile.status}
              </span>
            </div>
            <div className='text-right'>
              <p className='text-sm text-gray-600'>Vendor Type:</p>
              <p className='font-medium'>{vendorProfile.vendorType}</p>
            </div>
          </div>
          {vendorProfile.status === "PENDING" && (
            <div className='mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md'>
              <p className='text-sm text-yellow-800'>
                Your account is pending approval. You'll be notified once it's
                reviewed.
              </p>
            </div>
          )}
          {vendorProfile.status === "REJECTED" && (
            <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-md'>
              <p className='text-sm text-red-800'>
                Your account application was rejected. Please contact support
                for more information.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Information */}
      {!isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  Business Name
                </Label>
                <p className='text-lg font-semibold'>
                  {vendorProfile.businessName}
                </p>
              </div>
              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  Owner Name
                </Label>
                <p className='text-lg'>{vendorProfile.ownerName}</p>
              </div>
              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  Email
                </Label>
                <p className='text-lg'>{vendorProfile.email}</p>
              </div>
              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  Commission Rate
                </Label>
                <p className='text-lg'>{vendorProfile.commissionRate}%</p>
              </div>
            </div>

            <div>
              <Label className='text-sm font-medium text-gray-700'>
                Business Address
              </Label>
              <p className='text-gray-900 mt-1'>
                {vendorProfile.businessAddress}
              </p>
            </div>

            {vendorProfile.googleMapsLink && (
              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  Google Maps Link
                </Label>
                <a
                  href={vendorProfile.googleMapsLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:text-blue-800 break-all'
                >
                  {vendorProfile.googleMapsLink}
                </a>
              </div>
            )}

            <div>
              <Label className='text-sm font-medium text-gray-700'>
                Contact Numbers
              </Label>
              <div className='flex flex-wrap gap-2 mt-1'>
                {vendorProfile.contactNumbers.map((number, index) => (
                  <span
                    key={index}
                    className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
                  >
                    {number}
                  </span>
                ))}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  GST Number
                </Label>
                <p className='text-sm text-gray-900'>
                  {vendorProfile.gstNumber}
                </p>
              </div>
              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  PAN Number
                </Label>
                <p className='text-sm text-gray-900'>
                  {vendorProfile.panNumber}
                </p>
              </div>
              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  Aadhaar Number
                </Label>
                <p className='text-sm text-gray-900'>
                  ****-****-{vendorProfile.aadhaarNumber.slice(-4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Edit Mode
        <Card>
          <CardHeader>
            <CardTitle>Edit Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <Label htmlFor='businessName'>Business Name *</Label>
                  <Input
                    id='businessName'
                    name='businessName'
                    value={profileForm.businessName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='ownerName'>Owner Name *</Label>
                  <Input
                    id='ownerName'
                    name='ownerName'
                    value={profileForm.ownerName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='email'>Email *</Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    value={profileForm.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='gstNumber'>GST Number *</Label>
                  <Input
                    id='gstNumber'
                    name='gstNumber'
                    value={profileForm.gstNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='panNumber'>PAN Number *</Label>
                  <Input
                    id='panNumber'
                    name='panNumber'
                    value={profileForm.panNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='aadhaarNumber'>Aadhaar Number *</Label>
                  <Input
                    id='aadhaarNumber'
                    name='aadhaarNumber'
                    value={profileForm.aadhaarNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='businessAddress'>Business Address *</Label>
                <Textarea
                  id='businessAddress'
                  name='businessAddress'
                  value={profileForm.businessAddress}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor='googleMapsLink'>Google Maps Link</Label>
                <Input
                  id='googleMapsLink'
                  name='googleMapsLink'
                  type='url'
                  value={profileForm.googleMapsLink}
                  onChange={handleInputChange}
                  placeholder='https://maps.google.com/...'
                />
              </div>

              <div>
                <div className='flex justify-between items-center mb-2'>
                  <Label>Contact Numbers</Label>
                  <Button type='button' size='sm' onClick={addContactNumber}>
                    Add Number
                  </Button>
                </div>
                <div className='space-y-2'>
                  {profileForm.contactNumbers.map((number, index) => (
                    <div key={index} className='flex space-x-2'>
                      <Input
                        value={number}
                        onChange={(e) =>
                          handleContactNumberChange(index, e.target.value)
                        }
                        placeholder='Contact number'
                        className='flex-1'
                      />
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => removeContactNumber(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex space-x-4'>
                <Button type='submit' disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Bank Details */}
      {vendorProfile.bankDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  Account Holder Name
                </Label>
                <p className='text-sm text-gray-900'>
                  {vendorProfile.bankDetails.accountHolderName}
                </p>
              </div>
              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  Account Number
                </Label>
                <p className='text-sm text-gray-900'>
                  ****-****-{vendorProfile.bankDetails.accountNumber.slice(-4)}
                </p>
              </div>
              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  Bank Name
                </Label>
                <p className='text-sm text-gray-900'>
                  {vendorProfile.bankDetails.bankName}
                </p>
              </div>
              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  IFSC Code
                </Label>
                <p className='text-sm text-gray-900'>
                  {vendorProfile.bankDetails.ifscCode}
                </p>
              </div>
              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  Branch Name
                </Label>
                <p className='text-sm text-gray-900'>
                  {vendorProfile.bankDetails.branchName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
