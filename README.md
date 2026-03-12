# 🛍️ E-Commerce Site (Learning Project)

A **minimalistic e-commerce platform** built to demonstrate modern full-stack web development. This project showcases best practices in Next.js, real-time database operations, authentication, payment processing, and responsive UI design.

Perfect for learning full-stack development with a practical, production-inspired implementation.

---

## ✨ Features

### Core E-Commerce Features

- 🛒 **Product Browsing** — Browse sneakers with search, filtering, and pagination
- 📦 **Shopping Cart** — Add/remove items, persistent cart storage in PostgreSQL
- 💳 **Stripe Checkout** — Secure payment processing with Stripe integration
- 📋 **Order Management** — Create, track, and view order history with status tracking
- 🔒 **User Authentication** — Clerk-based secure sign-in/sign-up

### Admin Features

- ➕ **Product CRUD** — Create, edit, delete products (admin-only)
- 📊 **Order Management Dashboard** — View all customer orders, change order statuses
- 👥 **Role-Based Access Control** — Separate Customer and Admin roles

### User Experience

- 🌙 **Dark/Light Mode** — Theme toggle with system preference detection
- 📱 **Responsive Design** — Mobile-first, works seamlessly on all devices
- ⚡ **Real-time Feedback** — Toast notifications for all user actions
- 🔐 **Route Protection** — Cart and Orders accessible only to signed-in users
- 🖼️ **Image Optimization** — Next.js Image component with lazy loading

---

## 🛠️ Tech Stack

### Frontend

- **Next.js 16.1.6** — React framework with App Router
- **React 19.2.3** — UI library
- **TypeScript** — Type-safe development
- **Tailwind CSS 4** — Utility-first styling
- **shadcn/ui** — High-quality UI components
- **Lucide React** — Icon library
- **Sonner** — Toast notifications
- **next-themes** — Dark mode support

### Backend & Database

- **PostgreSQL** — Relational database
- **Drizzle ORM 0.45.1** — Type-safe database queries
- **Node.js** — Runtime environment

### Authentication & Payments

- **Clerk** — Authentication and user management
- **Stripe** — Payment processing and checkout

### Development Tools

- **ESLint** — Code quality
- **Drizzle Kit** — Database migrations and schema management

---

## 📁 Project Structure

```
e-commerce-site/
├── app/                           # Next.js App Router
│   ├── api/                       # API routes
│   │   ├── cart/                  # Cart operations
│   │   ├── checkout/              # Stripe checkout & payment confirmation
│   │   ├── orders/[id]/           # Order details & status updates
│   │   └── products/              # Product CRUD operations
│   ├── cart/                      # Cart page
│   ├── orders/                    # Orders management page
│   ├── products/                  # Products listing page
│   ├── layout.tsx                 # Root layout with navigation
│   ├── page.tsx                   # Landing page
│   └── globals.css                # Global styles
│
├── components/                    # React components
│   ├── ui/                        # UI components
│   │   ├── cart/                  # Cart-specific components
│   │   ├── orders/                # Order-specific components
│   │   ├── products/              # Product-specific components
│   │   ├── button.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── mode-toggle.tsx
│   │   └── ...
│   └── theme-provider.tsx         # Theme configuration
│
├── db/                            # Database
│   ├── schema.ts                  # Drizzle ORM schema
│   └── drizzle.ts                 # Database connection
│
├── lib/                           # Utilities
│   ├── setUserRole.ts             # User role initialization
│   └── utils.ts                   # Helper functions
│
├── migrations/                    # Database migrations
│   └── ...
│
├── public/                        # Static assets
│
├── screenshots/                   # Project screenshots
│
├── proxy.ts                       # Clerk middleware configuration
├── drizzle.config.ts              # Drizzle configuration
├── next.config.ts                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.ts             # Tailwind configuration
├── package.json                   # Dependencies
└── README.md                      # This file
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Clerk account (for authentication)
- Stripe account (for payments)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd e-commerce-site
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_SIGN_IN_URL=/sign-in
CLERK_SIGN_UP_URL=/sign-up
CLERK_AFTER_SIGN_IN_URL=/products
CLERK_AFTER_SIGN_UP_URL=/products

# Stripe
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Setup Database

```bash
# Run migrations
npx drizzle-kit migrate

# (Optional) View database with Prisma Studio
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
npm run build
npm start
```

---

## 🏗️ Architecture Overview

### Data Flow

```
User Browser
    ↓
Next.js App Router
    ↓
├─→ Page Components (Server/Client)
├─→ API Routes
├─→ Clerk Authentication
└─→ PostgreSQL Database (via Drizzle ORM)
    ↓
Stripe Payment Gateway
```

### Authentication Flow

1. User signs in via Clerk
2. Clerk creates user session
3. App initializes user role in database (Customer/Admin)
4. Protected routes check authentication via Clerk middleware
5. API endpoints validate user role and ownership

### E-Commerce Workflow

```
Browse Products → Add to Cart → View Cart → Checkout with Stripe
                                              ↓
                                    Stripe Session Created
                                              ↓
                                    User Completes Payment
                                              ↓
                                    Confirm Payment → Create Order
                                              ↓
                                    View Orders & Track Status
```

---

## 📊 Database Schema

### Core Tables

**users**

- `id` (text, primary key) — Clerk user ID
- `name` (text) — User full name
- `email` (text, unique) — User email
- `role` (enum: Customer | Admin) — User role

**products**

- `id` (uuid, primary key) — Product ID
- `name` (text) — Product name
- `description` (text) — Product description
- `price` (real) — Product price
- `imageUrl` (text) — Product image URL
- `quantity` (integer) — Inventory quantity

**carts**

- `id` (uuid, primary key)
- `userId` (text, foreign key) — Owner of cart
- `createdAt` (timestamp) — Cart creation time
- `updatedAt` (timestamp) — Last update time

**cartItems**

- `id` (uuid, primary key)
- `cartId` (uuid, foreign key)
- `productId` (uuid, foreign key)
- `quantity` (integer) — Quantity in cart
- `addedAt` (timestamp)

**orders**

- `id` (uuid, primary key)
- `userId` (text, foreign key) — Order customer
- `status` (enum: Pending | Paid | Processing | Shipped | Delivered | Cancelled)
- `subtotal` (real)
- `tax` (real)
- `total` (real)
- `currency` (text) — Payment currency
- `stripeSessionId` (text) — Stripe checkout session ID
- `paidAt` (timestamp) — Payment confirmation time
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**orderItems**

- `id` (uuid, primary key)
- `orderId` (uuid, foreign key)
- `productId` (uuid, foreign key)
- `productName` (text) — Snapshot of product name
- `productImageUrl` (text) — Snapshot of product image
- `unitPrice` (real)
- `quantity` (integer)
- `lineTotal` (real)
- `createdAt` (timestamp)

---

## 🔐 Security Features

- ✅ **Clerk Authentication** — Industry-standard user authentication
- ✅ **Role-Based Access Control** — Admin vs Customer permissions
- ✅ **Stripe PCI Compliance** — Secure payment processing
- ✅ **Route Protection** — Middleware guards on cart and orders
- ✅ **Type-Safe Queries** — Drizzle ORM prevents SQL injection
- ✅ **Environment Variables** — Sensitive keys never exposed
- ✅ **HTTPS Ready** — Production deployment support

---

## 📸 Screenshots

### Landing Page

![Landing Page](./screenshots/LandingPage.png)

### Products Page

![Products Page](./screenshots/ProductsPage.png)

### Shopping Cart

![Shopping Cart](./screenshots/CartPage.png)

### Orders Page

![Orders Page](./screenshots/OrdersPage.png)

---

## 🎯 Key Implementation Details

### Product Search & Filtering

- Full-text search by product name
- Price range filtering (min/max)
- Pagination with configurable page size
- Sorting by product name

### Shopping Cart

- Persistent storage in PostgreSQL
- Real-time quantity updates
- Stock validation before checkout
- Clear cart after successful payment

### Order Management

- Status tracking (Pending → Paid → Processing → Shipped → Delivered)
- Admin can change order status
- Customers see only their orders
- Order details include product snapshots

### Payment Processing

- Stripe checkout session creation
- Product image validation (URL length limits)
- Order placement with cart-to-order conversion
- Idempotent payment confirmation

---

## 📚 Learning Outcomes

This project demonstrates:

- ✅ Next.js App Router and server/client components
- ✅ PostgreSQL database design and migrations
- ✅ Type-safe ORM usage (Drizzle)
- ✅ Third-party API integration (Stripe, Clerk)
- ✅ Authentication and authorization patterns
- ✅ RESTful API design
- ✅ React hooks and state management
- ✅ Responsive UI with Tailwind CSS
- ✅ Error handling and user feedback
- ✅ Database query optimization

---

## 🤝 Contributing

This is a learning project. Feel free to fork, experiment, and learn!

---

## 📝 License

This project is open source and available for educational purposes.

---

**Built with ❤️ for learning modern full-stack web development.**
