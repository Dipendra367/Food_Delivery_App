# NepEats - Food Delivery Application 🍔

A full-stack food delivery application built with the MERN stack, featuring real-time order management, payment gateway integration (Khalti & eSewa), email/SMS notifications, and a comprehensive admin dashboard.

## ✨ Features

### Customer Features
- 🔐 **User Authentication** - Register, login, email/phone verification, password reset
- 🍽️ **Browse Restaurants & Menu** - View restaurants and their food items with detailed information
- 🛒 **Shopping Cart** - Add items to cart, manage quantities, apply coupons
- 💳 **Multiple Payment Options** - Cash on Delivery, Khalti, and eSewa payment gateways
- 📦 **Order Tracking** - View order history and current order status
- 📧 **Email Notifications** - Order confirmations and updates via email
- 👤 **User Profile** - Manage personal information and delivery addresses
- ⭐ **Reviews & Ratings** - Rate and review restaurants and food items

### Restaurant/Admin Features
- 📊 **Admin Dashboard** - Comprehensive analytics and statistics
- 🍕 **Product Management** - Add, edit, delete menu items with image uploads
- 📋 **Order Management** - View and update order statuses
- 👥 **User Management** - Manage customer accounts
- 🏪 **Restaurant Management** - Manage restaurant details and information
- 🎫 **Coupon Management** - Create and manage discount coupons
- 📈 **Sales Analytics** - View sales trends and performance metrics
- 🔔 **Low Stock Alerts** - Email notifications for low inventory

## 🛠️ Technology Stack

### Frontend
- **React** (v19.2.0) - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **Leaflet** - Interactive maps
- **jsPDF & html2canvas** - PDF receipt generation

### Backend
- **Node.js** & **Express** - Server framework
- **MongoDB** & **Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Twilio** - SMS service
- **Multer** - File upload handling
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/food-delivery-app.git
cd food-delivery-app
```

### 2. Install Dependencies

Install dependencies for both backend and frontend:

```bash
# Install root dependencies (for concurrent running)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

#### Backend Configuration

Create a `.env` file in the `backend` directory by copying the example:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and configure the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/food-delivery-mvp

# JWT Secret (IMPORTANT: Change this!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Admin Credentials
ADMIN_EMAIL=admin@fooddelivery.com
ADMIN_PASSWORD=admin123

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=NepEats <noreply@nep-eats.com>

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Twilio Configuration (Optional - for SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Payment Gateways (Sandbox credentials provided)
# Khalti - Test credentials included
KHALTI_PUBLIC_KEY=test_public_key_dc74e0fd57cb46cd93832aee0a507256
KHALTI_SECRET_KEY=test_secret_key_f59e8b7d18b4499ca40f68195a846e9b

# eSewa - Test credentials included
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_MERCHANT_SECRET=8gBm/:&EnhH.1/q
```

> **📧 Gmail Setup:** To use Gmail for sending emails, you need to generate an App Password:
> 1. Go to [Google Account Security](https://myaccount.google.com/security)
> 2. Enable 2-Step Verification
> 3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
> 4. Generate a new app password for "Mail"
> 5. Use this password in `EMAIL_PASSWORD`

#### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Firebase Configuration (Optional - for phone verification)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Database Setup

Make sure MongoDB is running on your system:

```bash
# On Windows (if installed as a service)
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

Seed the database with sample data:

```bash
cd backend
npm run seed
```

This will create:
- Admin user account
- Sample restaurants (Momo Paradise, Newari Kitchen, etc.)
- Sample food items
- Sample orders and reviews

### 5. Running the Application

You have two options to run the application:

#### Option 1: Run Both Servers Concurrently (Recommended)

From the root directory:

```bash
npm run dev
```

This will start both backend (port 5000) and frontend (port 5173) servers simultaneously.

#### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Admin Login:** 
  - Email: `admin@fooddelivery.com`
  - Password: `admin123`

## 📸 Screenshots

### Home Page
![Home Page](screenshots/home_full_page_1765277444107.png)

### Menu/Products Page
![Menu Page](screenshots/menu_full_page_1765277466797.png)

### Product Details
![Product Details](screenshots/product_detail_2_1765277217668.png)

### Shopping Cart
![Cart Page](screenshots/cart_page_1765277356630.png)

### Admin Dashboard
![Admin Dashboard](screenshots/admin_full_page_1765277485127.png)

### User Profile
![User Profile](screenshots/profile_full_page_1765277506892.png)

### Orders Page
![Orders Page](screenshots/orders_full_page_1765277530686.png)

## 💳 Payment Gateway Testing

### Khalti (Sandbox)
- **Test Mobile Numbers:** 9800000000 to 9800000005
- **MPIN:** 1111
- **OTP:** 987654

### eSewa (Sandbox)
- **Test eSewa IDs:** 9806800001 to 9806800005
- **Password:** Nepal@123
- **MPIN:** 1122
- **Token:** 123456

## 📁 Project Structure

```
food-delivery-app/
├── backend/
│   ├── config/         # Configuration files
│   ├── middleware/     # Custom middleware (auth, error handling)
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic (email, SMS, payments)
│   ├── uploads/        # Uploaded files (product images)
│   ├── .env.example    # Environment variables template
│   ├── server.js       # Express server setup
│   └── seed.js         # Database seeding script
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable React components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API service layer
│   │   └── App.jsx     # Main app component
│   ├── .env.example    # Frontend environment template
│   └── vite.config.js  # Vite configuration
├── screenshots/        # Application screenshots
├── .gitignore         # Git ignore rules
└── package.json       # Root package.json for concurrent running
```

## 🔒 Security Notes

> **⚠️ IMPORTANT:** This repository does NOT include sensitive credentials. You must configure your own:
> - MongoDB connection string
> - JWT secret key
> - Email credentials
> - SMS service credentials (Twilio)
> - Payment gateway credentials (for production)

The `.gitignore` file is configured to exclude:
- `.env` files (all variants)
- `node_modules/`
- Build outputs
- Uploaded files
- Log files

## 🧪 Available Scripts

### Backend
```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
npm run seed    # Seed database with sample data
```

### Frontend
```bash
npm run dev     # Start Vite dev server
npm run build   # Build for production
npm run preview # Preview production build
```

### Root
```bash
npm run dev     # Run both backend and frontend concurrently
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check if the connection string in `.env` is correct
- Verify MongoDB is listening on port 27017

### Port Already in Use
- Backend (5000): Change `PORT` in `backend/.env`
- Frontend (5173): Vite will automatically try the next available port

### Email Not Sending
- Verify Gmail App Password is correct
- Check if 2-Step Verification is enabled
- Ensure `EMAIL_USER` and `EMAIL_PASSWORD` are set correctly

### Payment Gateway Issues
- For testing, use the provided sandbox credentials
- For production, register at [Khalti](https://khalti.com/) and [eSewa](https://esewa.com.np/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Your Name - [GitHub Profile](https://github.com/yourusername)

## 🙏 Acknowledgments

- Payment gateway integration with Khalti and eSewa
- Email service powered by Nodemailer
- SMS notifications via Twilio
- Icons by Lucide React
- UI components styled with Tailwind CSS

---

**Happy Coding! 🚀**