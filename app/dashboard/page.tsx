"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { HotelAPI, HotelProfile } from "@/lib/hotelAPI";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";

interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hotelProfile, setHotelProfile] = useState<HotelProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Try to get hotel profile
      try {
        const profileResponse = await HotelAPI.getVendorHotelProfile();
        setHotelProfile(profileResponse.data);

        // If hotel exists, fetch rooms and bookings for stats
        const [roomsResponse, bookingsResponse] = await Promise.all([
          HotelAPI.getVendorRooms(),
          HotelAPI.getVendorBookings(),
        ]);

        const rooms = roomsResponse.data;
        const bookings = bookingsResponse.data.bookings || [];

        // Calculate stats
        const availableRooms = rooms.filter(
          (room: any) => room.isAvailable
        ).length;
        const occupiedRooms = rooms.length - availableRooms;
        const pendingBookings = bookings.filter(
          (booking: any) => booking.status === "PENDING"
        ).length;
        const confirmedBookings = bookings.filter(
          (booking: any) => booking.status === "CONFIRMED"
        ).length;

        // Calculate revenue (assuming bookings have totalAmount)
        const totalRevenue = bookings
          .filter((booking: any) => booking.status === "CONFIRMED")
          .reduce(
            (sum: number, booking: any) => sum + (booking.totalAmount || 0),
            0
          );

        // Calculate monthly revenue (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = bookings
          .filter((booking: any) => {
            const bookingDate = new Date(booking.createdAt);
            return (
              booking.status === "CONFIRMED" &&
              bookingDate.getMonth() === currentMonth &&
              bookingDate.getFullYear() === currentYear
            );
          })
          .reduce(
            (sum: number, booking: any) => sum + (booking.totalAmount || 0),
            0
          );

        setStats({
          totalRooms: rooms.length,
          availableRooms,
          occupiedRooms,
          totalBookings: bookings.length,
          pendingBookings,
          confirmedBookings,
          totalRevenue,
          monthlyRevenue,
        });
      } catch (error) {
        // Hotel profile doesn't exist yet
        setHotelProfile(null);
      }
    } catch (error: any) {
      showToast("Failed to load dashboard data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!hotelProfile) {
    return (
      <div className='max-w-4xl mx-auto'>
        <div className='text-center py-12'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>
            Welcome to Your Hotel Dashboard
          </h1>
          <p className='text-lg text-gray-600 mb-8'>
            Get started by creating your hotel profile to begin managing your
            property.
          </p>
          <Link href='/dashboard/hotel-profile'>
            <Button size='lg'>Create Hotel Profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
          <p className='text-gray-600'>Welcome back, {user?.phoneNumber}</p>
        </div>
        <div className='text-right'>
          <h2 className='text-xl font-semibold text-gray-900'>
            {hotelProfile.hotelName}
          </h2>
          <p className='text-sm text-gray-600'>
            {hotelProfile.vendor.businessAddress}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Rooms</CardTitle>
            <div className='h-4 w-4 text-muted-foreground'>🏨</div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalRooms}</div>
            <p className='text-xs text-muted-foreground'>
              {stats.availableRooms} available, {stats.occupiedRooms} occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Bookings
            </CardTitle>
            <div className='h-4 w-4 text-muted-foreground'>📅</div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalBookings}</div>
            <p className='text-xs text-muted-foreground'>
              {stats.pendingBookings} pending, {stats.confirmedBookings}{" "}
              confirmed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <div className='h-4 w-4 text-muted-foreground'>💰</div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Monthly Revenue
            </CardTitle>
            <div className='h-4 w-4 text-muted-foreground'>📊</div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ₹{stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              This month's earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Link href='/dashboard/hotel-profile'>
              <Button
                variant='outline'
                className='w-full h-20 flex flex-col space-y-2'
              >
                <span className='text-2xl'>🏨</span>
                <span>Manage Hotel Profile</span>
              </Button>
            </Link>

            <Link href='/dashboard/rooms'>
              <Button
                variant='outline'
                className='w-full h-20 flex flex-col space-y-2'
              >
                <span className='text-2xl'>🛏️</span>
                <span>Manage Rooms</span>
              </Button>
            </Link>

            <Link href='/dashboard/bookings'>
              <Button
                variant='outline'
                className='w-full h-20 flex flex-col space-y-2'
              >
                <span className='text-2xl'>📋</span>
                <span>View Bookings</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Hotel Info */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Hotel Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <h3 className='font-semibold text-gray-900'>
                {hotelProfile.hotelName}
              </h3>
              <p className='text-sm text-gray-600'>
                Category: {hotelProfile.category}
              </p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700'>Location</p>
              <p className='text-sm text-gray-600'>
                {hotelProfile.vendor.businessAddress}
              </p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700'>Contact</p>
              <p className='text-sm text-gray-600'>
                {hotelProfile.vendor.contactNumbers[0] || "N/A"}
              </p>
              <p className='text-sm text-gray-600'>
                {hotelProfile.vendor.email}
              </p>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm font-medium text-gray-700'>
                Total Rooms
              </span>
              <span className='text-sm text-gray-600'>
                {hotelProfile.totalRooms}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {stats.totalBookings > 0 ? (
                <div className='text-center py-6'>
                  <p className='text-sm text-gray-600 mb-4'>
                    Your hotel has {stats.totalBookings} total bookings
                  </p>
                  <Link href='/dashboard/bookings'>
                    <Button variant='outline' size='sm'>
                      View All Bookings
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className='text-center py-6'>
                  <p className='text-sm text-gray-600 mb-4'>No bookings yet</p>
                  <p className='text-xs text-gray-500'>
                    Bookings will appear here once customers start booking your
                    rooms
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
