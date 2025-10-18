"use client";

import { useState, useEffect, useCallback } from "react";
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
  Input,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { showToast } = useToast();

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await HotelAPI.getVendorBookings({
        status: statusFilter || undefined,
        page: currentPage,
        limit: 12,
      });
      setBookings(response.data.bookings || []);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error: unknown) {
      showToast(
        (error as Error).message || "Failed to fetch bookings",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, currentPage, showToast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleConfirmBooking = async (booking: Booking) => {
    if (!confirm("Are you sure you want to confirm this booking?")) return;

    try {
      const bookingId = booking.id || booking.bookingRef;
      await HotelAPI.confirmBooking(bookingId);
      showToast("Booking confirmed successfully!", "success");
      fetchBookings();
    } catch (error: unknown) {
      showToast(
        (error as Error).message || "Failed to confirm booking",
        "error"
      );
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

  // Filter bookings based on search query
  const filteredBookings = bookings.filter((booking) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const bookingId = (booking.id || booking.bookingRef || "").toLowerCase();
    const bookingRef = (booking.bookingRef || "").toLowerCase();
    const customerName = `${booking.customer?.firstName || ""} ${
      booking.customer?.lastName || ""
    }`.toLowerCase();
    const customerPhone = (booking.customer?.phoneNumber || "").toLowerCase();
    const roomInfo =
      `${booking.room.type} ${booking.room.number}`.toLowerCase();

    return (
      bookingId.includes(query) ||
      bookingRef.includes(query) ||
      customerName.includes(query) ||
      customerPhone.includes(query) ||
      roomInfo.includes(query)
    );
  });

  const calculateNights = (checkIn: string, checkOut: string): number => {
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
            <Label htmlFor='searchQuery'>Search Bookings</Label>
            <Input
              id='searchQuery'
              placeholder='Search by booking ID, customer name, or phone...'
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className='w-64'
            />
          </div>
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
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className='relative'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-lg'>
                    {booking.room.type} - {booking.room.number}
                  </CardTitle>
                  <p className='text-sm text-gray-600'>
                    Booking ID: {booking.bookingRef || booking.id?.slice(-8)}
                  </p>
                </div>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {/* Customer & Guest Information */}
                <div>
                  <p className='text-sm font-medium text-gray-700'>
                    Primary Guest:
                  </p>
                  <p className='text-sm text-gray-600'>
                    {booking.customer?.firstName} {booking.customer?.lastName}
                  </p>
                  <p className='text-sm text-gray-500'>
                    {booking.customer?.phoneNumber || "Phone not available"}
                  </p>
                  {booking.customer?.email && (
                    <p className='text-sm text-gray-500'>
                      {booking.customer.email}
                    </p>
                  )}
                  <p className='text-sm text-gray-600'>
                    {booking.numberOfGuests} guest
                    {booking.numberOfGuests > 1 ? "s" : ""}
                    {booking.guests && booking.guests.length > 0 && (
                      <span className='text-gray-500'>
                        {" "}
                        • {
                          booking.guests.filter((g) => g.hasIdProof).length
                        }{" "}
                        with ID
                      </span>
                    )}
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

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div>
                    <p className='text-sm font-medium text-gray-700'>
                      Special Requests:
                    </p>
                    <p className='text-sm text-gray-600 italic'>
                      &quot;{booking.specialRequests}&quot;
                    </p>
                  </div>
                )}

                {/* Payment Status */}
                {booking.payment && (
                  <div>
                    <p className='text-sm font-medium text-gray-700'>
                      Payment:
                    </p>
                    <Badge
                      variant={
                        booking.payment.status === "SUCCESS"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {booking.payment.status}
                    </Badge>
                    {booking.payment.method && (
                      <span className='text-sm text-gray-500 ml-2'>
                        via {booking.payment.method}
                      </span>
                    )}
                  </div>
                )}

                {/* Pricing */}
                <div>
                  <p className='text-lg font-semibold'>
                    Total: ₹{booking.totalAmount}
                  </p>
                  {booking.commissionAmount && (
                    <p className='text-sm text-gray-600'>
                      Commission: ₹{booking.commissionAmount}
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
                      onClick={() => handleConfirmBooking(booking)}
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

      {filteredBookings.length === 0 && !isLoading && (
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
              {searchQuery
                ? `No bookings found matching "${searchQuery}".`
                : statusFilter
                ? `No ${statusFilter.toLowerCase()} bookings found.`
                : "You haven't received any bookings yet."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <Card className='max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle>Booking Details</CardTitle>
                  <p className='text-sm text-gray-600'>
                    Booking Ref:{" "}
                    {selectedBooking.bookingRef ||
                      selectedBooking.id?.slice(-8)}
                  </p>
                </div>
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
              <div className='space-y-6'>
                {/* Basic Booking Info */}
                <div>
                  <h3 className='text-lg font-semibold mb-3'>
                    Booking Information
                  </h3>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                    <div>
                      <Label className='text-sm font-medium text-gray-700'>
                        Booking ID
                      </Label>
                      <p className='text-sm'>
                        {selectedBooking.id || selectedBooking.bookingRef}
                      </p>
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
                        {selectedBooking.room.type} -{" "}
                        {selectedBooking.room.number}
                      </p>
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
                        Booking Date
                      </Label>
                      <p className='text-sm'>
                        {formatDate(selectedBooking.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className='text-lg font-semibold mb-3'>
                    Customer Information
                  </h3>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                    <div>
                      <Label className='text-sm font-medium text-gray-700'>
                        Name
                      </Label>
                      <p className='text-sm'>
                        {selectedBooking.customer?.firstName}{" "}
                        {selectedBooking.customer?.lastName}
                      </p>
                    </div>
                    <div>
                      <Label className='text-sm font-medium text-gray-700'>
                        Phone
                      </Label>
                      <p className='text-sm'>
                        {selectedBooking.customer?.phoneNumber ||
                          "Not provided"}
                      </p>
                    </div>
                    <div>
                      <Label className='text-sm font-medium text-gray-700'>
                        Email
                      </Label>
                      <p className='text-sm'>
                        {selectedBooking.customer?.email || "Not provided"}
                      </p>
                    </div>
                    {selectedBooking.customer?.emergencyContact && (
                      <div>
                        <Label className='text-sm font-medium text-gray-700'>
                          Emergency Contact
                        </Label>
                        <p className='text-sm'>
                          {selectedBooking.customer.emergencyContact}
                        </p>
                      </div>
                    )}
                    {selectedBooking.customer?.idProofType && (
                      <div>
                        <Label className='text-sm font-medium text-gray-700'>
                          ID Proof
                        </Label>
                        <p className='text-sm'>
                          {selectedBooking.customer.idProofType}
                          {selectedBooking.customer.hasIdProof && " ✓"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Guest Details */}
                {selectedBooking.guests &&
                  selectedBooking.guests.length > 0 && (
                    <div>
                      <h3 className='text-lg font-semibold mb-3'>
                        Guest Details ({selectedBooking.guests.length} guest
                        {selectedBooking.guests.length > 1 ? "s" : ""})
                      </h3>
                      <div className='space-y-3'>
                        {selectedBooking.guests.map((guest, index) => (
                          <div
                            key={index}
                            className='p-3 border rounded-lg bg-gray-50'
                          >
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                              <div>
                                <Label className='text-xs font-medium text-gray-700'>
                                  Name
                                </Label>
                                <p className='text-sm'>
                                  {guest.firstName} {guest.lastName}
                                  {guest.isPrimaryGuest && (
                                    <Badge
                                      variant='outline'
                                      className='ml-2 text-xs'
                                    >
                                      Primary
                                    </Badge>
                                  )}
                                </p>
                              </div>
                              {guest.age && (
                                <div>
                                  <Label className='text-xs font-medium text-gray-700'>
                                    Age
                                  </Label>
                                  <p className='text-sm'>{guest.age} years</p>
                                </div>
                              )}
                              {guest.idProofType && (
                                <div>
                                  <Label className='text-xs font-medium text-gray-700'>
                                    ID Proof
                                  </Label>
                                  <p className='text-sm'>
                                    {guest.idProofType}
                                    {guest.hasIdProof && " ✓"}
                                  </p>
                                </div>
                              )}
                              {guest.specialRequests && (
                                <div className='col-span-2 md:col-span-4'>
                                  <Label className='text-xs font-medium text-gray-700'>
                                    Special Requests
                                  </Label>
                                  <p className='text-sm italic text-gray-600'>
                                    &quot;{guest.specialRequests}&quot;
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <div>
                    <h3 className='text-lg font-semibold mb-3'>
                      Booking Special Requests
                    </h3>
                    <div className='p-3 border rounded-lg bg-blue-50'>
                      <p className='text-sm italic text-gray-700'>
                        &quot;{selectedBooking.specialRequests}&quot;
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                <div>
                  <h3 className='text-lg font-semibold mb-3'>
                    Payment Information
                  </h3>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div>
                      <Label className='text-sm font-medium text-gray-700'>
                        Total Amount
                      </Label>
                      <p className='text-lg font-semibold'>
                        ₹{selectedBooking.totalAmount}
                      </p>
                    </div>
                    <div>
                      <Label className='text-sm font-medium text-gray-700'>
                        Commission
                      </Label>
                      <p className='text-sm'>
                        ₹{selectedBooking.commissionAmount || 0}
                      </p>
                    </div>
                    {selectedBooking.payment && (
                      <>
                        <div>
                          <Label className='text-sm font-medium text-gray-700'>
                            Payment Status
                          </Label>
                          <Badge
                            variant={
                              selectedBooking.payment.status === "SUCCESS"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {selectedBooking.payment.status}
                          </Badge>
                        </div>
                        {selectedBooking.payment.method && (
                          <div>
                            <Label className='text-sm font-medium text-gray-700'>
                              Payment Method
                            </Label>
                            <p className='text-sm'>
                              {selectedBooking.payment.method}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {selectedBooking.status === "PENDING" && (
                  <div className='pt-4 border-t'>
                    <Button
                      onClick={() => {
                        handleConfirmBooking(selectedBooking);
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
