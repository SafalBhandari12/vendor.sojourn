"use client";

import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      current: pathname === "/dashboard",
      icon: "dashboard",
    },
    {
      name: "Hotel Profile",
      href: "/dashboard/hotel-profile",
      current: pathname === "/dashboard/hotel-profile",
      icon: "hotel",
    },
    {
      name: "Rooms",
      href: "/dashboard/rooms",
      current: pathname === "/dashboard/rooms",
      icon: "rooms",
    },
    {
      name: "Bookings",
      href: "/dashboard/bookings",
      current: pathname === "/dashboard/bookings",
      icon: "bookings",
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      current: pathname === "/dashboard/profile",
      icon: "profile",
    },
  ];

  return (
    <AuthGuard>
      <div
        className='min-h-screen bg-gray-50'
        style={{ backgroundColor: "#f9fafb", color: "#111827" }}
      >
        <nav className='bg-white shadow' style={{ backgroundColor: "white" }}>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between h-16'>
              <div className='flex'>
                <div className='flex-shrink-0 flex items-center'>
                  <h1 className='text-xl font-semibold text-gray-900'>
                    Sojourn Vendor Portal
                  </h1>
                </div>
                <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        item.current
                          ? "border-indigo-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className='flex items-center space-x-4'>
                <div className='text-sm text-gray-500'>
                  Welcome, {user?.phoneNumber}
                </div>
                <button
                  onClick={handleLogout}
                  className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors'
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div className='sm:hidden'>
            <div className='pt-2 pb-3 space-y-1'>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <main
          className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'
          style={{ backgroundColor: "#f9fafb", minHeight: "500px" }}
        >
          {(() => {
            console.log("Dashboard layout rendering children");
            return null;
          })()}
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
