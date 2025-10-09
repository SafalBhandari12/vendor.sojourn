const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error(
    "NEXT_PUBLIC_BACKEND_URL is not defined in environment variables"
  );
}

export interface SendOTPRequest {
  phoneNumber: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  data: {
    verificationId: string;
    timeout: string;
  };
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  verificationId: string;
  code: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export class AuthAPI {
  static async sendOTP(phoneNumber: string): Promise<SendOTPResponse> {
    const response = await fetch(`${BACKEND_URL}/auth/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send OTP: ${response.statusText}`);
    }

    return response.json();
  }

  static async verifyOTP(
    phoneNumber: string,
    verificationId: string,
    code: string
  ): Promise<VerifyOTPResponse> {
    const response = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        verificationId,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to verify OTP: ${response.statusText}`);
    }

    return response.json();
  }

  static async checkPhoneAvailability(
    phoneNumber: string
  ): Promise<{ success: boolean; data: { exists: boolean; message: string } }> {
    const response = await fetch(
      `${BACKEND_URL}/auth/check-phone/${phoneNumber}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to check phone availability: ${response.statusText}`
      );
    }

    return response.json();
  }

  static async resendOTP(phoneNumber: string): Promise<SendOTPResponse> {
    const response = await fetch(`${BACKEND_URL}/auth/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber }),
    });

    if (!response.ok) {
      throw new Error(`Failed to resend OTP: ${response.statusText}`);
    }

    return response.json();
  }

  static async refreshToken(): Promise<{
    success: boolean;
    data: { accessToken: string; refreshToken: string };
  }> {
    const refreshToken = TokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${BACKEND_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    return response.json();
  }

  static async logout(): Promise<{ success: boolean; message: string }> {
    const token = TokenStorage.getAccessToken();
    if (!token) {
      throw new Error("No access token available");
    }

    const response = await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to logout: ${response.statusText}`);
    }

    return response.json();
  }
}

// Vendor Profile Types
export interface VendorRegistrationData {
  businessName: string;
  ownerName: string;
  contactNumbers: string[];
  email: string;
  businessAddress: string;
  googleMapsLink?: string;
  gstNumber: string;
  panNumber: string;
  aadhaarNumber: string;
  vendorType: "HOTEL" | "ADVENTURE" | "TRANSPORT" | "MARKET";
  bankDetails: {
    bankName: string;
    branchName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolder: string;
  };
}

export interface VendorStatus {
  status: "NOT_APPLIED" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  businessName?: string;
  vendorType?: string;
  createdAt?: string;
  commissionRate?: number;
  note?: string;
}

export interface VendorProfile {
  id: string;
  userId: string;
  businessName: string;
  ownerName: string;
  contactNumbers: string[];
  email: string;
  businessAddress: string;
  googleMapsLink?: string;
  gstNumber: string;
  panNumber: string;
  aadhaarNumber: string;
  vendorType: "HOTEL" | "ADVENTURE" | "TRANSPORT" | "MARKET";
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
  bankDetails?: {
    id: string;
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    branchName: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Vendor API Class - only vendor-specific functionality
export class VendorAPI {
  private static getAuthHeaders() {
    const token = TokenStorage.getAccessToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  private static async handleApiResponse<T>(response: Response): Promise<T> {
    let errorText = "";
    try {
      errorText = await response.text();
    } catch {
      errorText = "Unable to read error response";
    }

    if (!response.ok) {
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
        url: response.url,
      });

      if (response.status === 401) {
        throw new Error(
          `Authentication failed: Please login again. Your session may have expired.`
        );
      } else if (response.status === 403) {
        throw new Error(
          `Access forbidden: You don't have permission to perform this action.`
        );
      } else if (response.status === 400) {
        // Try to parse error message from response
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            errorData.message || errorData.error || "Invalid request data"
          );
        } catch {
          throw new Error(
            `Bad request: ${errorText || "Invalid data provided"}`
          );
        }
      } else if (response.status === 422) {
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            errorData.message ||
              "Validation error: Please check your input data"
          );
        } catch {
          throw new Error("Validation error: Please check your input data");
        }
      }

      throw new Error(
        `Request failed (${response.status}): ${
          errorText || response.statusText
        }`
      );
    }

    try {
      return JSON.parse(errorText) as Promise<T>;
    } catch {
      throw new Error("Invalid response format from server");
    }
  }

  // Register as vendor
  static async registerVendor(
    data: VendorRegistrationData
  ): Promise<ApiResponse<VendorProfile>> {
    try {
      console.log(
        "Making vendor registration request to:",
        `${BACKEND_URL}/auth/vendor/register`
      );
      console.log("Request headers:", this.getAuthHeaders());
      console.log("Request data:", data);

      const response = await fetch(`${BACKEND_URL}/auth/vendor/register`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      console.log("Response status:", response.status, response.statusText);

      return this.handleApiResponse<ApiResponse<VendorProfile>>(response);
    } catch (error) {
      console.error("Vendor registration error:", error);
      throw error;
    }
  }

  // Check vendor application status
  static async getVendorStatus(): Promise<ApiResponse<VendorStatus>> {
    const response = await fetch(`${BACKEND_URL}/auth/vendor/status`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleApiResponse<ApiResponse<VendorStatus>>(response);
  }

  // Get current user profile
  static async getUserProfile(): Promise<ApiResponse<User>> {
    const response = await fetch(`${BACKEND_URL}/auth/profile`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleApiResponse<ApiResponse<User>>(response);
  }

  // Get comprehensive user information
  static async getUserDetails(): Promise<
    ApiResponse<{ user: User; vendor?: VendorProfile }>
  > {
    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleApiResponse<
      ApiResponse<{ user: User; vendor?: VendorProfile }>
    >(response);
  }

  // Get vendor profile (using hotel profile endpoint)
  static async getVendorProfile(): Promise<ApiResponse<VendorProfile>> {
    const response = await fetch(`${BACKEND_URL}/hotels/profile`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleApiResponse<ApiResponse<VendorProfile>>(response);
  }

  // Update vendor profile (using hotel profile endpoint)
  static async updateVendorProfile(
    data: Partial<VendorProfile>
  ): Promise<ApiResponse<VendorProfile>> {
    const response = await fetch(`${BACKEND_URL}/hotels/profile`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleApiResponse<ApiResponse<VendorProfile>>(response);
  }
}

// Utility functions for token management
export const TokenStorage = {
  setTokens: (accessToken: string, refreshToken: string) => {
    console.log("TokenStorage: Setting tokens", {
      accessToken: accessToken.substring(0, 20) + "...",
      refreshToken: refreshToken.substring(0, 20) + "...",
    });
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  },

  getAccessToken: (): string | null => {
    const token = localStorage.getItem("accessToken");
    console.log(
      "TokenStorage: Getting access token",
      token ? "Found" : "Not found"
    );
    return token;
  },

  getRefreshToken: (): string | null => {
    const token = localStorage.getItem("refreshToken");
    console.log(
      "TokenStorage: Getting refresh token",
      token ? "Found" : "Not found"
    );
    return token;
  },

  clearTokens: () => {
    console.log("TokenStorage: Clearing tokens");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};
