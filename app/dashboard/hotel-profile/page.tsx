"use client";

import { useState, useEffect } from "react";
import { HotelAPI, createHotelFormData, HotelProfile } from "@/lib/hotelAPI";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Textarea,
  Button,
} from "@/components/ui";
import { useToast } from "@/contexts/ToastContext";

const HOTEL_CATEGORIES = [
  { value: "RESORT", label: "Resort" },
  { value: "HOMESTAY", label: "Homestay" },
  { value: "HOUSEBOAT", label: "Houseboat" },
  { value: "GUESTHOUSE", label: "Guesthouse" },
];

const AMENITIES_OPTIONS = [
  "wifi",
  "pool",
  "spa",
  "parking",
  "restaurant",
  "gym",
  "ac",
  "tv",
  "room_service",
  "laundry",
  "conference",
  "bar",
  "garden",
  "balcony",
];

export default function HotelProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hotelProfile, setHotelProfile] = useState<HotelProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageDescriptions, setImageDescriptions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    hotelName: "",
    category: "",
    totalRooms: "",
    amenities: [] as string[],
    cancellationPolicy: "",
    checkInTime: "14:00",
    checkOutTime: "11:00",
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchHotelProfile();
  }, []);

  const fetchHotelProfile = async () => {
    try {
      const response = await HotelAPI.getVendorHotelProfile();
      setHotelProfile(response.data);
      setFormData({
        hotelName: response.data.hotelName || "",
        category: response.data.category || "",
        totalRooms: response.data.totalRooms?.toString() || "",
        amenities: response.data.amenities || [],
        cancellationPolicy: response.data.cancellationPolicy || "",
        checkInTime: response.data.checkInTime || "14:00",
        checkOutTime: response.data.checkOutTime || "11:00",
      });
    } catch {
      console.log("No hotel profile found");
      setIsEditing(true); // Enable editing mode for new profile
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files);
    setImageDescriptions(files.map((_, index) => `Hotel image ${index + 1}`));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const hotelFormData = createHotelFormData(
        {
          ...formData,
          totalRooms: parseInt(formData.totalRooms),
        },
        selectedImages,
        imageDescriptions,
        selectedImages.map((_, index) => index === 0) // First image is primary
      );

      let response;
      if (hotelProfile) {
        response = await HotelAPI.updateHotelProfile(hotelFormData);
        showToast("Hotel profile updated successfully!", "success");
      } else {
        response = await HotelAPI.createHotelProfile(hotelFormData);
        showToast("Hotel profile created successfully!", "success");
      }

      setHotelProfile(response.data);
      setIsEditing(false);
      setSelectedImages([]);
      setImageDescriptions([]);
    } catch (error: unknown) {
      showToast(
        (error as Error).message || "Failed to save hotel profile",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      await HotelAPI.deleteHotelImage(imageId);
      showToast("Image deleted successfully!", "success");
      fetchHotelProfile(); // Refresh data
    } catch (error: unknown) {
      showToast((error as Error).message || "Failed to delete image", "error");
    }
  };

  if (!isEditing && !hotelProfile) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            {hotelProfile ? "Hotel Profile" : "Create Hotel Profile"}
          </h1>
          <p className='text-gray-600'>
            {hotelProfile
              ? "Manage your hotel information and settings"
              : "Set up your hotel profile to start receiving bookings"}
          </p>
        </div>
        {hotelProfile && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </div>

      {!isEditing ? (
        // Display Mode
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Hotel Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-gray-700'>
                    Hotel Name
                  </Label>
                  <p className='text-lg font-semibold'>
                    {hotelProfile?.hotelName}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-gray-700'>
                    Category
                  </Label>
                  <p className='text-lg capitalize'>
                    {hotelProfile?.category?.toLowerCase()}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-gray-700'>
                    Total Rooms
                  </Label>
                  <p className='text-lg'>{hotelProfile?.totalRooms}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-gray-700'>
                    Check-in / Check-out
                  </Label>
                  <p className='text-lg'>
                    {hotelProfile?.checkInTime} / {hotelProfile?.checkOutTime}
                  </p>
                </div>
              </div>

              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  Amenities
                </Label>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {hotelProfile?.amenities?.map((amenity: string) => (
                    <span
                      key={amenity}
                      className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label className='text-sm font-medium text-gray-700'>
                  Cancellation Policy
                </Label>
                <p className='text-gray-900 mt-1'>
                  {hotelProfile?.cancellationPolicy}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Hotel Images */}
          {hotelProfile?.images && hotelProfile.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hotel Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {hotelProfile.images.map(
                    (image: {
                      id: string;
                      imageUrl: string;
                      thumbnailUrl?: string;
                      description: string;
                      isPrimary: boolean;
                    }) => (
                      <div key={image.id} className='relative group'>
                        <Image
                          src={image.thumbnailUrl || image.imageUrl}
                          alt={image.description}
                          width={300}
                          height={200}
                          className='w-full h-48 object-cover rounded-lg'
                        />
                        {image.isPrimary && (
                          <span className='absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs'>
                            Primary
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          className='absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M6 18L18 6M6 6l12 12'
                            />
                          </svg>
                        </button>
                        <p className='text-sm text-gray-600 mt-2'>
                          {image.description}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Edit Mode
        <Card>
          <CardHeader>
            <CardTitle>
              {hotelProfile ? "Edit Hotel Profile" : "Create Hotel Profile"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <Label htmlFor='hotelName'>Hotel Name *</Label>
                  <Input
                    id='hotelName'
                    name='hotelName'
                    value={formData.hotelName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='category'>Category *</Label>
                  <Select
                    id='category'
                    name='category'
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value=''>Select Category</option>
                    {HOTEL_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor='totalRooms'>Total Rooms *</Label>
                  <Input
                    id='totalRooms'
                    name='totalRooms'
                    type='number'
                    min='1'
                    value={formData.totalRooms}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='checkInTime'>Check-in Time *</Label>
                  <Input
                    id='checkInTime'
                    name='checkInTime'
                    type='time'
                    value={formData.checkInTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='checkOutTime'>Check-out Time *</Label>
                  <Input
                    id='checkOutTime'
                    name='checkOutTime'
                    type='time'
                    value={formData.checkOutTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Amenities</Label>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-2 mt-2'>
                  {AMENITIES_OPTIONS.map((amenity) => (
                    <label
                      key={amenity}
                      className='flex items-center space-x-2'
                    >
                      <input
                        type='checkbox'
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                        className='rounded border-gray-300'
                      />
                      <span className='text-sm capitalize'>
                        {amenity.replace("_", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor='cancellationPolicy'>
                  Cancellation Policy *
                </Label>
                <Textarea
                  id='cancellationPolicy'
                  name='cancellationPolicy'
                  value={formData.cancellationPolicy}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder='Describe your cancellation policy...'
                  required
                />
              </div>

              <div>
                <Label htmlFor='images'>Upload Images</Label>
                <Input
                  id='images'
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={handleImageChange}
                  className='mt-1'
                />
                <p className='text-sm text-gray-500 mt-1'>
                  Upload high-quality images of your hotel. First image will be
                  set as primary.
                </p>
              </div>

              {selectedImages.length > 0 && (
                <div>
                  <Label>Image Descriptions</Label>
                  <div className='space-y-2 mt-2'>
                    {selectedImages.map((file, index) => (
                      <div key={index} className='flex items-center space-x-2'>
                        <span className='text-sm text-gray-600 w-32 truncate'>
                          {file.name}
                        </span>
                        <Input
                          value={imageDescriptions[index] || ""}
                          onChange={(e) => {
                            const newDescriptions = [...imageDescriptions];
                            newDescriptions[index] = e.target.value;
                            setImageDescriptions(newDescriptions);
                          }}
                          placeholder='Image description'
                          className='flex-1'
                        />
                        {index === 0 && (
                          <span className='text-xs text-blue-600'>Primary</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className='flex space-x-4'>
                <Button type='submit' disabled={isLoading}>
                  {isLoading
                    ? "Saving..."
                    : hotelProfile
                    ? "Update Profile"
                    : "Create Profile"}
                </Button>
                {hotelProfile && (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedImages([]);
                      setImageDescriptions([]);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
