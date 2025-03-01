# AttendEase Backend

This is the backend server for AttendEase attendance management system.

## Project Structure
```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── config/         # Configuration files
│   └── utils/          # Utility functions
├── .env.example        # Example environment variables
├── .gitignore         # Git ignore file
├── package.json       # Project dependencies
└── server.js         # Main server file
```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual configuration.

3. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- POST /login
  - Login user
  - Body: { username, password }

- POST /register
  - Register new user
  - Body: { username, password }

### Attendance
- POST /mark-attendance
  - Mark attendance using QR code
  - Body: { qrData }
  - Headers: { Authorization: Bearer token }

## Environment Variables
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

## Important Notes
- Don't commit the `.env` file
- Keep API keys and secrets secure
- Use proper error handling
- Validate all inputs 