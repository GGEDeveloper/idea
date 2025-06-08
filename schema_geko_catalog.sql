-- Geko Catalog Advanced Schema (DDL)

-- 1. Producers
CREATE TABLE Producers (
    id_producer SERIAL PRIMARY KEY,
    geko_producer_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_producers_geko_id ON Producers(geko_producer_id);

-- 2. Units
CREATE TABLE Units (
    id_unit SERIAL PRIMARY KEY,
    geko_unit_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    moq INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_units_geko_id ON Units(geko_unit_id);

-- 3. Categories
CREATE TABLE Categories (
    id_category SERIAL PRIMARY KEY,
    geko_category_id VARCHAR(255) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    path TEXT,
    id_parent_category INTEGER REFERENCES Categories(id_category) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_categories_geko_id ON Categories(geko_category_id);
CREATE INDEX idx_categories_parent_id ON Categories(id_parent_category);

-- 4. Products
CREATE TABLE Products (
    id_product SERIAL PRIMARY KEY,
    ean VARCHAR(255) UNIQUE NOT NULL,
    geko_product_id VARCHAR(255) UNIQUE NOT NULL,
    id_producer INTEGER REFERENCES Producers(id_producer) ON DELETE SET NULL,
    id_default_unit INTEGER NOT NULL REFERENCES Units(id_unit),
    name TEXT NOT NULL,
    short_description TEXT,
    long_description TEXT,
    card_url TEXT,
    vat_rate DECIMAL(5,2) NOT NULL,
    geko_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_products_ean ON Products(ean);
CREATE INDEX idx_products_geko_id ON Products(geko_product_id);
CREATE INDEX idx_products_id_producer ON Products(id_producer);
CREATE INDEX idx_products_id_default_unit ON Products(id_default_unit);

-- 5. ProductCategories (junction)
CREATE TABLE ProductCategories (
    id_product INTEGER NOT NULL REFERENCES Products(id_product) ON DELETE CASCADE,
    id_category INTEGER NOT NULL REFERENCES Categories(id_category) ON DELETE CASCADE,
    PRIMARY KEY (id_product, id_category),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_productcategories_id_product ON ProductCategories(id_product);
CREATE INDEX idx_productcategories_id_category ON ProductCategories(id_category);

-- 6. ProductVariants
CREATE TABLE ProductVariants (
    id_variant SERIAL PRIMARY KEY,
    id_product INTEGER NOT NULL REFERENCES Products(id_product) ON DELETE CASCADE,
    geko_variant_size_code VARCHAR(255),
    geko_variant_producer_code VARCHAR(255),
    geko_variant_stock_id VARCHAR(255) UNIQUE,
    weight DECIMAL(10,3),
    gross_weight DECIMAL(10,3),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (id_product, geko_variant_size_code, geko_variant_producer_code)
);
CREATE INDEX idx_productvariants_id_product ON ProductVariants(id_product);
CREATE INDEX idx_productvariants_geko_stock_id ON ProductVariants(geko_variant_stock_id);

-- 7. StockLevels
CREATE TABLE StockLevels (
    id_stock_level SERIAL PRIMARY KEY,
    id_variant INTEGER NOT NULL UNIQUE REFERENCES ProductVariants(id_variant) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    last_synced_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_stocklevels_id_variant ON StockLevels(id_variant);

-- 8. Prices
CREATE TABLE Prices (
    id_price SERIAL PRIMARY KEY,
    id_product INTEGER REFERENCES Products(id_product) ON DELETE CASCADE,
    id_variant INTEGER REFERENCES ProductVariants(id_variant) ON DELETE CASCADE,
    price_type VARCHAR(50) NOT NULL DEFAULT 'standard' CHECK (price_type IN ('base_product_standard','variant_standard','base_product_srp','variant_srp')),
    net_value DECIMAL(12,4) NOT NULL,
    gross_value DECIMAL(12,4) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'PLN',
    valid_from TIMESTAMPTZ,
    valid_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_price_target CHECK ((id_product IS NOT NULL AND id_variant IS NULL) OR (id_product IS NULL AND id_variant IS NOT NULL)),
    UNIQUE (id_product, id_variant, price_type, valid_from, valid_to)
);
CREATE INDEX idx_prices_id_product ON Prices(id_product);
CREATE INDEX idx_prices_id_variant ON Prices(id_variant);
CREATE INDEX idx_prices_price_type ON Prices(price_type);

-- 9. ProductImages
CREATE TABLE ProductImages (
    id_image SERIAL PRIMARY KEY,
    id_product INTEGER NOT NULL REFERENCES Products(id_product) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_productimages_id_product ON ProductImages(id_product);
