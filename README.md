# Telegram Food Ordering Mini App

A Telegram Mini App for food ordering built with React, TypeScript, Vite, Shadcn UI, Supabase, and Stripe. This application provides a seamless food ordering experience directly within Telegram.

## Features

- Telegram Mini App integration with secure server-side validation of initData
- Product catalog with categories, search, and filtering
- Shopping cart with persistent storage
- Checkout process with Stripe integration
- Order history and tracking
- Admin panel for order management
- Responsive UI optimized for mobile devices
- Real-time order updates using Supabase subscriptions

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Telegram Mini App authentication with server-side validation
- **Payments**: Stripe
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm/pnpm
- Telegram Bot (created via BotFather)
- Supabase account
- Stripe account (for payments)
- Vercel account (for deployment)

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd telegram-orderbot
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Telegram
VITE_TELEGRAM_BOT_TOKEN=your_bot_token  # Client-side access (limited usage)
TELEGRAM_BOT_TOKEN=your_bot_token       # Server-side access (for validation)

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key  # Server-side only

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key  # Server-side only

# App URL
VITE_APP_URL=http://localhost:5173  # For development
# Use your Vercel deployment URL in production
```

### 4. Database Setup

Set up the database schema in Supabase:

#### Option 1: Using the Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy the contents of `supabase/migrations/20240520_initial_schema.sql` into the query editor
5. Run the query

#### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

This will create the necessary tables in your Supabase database:
- users
- roles
- user_roles
- products
- categories
- addons
- addon_options
- product_addons
- orders
- order_items

### 5. Development

Start the development server:

```bash
pnpm dev
```

The app will be available at http://localhost:5173. In development mode, the app includes a mock Telegram user for testing without deploying.

### 6. Build for production

```bash
pnpm build
```

## Telegram Bot Setup

1. Create a new bot using BotFather in Telegram:
   - Open Telegram and search for @BotFather
   - Send the command `/newbot`
   - Follow the instructions to create your bot
   - Copy the bot token provided by BotFather

2. Configure the bot's menu button to open your web app:
   ```
   /mybots -> Select your bot -> Bot Settings -> Menu Button -> Configure Menu Button
   ```

3. Set the web app URL to your deployed app URL (after deploying to Vercel)

4. Optional: Set up commands for your bot using `/setcommands` in BotFather

## Deployment to Vercel

1. Push your code to a GitHub repository

2. Connect your repository to Vercel:
   - Sign in to Vercel and click "Add New Project"
   - Import your GitHub repository
   - Configure the project settings

3. Set up the environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_BOT_TOKEN`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `VITE_APP_URL` (your Vercel deployment URL)

4. Deploy the app:
   - Click "Deploy" and wait for the build to complete
   - Vercel will automatically build and deploy your application

5. Configure your Telegram bot to use the deployed URL:
   - Go back to BotFather and update your bot's menu button URL to point to your Vercel deployment

## Testing the Mini App

### Local Testing

For local testing, the app includes a development mode that mocks Telegram user data. You can test most functionality without deploying:

1. Start the development server with `pnpm dev`
2. The app will automatically use a mock Telegram user in development mode
3. You can test all features except those requiring actual Telegram integration

### Testing with Telegram

1. Deploy the app to Vercel
2. Configure your bot's menu button to point to your deployed app URL
3. Open your bot in Telegram and click the menu button
4. The app will validate your Telegram user data on the server side
5. You can now test the full functionality within Telegram

## Telegram Mini App Integration

The app integrates with Telegram using the following components:

1. **Telegram Web App SDK**: Included in `index.html` for accessing Telegram's Mini App features
2. **Server-side Authentication**: Validates the `initData` from Telegram using HMAC-SHA-256 signatures
3. **UI Integration**: Uses Telegram's native UI elements (MainButton, BackButton, etc.) when available
4. **Responsive Design**: Optimized for the Telegram Mini App interface on mobile devices

### Security Measures

- All Telegram initData is validated on the server side using HMAC-SHA-256 signatures
- Authentication data is checked for freshness (less than 24 hours old)
- User data is securely stored in Supabase with appropriate access controls

## Supabase Database Schema

The app uses the following tables in Supabase:

1. **users**: Stores user information from Telegram
   - `id`: UUID primary key
   - `telegram_id`: Unique identifier from Telegram
   - `first_name`, `last_name`, `username`: User profile information
   - `language_code`: User's language preference
   - `photo_url`: Profile photo URL
   - `created_at`, `updated_at`: Timestamps

2. **roles**: Defines user roles
   - `id`: Serial primary key
   - `name`: Role name (user, merchant, admin)
   - `description`: Role description
   - `created_at`, `updated_at`: Timestamps

3. **user_roles**: Many-to-many relationship between users and roles
   - `id`: Serial primary key
   - `user_id`: Reference to users table
   - `role_id`: Reference to roles table
   - `created_at`, `updated_at`: Timestamps

4. **products**: Stores product information
   - `id`: UUID primary key
   - `name`: Product name
   - `description`: Product description
   - `price`: Product price
   - `image_url`: Product image URL
   - `is_available`: Availability status
   - `category_id`: Reference to categories table
   - `created_at`, `updated_at`: Timestamps

5. **categories**: Product categories
   - `id`: UUID primary key
   - `name`: Category name
   - `description`: Category description
   - `created_at`, `updated_at`: Timestamps

6. **addons**: Product add-ons (e.g., toppings, sizes)
   - `id`: UUID primary key
   - `name`: Add-on name
   - `description`: Add-on description
   - `is_required`: Whether the add-on is required
   - `multiple_selection`: Whether multiple options can be selected
   - `created_at`, `updated_at`: Timestamps

7. **addon_options**: Options for each add-on
   - `id`: UUID primary key
   - `addon_id`: Reference to addons table
   - `name`: Option name
   - `additional_price`: Additional price for this option
   - `is_default`: Whether this is the default option
   - `created_at`, `updated_at`: Timestamps

8. **product_addons**: Many-to-many relationship between products and addons
   - `id`: Serial primary key
   - `product_id`: Reference to products table
   - `addon_id`: Reference to addons table
   - `created_at`, `updated_at`: Timestamps

9. **orders**: Stores order information
   - `id`: UUID primary key
   - `user_id`: Reference to users table
   - `status`: Order status (pending, confirmed, delivered, etc.)
   - `subtotal`: Order subtotal
   - `tax`: Tax amount
   - `delivery_fee`: Delivery fee
   - `total_amount`: Total order amount
   - `payment_intent_id`: Stripe payment intent ID
   - `payment_status`: Payment status
   - `delivery_address`: Delivery address
   - `delivery_instructions`: Special instructions
   - `customer_name`: Customer name
   - `customer_phone`: Customer phone number
   - `created_at`, `updated_at`: Timestamps

10. **order_items**: Stores order item information
    - `id`: UUID primary key
    - `order_id`: Reference to orders table
    - `product_id`: Reference to products table
    - `name`: Product name at time of order
    - `quantity`: Item quantity
    - `unit_price`: Item unit price at time of order
    - `item_total_price`: Total price for this item
    - `image_url`: Product image URL at time of order
    - `selected_addons`: JSONB of selected add-ons
    - `created_at`, `updated_at`: Timestamps

## Troubleshooting

### Common Issues

1. **Database tables don't exist**: If you see errors like `relation "public.users" does not exist`, you need to set up the database tables:

   Go to your Supabase dashboard, navigate to the SQL Editor, and run the SQL script in `supabase/migrations/20240520_initial_schema.sql`.

2. **Telegram validation fails**:
   - Ensure your `TELEGRAM_BOT_TOKEN` is correctly set in environment variables
   - Check that your server can access the Telegram API
   - Verify that the initData is being properly passed from Telegram

3. **Supabase connection issues**:
   - Verify your Supabase URL and keys are correct
   - Check that you're using the right environment variables (`SUPABASE_URL` for server-side, `VITE_SUPABASE_URL` for client-side)
   - Ensure your IP is allowed in Supabase's network restrictions

4. **Development mode not working**:
   - Make sure all dependencies are installed with `pnpm install`
   - Check the console for any JavaScript errors

5. **Vercel deployment fails**:
   - Check the build logs for errors
   - Ensure all environment variables are set correctly
   - Verify that the serverless functions are properly configured

## License

MIT
