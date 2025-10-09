# Sojourn Vendor Authentication

A Next.js application with phone number-based OTP authentication for the Sojourn vendor platform.

## Features

- 📱 Phone number authentication with OTP verification
- 🔐 JWT token-based session management
- 🎨 Modern, responsive UI with Tailwind CSS
- ⚡ Built with Next.js 15 and React 19
- 🔄 Automatic token management and redirects
- 📱 Mobile-friendly OTP input interface

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running at the URL specified in your environment variables

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:
   Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_BACKEND_URL=https://sojournbackend.onrender.com/api
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flow

### 1. Phone Number Entry

- Users enter their 10-digit phone number
- Basic validation ensures the number format is correct
- OTP is sent via the backend API

### 2. OTP Verification

- Users receive a 6-digit OTP on their phone
- Auto-advancing input fields for better UX
- 60-second countdown timer with resend option
- Automatic redirect to dashboard on successful verification

### 3. Session Management

- JWT tokens are stored in localStorage
- Automatic redirects based on authentication state
- Clean logout functionality

## API Endpoints

### Send OTP

```
POST /auth/send-otp
Body: { "phoneNumber": "9876543212" }
```

### Verify OTP

```
POST /auth/verify-otp
Body: {
  "phoneNumber": "9876543212",
  "verificationId": "2275985",
  "code": "5103"
}
```

## Project Structure

```
app/
├── auth/                 # Authentication page
├── dashboard/           # Protected dashboard page
├── globals.css         # Global styles
├── layout.tsx          # Root layout
└── page.tsx           # Home page with redirects

components/
├── auth/
│   ├── PhoneLogin.tsx     # Phone number input component
│   └── OTPVerification.tsx # OTP verification component
└── ErrorBoundary.tsx      # Error boundary component

lib/
└── auth.ts              # Authentication utilities and API calls

contexts/
└── AuthContext.tsx      # Authentication context provider
```

## Security Features

- Client-side input validation
- Secure token storage
- Automatic token cleanup on logout
- Error handling and user feedback
- Session persistence across page reloads

## Styling

The application uses Tailwind CSS for styling with:

- Responsive design for mobile and desktop
- Modern gradient backgrounds
- Clean component styling
- Loading states and animations
- Accessible form inputs

## Error Handling

- Network error handling with user-friendly messages
- Input validation with real-time feedback
- Graceful fallbacks for authentication failures
- Error boundary for unexpected errors

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

- `NEXT_PUBLIC_BACKEND_URL` - Backend API base URL (required)

## Deployment

The app is ready for deployment on platforms like Vercel, Netlify, or any Node.js hosting service.

Make sure to set the environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Sojourn vendor platform.
