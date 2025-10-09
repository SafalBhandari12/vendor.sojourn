"use client";

import { useState, useEffect } from "react";
import { HotelAPI, Booking } from "@/lib/hotelAPI";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Select,
  Label,
} from "@/components/ui";
import { useToast } from "@/contexts/ToastContext";

const BOOKING_STATUSES = [
  { value: "", label: "All Bookings" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "COMPLETED", label: "Completed" },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, currentPage]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await HotelAPI.getVendorBookings({
        status: statusFilter || undefined,
        page: currentPage,
        limit: 12,
      });
      setBookings(response.data.bookings || []);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error: any) {
      showToast(error.message || "Failed to fetch bookings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to confirm this booking?")) return;

    try {
      await HotelAPI.confirmBooking(bookingId);
      showToast("Booking confirmed successfully!", "success");
      fetchBookings();
    } catch (error: any) {
      showToast(error.message || "Failed to confirm booking", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading && bookings.length === 0) {
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
          <h1 className='text-3xl font-bold text-gray-900'>
            Bookings Management
          </h1>
          <p className='text-gray-600'>View and manage customer bookings</p>
        </div>
        <div className='flex items-center space-x-4'>
          <div>
            <Label htmlFor='statusFilter'>Filter by Status</Label>
            <Select
              id='statusFilter'
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              {BOOKING_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Bookings Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {bookings.map((booking) => (
          <Card key={booking.id} className='relative'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-lg'>
                    {booking.room.roomType} - {booking.room.roomNumber}
                  </CardTitle>
                  <p className='text-sm text-gray-600'>
                    Booking ID: {booking.id.slice(-8)}
                  </p>
                </div>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {/* Guest Information */}
                <div>
                  <p className='text-sm font-medium text-gray-700'>
                    Guest Details:
                  </p>
                  <p className='text-sm text-gray-600'>
                    {booking.customer?.phoneNumber ||
                      "Customer Info Not Available"}
                  </p>
                  <p className='text-sm text-gray-600'>
                    {booking.numberOfGuests} guest
                    {booking.numberOfGuests > 1 ? "s" : ""}
                  </p>
                </div>

                {/* Stay Information */}
                <div>
                  <p className='text-sm font-medium text-gray-700'>
                    Stay Details:
                  </p>
                  <p className='text-sm text-gray-600'>
                    Check-in: {formatDate(booking.checkInDate)}
                  </p>
                  <p className='text-sm text-gray-600'>
                    Check-out: {formatDate(booking.checkOutDate)}
                  </p>
                  <p className='text-sm text-gray-600'>
                    {calculateNights(booking.checkInDate, booking.checkOutDate)}{" "}
                    night
                    {calculateNights(
                      booking.checkInDate,
                      booking.checkOutDate
                    ) > 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                {/* Pricing */}
                <div>
                  <p className='text-lg font-semibold'>
                    Total: ₹{booking.totalAmount}
                  </p>
                  {booking.booking.commissionAmount && (
                    <p className='text-sm text-gray-600'>
                      Commission: ₹{booking.booking.commissionAmount}
                    </p>
                  )}
                </div>

                {/* Booking Date */}
                <div>
                  <p className='text-xs text-gray-500'>
                    Booked on: {formatDate(booking.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className='flex space-x-2 pt-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => setSelectedBooking(booking)}
                  >
                    View Details
                  </Button>
                  {booking.status === "PENDING" && (
                    <Button
                      size='sm'
                      onClick={() => handleConfirmBooking(booking.id)}
                    >
                      Confirm
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex justify-center items-center space-x-4'>
          <Button
            variant='outline'
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className='text-sm text-gray-600'>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant='outline'
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {bookings.length === 0 && !isLoading && (
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
                  d='M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m-2 0v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2h-2m-2 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v0'
                />
              </svg>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No bookings found
            </h3>
            <p className='text-gray-600'>
              {statusFilter
                ? `No ${statusFilter.toLowerCase()} bookings found.`
                : "You haven't received any bookings yet."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <Card className='max-w-2xl w-full max-h-96 overflow-y-auto'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <CardTitle>Booking Details</CardTitle>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setSelectedBooking(null)}
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
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-gray-700'>
                      Booking ID
                    </Label>
                    <p className='text-sm'>{selectedBooking.id}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-gray-700'>
                      Status
                    </Label>
                    <Badge className={getStatusColor(selectedBooking.status)}>
                      {selectedBooking.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-gray-700'>
                      Room
                    </Label>
                    <p className='text-sm'>
                      {selectedBooking.room.roomType} -{" "}
                      {selectedBooking.room.roomNumber}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-gray-700'>
                      Guests
                    </Label>
                    <p className='text-sm'>{selectedBooking.numberOfGuests}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-gray-700'>
                      Check-in
                    </Label>
                    <p className='text-sm'>
                      {formatDate(selectedBooking.checkInDate)}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-gray-700'>
                      Check-out
                    </Label>
                    <p className='text-sm'>
                      {formatDate(selectedBooking.checkOutDate)}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-gray-700'>
                      Total Amount
                    </Label>
                    <p className='text-sm font-semibold'>
                      ₹{selectedBooking.totalAmount}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-gray-700'>
                      Commission
                    </Label>
                    <p className='text-sm'>
                      ₹{selectedBooking.booking.commissionAmount || 0}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-gray-700'>
                      Booking Date
                    </Label>
                    <p className='text-sm'>
                      {formatDate(selectedBooking.createdAt)}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-gray-700'>
                      Customer
                    </Label>
                    <p className='text-sm'>
                      {selectedBooking.customer?.phoneNumber || "N/A"}
                    </p>
                  </div>
                </div>

                {selectedBooking.status === "PENDING" && (
                  <div className='pt-4 border-t'>
                    <Button
                      onClick={() => {
                        handleConfirmBooking(selectedBooking.id);
                        setSelectedBooking(null);
                      }}
                      className='w-full'
                    >
                      Confirm Booking
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
