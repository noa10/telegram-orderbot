-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT,
    username TEXT,
    language_code TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    category_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to products table
ALTER TABLE public.products
ADD CONSTRAINT fk_products_category
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

-- Create addons table
CREATE TABLE IF NOT EXISTS public.addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    multiple_selection BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create addon_options table
CREATE TABLE IF NOT EXISTS public.addon_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    addon_id UUID REFERENCES public.addons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    additional_price DECIMAL(10, 2) DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_addons table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.product_addons (
    id SERIAL PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    addon_id UUID REFERENCES public.addons(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, addon_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_address TEXT,
    delivery_instructions TEXT,
    payment_intent_id TEXT,
    payment_status TEXT DEFAULT 'pending',
    customer_name TEXT,
    customer_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    item_total_price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    selected_addons JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO public.roles (name, description)
VALUES
    ('user', 'Regular user with basic permissions'),
    ('merchant', 'Merchant with order management permissions'),
    ('admin', 'Administrator with full access')
ON CONFLICT (name) DO NOTHING;

-- Create RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addon_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY users_read_own ON public.users
    FOR SELECT
    USING (auth.uid()::text = id::text);

-- Create policy for users to update their own data
CREATE POLICY users_update_own ON public.users
    FOR UPDATE
    USING (auth.uid()::text = id::text);

-- Create policy for users to insert their own data
CREATE POLICY users_insert_own ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create policy for users to read products
CREATE POLICY products_read_all ON public.products
    FOR SELECT
    USING (true);

-- Create policy for users to read categories
CREATE POLICY categories_read_all ON public.categories
    FOR SELECT
    USING (true);

-- Create policy for users to read addons
CREATE POLICY addons_read_all ON public.addons
    FOR SELECT
    USING (true);

-- Create policy for users to read addon options
CREATE POLICY addon_options_read_all ON public.addon_options
    FOR SELECT
    USING (true);

-- Create policy for users to read product addons
CREATE POLICY product_addons_read_all ON public.product_addons
    FOR SELECT
    USING (true);

-- Create policy for users to read their own orders
CREATE POLICY orders_read_own ON public.orders
    FOR SELECT
    USING (auth.uid()::text = user_id::text);

-- Create policy for users to create orders
CREATE POLICY orders_create_own ON public.orders
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

-- Create policy for users to read their own order items
CREATE POLICY order_items_read_own ON public.order_items
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id::text = auth.uid()::text
    ));

-- Create policy for users to insert their own default role
CREATE POLICY user_roles_insert_own_default ON public.user_roles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id AND role_id = (SELECT id FROM public.roles WHERE name = 'user'));
