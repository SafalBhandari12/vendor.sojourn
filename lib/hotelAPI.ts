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

// Enhanced Room Image interface for room management
export interface RoomImage {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  fileId?: string;
  isPrimary: boolean;
  description: string;
  imageType: "property" | "room" | "amenity" | "food";
  uploadedAt: string;
  roomId?: string;
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
  images: RoomImage[];
  hotelId: string;
  activeBookingsCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Enhanced room management interfaces
export interface AddRoomData {
  roomType: "STANDARD" | "DELUXE" | "SUITE" | "DORMITORY";
  roomNumber?: string;
  capacity: number;
  basePrice: number;
  summerPrice?: number;
  winterPrice?: number;
  amenities: string[];
  imageType?: "property" | "room" | "amenity" | "food";
  descriptions?: string[];
  isPrimary?: string[];
}

export interface RoomResponse {
  success: true;
  message: string;
  data: Room & {
    uploadedImages?: RoomImage[];
    imageErrors?: Array<{
      index: number;
      error: string;
    }>;
  };
}

export interface RoomsListResponse {
  success: true;
  message: string;
  data: {
    rooms: Room[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
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

// Check if token exists and is valid before making requests
const validateToken = (): boolean => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.error("No access token found");
    handleAuthFailure();
    return false;
  }
  return true;
};

// Handle logout on authentication failure
const handleAuthFailure = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Prevent infinite redirects by checking current path
    if (!window.location.pathname.includes("/auth")) {
      window.location.href = "/auth";
    }
  }
};

// Handle API responses with error handling
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();

    if (response.status === 401 || response.status === 403) {
      console.error("Authentication failed, redirecting to login");
      handleAuthFailure();
      throw new Error("Session expired. Please login again.");
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
    if (!validateToken()) {
      throw new Error("Authentication required");
    }

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
  static async addRoom(
    roomData: AddRoomData,
    images: File[]
  ): Promise<RoomResponse> {
    const formData = new FormData();

    // Add room data
    Object.entries(roomData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item.toString());
          });
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add images
    images.forEach((image, index) => {
      formData.append("images", image);
    });

    const response = await fetch(`${BACKEND_URL}/hotels/rooms`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    return handleApiResponse<RoomResponse>(response);
  }

  static async updateRoom(
    roomId: string,
    roomData: AddRoomData,
    images?: File[]
  ): Promise<RoomResponse> {
    const formData = new FormData();

    // Add room data
    Object.entries(roomData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item.toString());
          });
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add images if provided
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await fetch(`${BACKEND_URL}/hotels/rooms/${roomId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: formData,
    });

    return handleApiResponse<RoomResponse>(response);
  }

  static async deleteRoomImage(
    imageId: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${BACKEND_URL}/hotels/images/${imageId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    return handleApiResponse<ApiResponse<{ message: string }>>(response);
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

  static async getVendorRooms(params?: {
    page?: number;
    limit?: number;
  }): Promise<RoomsListResponse> {
    if (!validateToken()) {
      throw new Error("Authentication required");
    }

    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const url = `${BACKEND_URL}/hotels/rooms${
      searchParams.toString() ? `?${searchParams}` : ""
    }`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    return handleApiResponse<RoomsListResponse>(response);
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
