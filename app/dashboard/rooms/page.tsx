"use client";

import { useState, useEffect, useCallback } from "react";
import { HotelAPI, Room, AddRoomData } from "@/lib/hotelAPI";
import { ImageUpload } from "@/components/ImageUpload";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Button,
  Badge,
} from "@/components/ui";
import { useToast } from "@/contexts/ToastContext";

const ROOM_TYPES = [
  { value: "STANDARD", label: "Standard" },
  { value: "DELUXE", label: "Deluxe" },
  { value: "SUITE", label: "Suite" },
  { value: "DORMITORY", label: "Dormitory" },
];

const ROOM_AMENITIES = [
  "tv",
  "ac",
  "wifi",
  "minibar",
  "balcony",
  "view",
  "bathroom",
  "towels",
  "toiletries",
  "desk",
  "chair",
  "wardrobe",
  "safe",
];

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [images, setImages] = useState<
    { file: File; description: string; isPrimary: boolean }[]
  >([]);
  const [formData, setFormData] = useState({
    roomType: "" as "STANDARD" | "DELUXE" | "SUITE" | "DORMITORY" | "",
    roomNumber: "",
    capacity: "",
    basePrice: "",
    summerPrice: "",
    winterPrice: "",
    amenities: [] as string[],
  });
  const { showToast } = useToast();

  const fetchRooms = useCallback(
    async (page: number = 1) => {
      try {
        setIsLoading(true);
        const response = await HotelAPI.getVendorRooms({ page, limit: 10 });
        setRooms(response.data.rooms);
        setPagination(response.data.pagination);
      } catch (error: unknown) {
        const errorMessage =
          (error as Error).message || "Failed to fetch rooms";

        // Don't show toast if it's an authentication error (user will be redirected)
        if (
          !errorMessage.includes("Session expired") &&
          !errorMessage.includes("Authentication failed")
        ) {
          showToast(errorMessage, "error");
        }

        // Reset rooms state on error to prevent infinite loops
        setRooms([]);
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const resetForm = () => {
    setFormData({
      roomType: "",
      roomNumber: "",
      capacity: "",
      basePrice: "",
      summerPrice: "",
      winterPrice: "",
      amenities: [],
    });
    setImages([]);
    setEditingRoom(null);
    setShowAddRoom(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

  const handleImagesChange = (
    files: File[],
    descriptions: string[],
    isPrimary: boolean[]
  ) => {
    const imageData = files.map((file, index) => ({
      file,
      description: descriptions[index] || "",
      isPrimary: isPrimary[index] || false,
    }));
    setImages(imageData);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      roomType: room.roomType,
      roomNumber: room.roomNumber,
      capacity: room.capacity.toString(),
      basePrice: room.basePrice.toString(),
      summerPrice: room.summerPrice?.toString() || "",
      winterPrice: room.winterPrice?.toString() || "",
      amenities: room.amenities,
    });
    setShowAddRoom(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare room data
      const roomData: AddRoomData = {
        roomType: formData.roomType as
          | "STANDARD"
          | "DELUXE"
          | "SUITE"
          | "DORMITORY",
        capacity: parseInt(formData.capacity),
        basePrice: parseFloat(formData.basePrice),
        roomNumber: formData.roomNumber || undefined,
        summerPrice: formData.summerPrice
          ? parseFloat(formData.summerPrice)
          : undefined,
        winterPrice: formData.winterPrice
          ? parseFloat(formData.winterPrice)
          : undefined,
        amenities: formData.amenities,
        imageType: "room",
        descriptions: images.map((img) => img.description),
        isPrimary: images.map((img) => img.isPrimary.toString()),
      };

      let response;
      if (editingRoom) {
        response = await HotelAPI.updateRoom(
          editingRoom.id,
          roomData,
          images.map((img) => img.file)
        );
        showToast("Room updated successfully!", "success");
      } else {
        response = await HotelAPI.addRoom(
          roomData,
          images.map((img) => img.file)
        );
        showToast("Room added successfully!", "success");
      }

      // Handle any image upload errors
      if (response.data.imageErrors && response.data.imageErrors.length > 0) {
        const errorMessages = response.data.imageErrors
          .map((err) => `Image ${err.index + 1}: ${err.error}`)
          .join(", ");
        showToast(
          `Room saved with some image issues: ${errorMessages}`,
          "warning"
        );
      }

      resetForm();
      fetchRooms();
    } catch (error: unknown) {
      showToast((error as Error).message || "Failed to save room", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      await HotelAPI.deleteRoom(roomId);
      showToast("Room deleted successfully!", "success");
      fetchRooms();
    } catch (error: unknown) {
      showToast((error as Error).message || "Failed to delete room", "error");
    }
  };

  const handleToggleAvailability = async (roomId: string) => {
    try {
      await HotelAPI.toggleRoomAvailability(roomId);
      showToast("Room availability updated!", "success");
      fetchRooms();
    } catch (error: unknown) {
      showToast(
        (error as Error).message || "Failed to update room availability",
        "error"
      );
    }
  };

  if (isLoading && rooms.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Rooms Management</h1>
          <p className='text-gray-600'>
            Manage your hotel rooms, pricing, and availability
          </p>
        </div>
        <Button onClick={() => setShowAddRoom(true)}>Add New Room</Button>
      </div>

      {showAddRoom && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRoom ? "Edit Room" : "Add New Room"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div>
                  <Label htmlFor='roomType'>Room Type *</Label>
                  <Select
                    id='roomType'
                    name='roomType'
                    value={formData.roomType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value=''>Select Room Type</option>
                    {ROOM_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor='roomNumber'>Room Number *</Label>
                  <Input
                    id='roomNumber'
                    name='roomNumber'
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='capacity'>Capacity *</Label>
                  <Input
                    id='capacity'
                    name='capacity'
                    type='number'
                    min='1'
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='basePrice'>Base Price (₹) *</Label>
                  <Input
                    id='basePrice'
                    name='basePrice'
                    type='number'
                    min='0'
                    step='0.01'
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='summerPrice'>Summer Price (₹)</Label>
                  <Input
                    id='summerPrice'
                    name='summerPrice'
                    type='number'
                    min='0'
                    step='0.01'
                    value={formData.summerPrice}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor='winterPrice'>Winter Price (₹)</Label>
                  <Input
                    id='winterPrice'
                    name='winterPrice'
                    type='number'
                    min='0'
                    step='0.01'
                    value={formData.winterPrice}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Label>Room Amenities</Label>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-2 mt-2'>
                  {ROOM_AMENITIES.map((amenity) => (
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
                      <span className='text-sm capitalize'>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <ImageUpload
                onImagesChange={handleImagesChange}
                maxImages={5}
                existingImages={
                  editingRoom?.images?.map((img) => ({
                    id: img.id,
                    imageUrl: img.imageUrl,
                    description: img.description,
                    isPrimary: img.isPrimary,
                  })) || []
                }
                onDeleteExisting={async (imageId: string) => {
                  try {
                    await HotelAPI.deleteRoomImage(imageId);
                    showToast("Image deleted successfully!", "success");
                    fetchRooms();
                  } catch (error: unknown) {
                    showToast(
                      (error as Error).message || "Failed to delete image",
                      "error"
                    );
                  }
                }}
              />

              <div className='flex space-x-4'>
                <Button type='submit' disabled={isLoading}>
                  {isLoading
                    ? "Saving..."
                    : editingRoom
                    ? "Update Room"
                    : "Add Room"}
                </Button>
                <Button type='button' variant='outline' onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Rooms List */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {rooms && rooms.length > 0
          ? rooms.map((room) => (
              <Card key={room.id} className='relative'>
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div>
                      <CardTitle className='text-lg'>
                        {room.roomType} - {room.roomNumber}
                      </CardTitle>
                      <p className='text-sm text-gray-600'>
                        Capacity: {room.capacity} guests
                      </p>
                    </div>
                    <Badge
                      variant={room.isAvailable ? "default" : "destructive"}
                    >
                      {room.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {/* Room Image */}
                    {room.images && room.images.length > 0 && (
                      <div className='relative w-full h-32 bg-gray-200 rounded-lg overflow-hidden'>
                        <Image
                          src={
                            room.images.find((img) => img.isPrimary)
                              ?.thumbnailUrl ||
                            room.images.find((img) => img.isPrimary)
                              ?.imageUrl ||
                            room.images[0]?.imageUrl
                          }
                          alt={`${room.roomType} ${room.roomNumber}`}
                          fill
                          className='object-cover'
                          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                          onError={(e) => {
                            console.error("Image failed to load:", e);
                          }}
                        />
                      </div>
                    )}

                    {/* Pricing */}
                    <div>
                      <p className='text-lg font-semibold'>
                        ₹{room.basePrice}/night
                      </p>
                      {(room.summerPrice || room.winterPrice) && (
                        <div className='text-sm text-gray-600'>
                          {room.summerPrice && (
                            <span>Summer: ₹{room.summerPrice} </span>
                          )}
                          {room.winterPrice && (
                            <span>Winter: ₹{room.winterPrice}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Amenities */}
                    {room.amenities.length > 0 && (
                      <div>
                        <p className='text-sm font-medium text-gray-700 mb-1'>
                          Amenities:
                        </p>
                        <div className='flex flex-wrap gap-1'>
                          {room.amenities.slice(0, 4).map((amenity) => (
                            <span
                              key={amenity}
                              className='px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs'
                            >
                              {amenity}
                            </span>
                          ))}
                          {room.amenities.length > 4 && (
                            <span className='text-xs text-gray-500'>
                              +{room.amenities.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className='flex space-x-2 pt-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleEditRoom(room)}
                      >
                        Edit
                      </Button>
                      <Button
                        size='sm'
                        variant={room.isAvailable ? "secondary" : "default"}
                        onClick={() => handleToggleAvailability(room.id)}
                      >
                        {room.isAvailable ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() => handleDeleteRoom(room.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : null}
      </div>

      {rooms && rooms.length === 0 && !isLoading && (
        <Card>
          <CardContent className='text-center py-12'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-gray-400'
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
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No rooms found
            </h3>
            <p className='text-gray-600 mb-4'>
              Start by adding your first room to begin receiving bookings.
            </p>
            <Button onClick={() => setShowAddRoom(true)}>
              Add Your First Room
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination Info */}
      {rooms && rooms.length > 0 && (
        <div className='flex justify-between items-center mt-6 p-4 bg-gray-50 rounded-lg'>
          <span className='text-sm text-gray-600'>
            Showing {rooms.length} of {pagination.total} rooms
          </span>
          <span className='text-sm text-gray-600'>
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
