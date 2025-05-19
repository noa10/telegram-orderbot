# Telegram Food Ordering Mini App

A Telegram Mini App for food ordering built with React, TypeScript, Vite, Shadcn UI, Supabase, and Stripe.

## Features

- Telegram Mini App integration with secure authentication
- Product catalog with categories and search
- Shopping cart with persistent storage
- Checkout process with Stripe integration
- Order history and tracking
- Admin panel for order management

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
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_TOKEN=your_bot_token

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# App URL
VITE_APP_URL=http://localhost:5173  # For development
```

### 4. Development

```bash
pnpm dev
```

### 5. Build for production

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

## Deployment to Vercel

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Set up the environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_BOT_TOKEN`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `VITE_APP_URL` (your Vercel deployment URL)
4. Deploy the app

## Testing the Mini App

### Local Testing

For local testing, the app includes a development mode that mocks Telegram user data. You can test most functionality without deploying.

### Testing with Telegram

1. Deploy the app to Vercel
2. Configure your bot's menu button to point to your deployed app URL
3. Open your bot in Telegram and click the menu button

## Telegram Mini App Integration

The app integrates with Telegram using the following components:

1. **Telegram Web App SDK**: Included in `index.html`
2. **Authentication**: Validates the `initData` from Telegram
3. **UI Integration**: Uses Telegram's native UI elements when available

## Supabase Database Schema

The app uses the following tables in Supabase:

1. **users**: Stores user information from Telegram
2. **products**: Stores product information
3. **orders**: Stores order information
4. **order_items**: Stores order item information

## License

MIT
