const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error(
    "NEXT_PUBLIC_BACKEND_URL is not defined in environment variables"
  );
}

// Types for Hotel Management
export interface HotelProfile {
  id: string;
  hotelName: string;
  category: "RESORT" | "HOMESTAY" | "HOUSEBOAT" | "GUESTHOUSE";
  totalRooms: number;
  amenities: string[];
  cancellationPolicy: string;
  checkInTime: string;
  checkOutTime: string;
  vendor: {
    id: string;
    businessName: string;
    ownerName: string;
    email: string;
    businessAddress: string;
    contactNumbers: string[];
  };
  images: HotelImage[];
  rooms: Room[];
  createdAt: string;
  updatedAt: string;
}

export interface HotelImage {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  description: string;
  isPrimary: boolean;
  imageType: "property" | "room" | "amenity" | "food";
}

export interface Room {
  id: string;
  roomType: "STANDARD" | "DELUXE" | "SUITE" | "DORMITORY";
  roomNumber: string;
  capacity: number;
  basePrice: number;
  summerPrice?: number;
  winterPrice?: number;
  amenities: string[];
  isAvailable: boolean;
  images: HotelImage[];
  hotelId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  booking: {
    id: string;
    totalAmount: number;
    commissionAmount: number;
  };
  hotelProfile: {
    hotelName: string;
    vendor: {
      businessName: string;
    };
  };
  room: {
    roomType: string;
    roomNumber: string;
  };
  customer?: {
    phoneNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    hotels?: T[];
    rooms?: T[];
    bookings?: T[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    };
  };
}

// Utility function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Handle API responses with error handling
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();

    if (response.status === 401) {
      throw new Error("Authentication failed: Please login again");
    } else if (response.status === 403) {
      throw new Error("Access forbidden: Insufficient permissions");
    }

    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<T>;
};

export class HotelAPI {
  // Hotel Profile Management
  static async createHotelProfile(
    formData: FormData
  ): Promise<ApiResponse<HotelProfile>> {
    const response = await fetch(`${BACKEND_URL}/hotels/profile`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    return handleApiResponse<ApiResponse<HotelProfile>>(response);
  }

  static async updateHotelProfile(
    formData: FormData
  ): Promise<ApiResponse<HotelProfile>> {
    const response = await fetch(`${BACKEND_URL}/hotels/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: formData,
    });

    return handleApiResponse<ApiResponse<HotelProfile>>(response);
  }

  static async getVendorHotelProfile(): Promise<ApiResponse<HotelProfile>> {
    const response = await fetch(`${BACKEND_URL}/hotels/profile`, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<ApiResponse<HotelProfile>>(response);
  }

  static async deleteHotelImage(
    imageId: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(
      `${BACKEND_URL}/hotels/profile/images/${imageId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    return handleApiResponse<ApiResponse<{ message: string }>>(response);
  }

  // Room Management
  static async addRoom(formData: FormData): Promise<ApiResponse<Room>> {
    const response = await fetch(`${BACKEND_URL}/hotels/rooms`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    return handleApiResponse<ApiResponse<Room>>(response);
  }

  static async updateRoom(
    roomId: string,
    formData: FormData
  ): Promise<ApiResponse<Room>> {
    const response = await fetch(`${BACKEND_URL}/hotels/rooms/${roomId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: formData,
    });

    return handleApiResponse<ApiResponse<Room>>(response);
  }

  static async deleteRoom(
    roomId: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${BACKEND_URL}/hotels/rooms/${roomId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    return handleApiResponse<ApiResponse<{ message: string }>>(response);
  }

  static async getVendorRooms(): Promise<ApiResponse<Room[]>> {
    const response = await fetch(`${BACKEND_URL}/hotels/rooms`, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<ApiResponse<Room[]>>(response);
  }

  static async toggleRoomAvailability(
    roomId: string
  ): Promise<ApiResponse<Room>> {
    const response = await fetch(
      `${BACKEND_URL}/hotels/rooms/${roomId}/availability`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      }
    );

    return handleApiResponse<ApiResponse<Room>>(response);
  }

  // Booking Management
  static async getVendorBookings(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Booking>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const response = await fetch(
      `${BACKEND_URL}/hotels/vendor/bookings?${searchParams}`,
      {
        headers: getAuthHeaders(),
      }
    );

    return handleApiResponse<PaginatedResponse<Booking>>(response);
  }

  static async getBookingDetails(
    bookingId: string
  ): Promise<ApiResponse<Booking>> {
    const response = await fetch(
      `${BACKEND_URL}/hotels/bookings/${bookingId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    return handleApiResponse<ApiResponse<Booking>>(response);
  }

  static async confirmBooking(
    bookingId: string
  ): Promise<ApiResponse<Booking>> {
    const response = await fetch(
      `${BACKEND_URL}/hotels/bookings/${bookingId}/confirm`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      }
    );

    return handleApiResponse<ApiResponse<Booking>>(response);
  }

  // Public Hotel Search (for reference)
  static async searchHotels(params?: {
    category?: string;
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<HotelProfile>> {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${BACKEND_URL}/hotels/search?${searchParams}`
    );

    return handleApiResponse<PaginatedResponse<HotelProfile>>(response);
  }

  static async getHotelDetails(
    hotelId: string
  ): Promise<ApiResponse<HotelProfile>> {
    const response = await fetch(`${BACKEND_URL}/hotels/${hotelId}`);

    return handleApiResponse<ApiResponse<HotelProfile>>(response);
  }

  static async checkAvailability(
    hotelId: string,
    params: {
      checkIn: string;
      checkOut: string;
      guests: number;
    }
  ): Promise<ApiResponse<Room[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value.toString());
    });

    const response = await fetch(
      `${BACKEND_URL}/hotels/${hotelId}/availability?${searchParams}`
    );

    return handleApiResponse<ApiResponse<Room[]>>(response);
  }
}

// Helper types for form data
interface HotelFormData {
  hotelName?: string;
  category?: string;
  totalRooms?: number;
  amenities?: string[];
  cancellationPolicy?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

interface RoomFormData {
  roomType?: string;
  roomNumber?: string;
  capacity?: number;
  basePrice?: number;
  summerPrice?: number;
  winterPrice?: number;
  amenities?: string[];
}

// Helper functions for form data creation
export const createHotelFormData = (
  hotelData: HotelFormData,
  imageFiles?: File[],
  imageDescriptions?: string[],
  isPrimaryFlags?: boolean[]
): FormData => {
  const formData = new FormData();

  // Add hotel data
  Object.entries(hotelData).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item.toString()));
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  // Add images if provided
  if (imageFiles) {
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    if (imageDescriptions) {
      imageDescriptions.forEach((description) => {
        formData.append("descriptions", description);
      });
    }

    if (isPrimaryFlags) {
      isPrimaryFlags.forEach((flag) => {
        formData.append("isPrimary", flag.toString());
      });
    }

    formData.append("imageType", "property");
  }

  return formData;
};

export const createRoomFormData = (
  roomData: RoomFormData,
  imageFiles?: File[],
  imageDescriptions?: string[],
  isPrimaryFlags?: boolean[]
): FormData => {
  const formData = new FormData();

  // Add room data
  Object.entries(roomData).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item.toString()));
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  // Add images if provided
  if (imageFiles) {
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    if (imageDescriptions) {
      imageDescriptions.forEach((description) => {
        formData.append("descriptions", description);
      });
    }

    if (isPrimaryFlags) {
      isPrimaryFlags.forEach((flag) => {
        formData.append("isPrimary", flag.toString());
      });
    }

    formData.append("imageType", "room");
  }

  return formData;
};
