CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CASHIER');
CREATE TYPE "OrderStatus" AS ENUM ('COMPLETED', 'CANCELLED');
CREATE TYPE "StockMovementType" AS ENUM ('IN', 'OUT');

CREATE TABLE "users" (
  "id" UUID NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "email" VARCHAR(190) NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'CASHIER',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "products" (
  "id" UUID NOT NULL,
  "barcode" VARCHAR(80) NOT NULL,
  "name" VARCHAR(180) NOT NULL,
  "cost_price" DECIMAL(15,2) NOT NULL,
  "selling_price" DECIMAL(15,2) NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "min_stock_alert" INTEGER NOT NULL DEFAULT 5,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "orders" (
  "id" UUID NOT NULL,
  "invoice_number" VARCHAR(60) NOT NULL,
  "total_amount" DECIMAL(15,2) NOT NULL,
  "paid_amount" DECIMAL(15,2) NOT NULL,
  "change_amount" DECIMAL(15,2) NOT NULL,
  "cashier_id" UUID NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'COMPLETED',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "order_items" (
  "id" UUID NOT NULL,
  "order_id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unit_price" DECIMAL(15,2) NOT NULL,
  "cost_price" DECIMAL(15,2) NOT NULL,
  "subtotal" DECIMAL(15,2) NOT NULL,
  CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "price_histories" (
  "id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "old_selling_price" DECIMAL(15,2) NOT NULL,
  "new_selling_price" DECIMAL(15,2) NOT NULL,
  "old_cost_price" DECIMAL(15,2) NOT NULL,
  "new_cost_price" DECIMAL(15,2) NOT NULL,
  "changed_by" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "price_histories_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "stock_movements" (
  "id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "type" "StockMovementType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "notes" TEXT,
  "user_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");
CREATE INDEX "products_name_idx" ON "products"("name");
CREATE UNIQUE INDEX "orders_invoice_number_key" ON "orders"("invoice_number");
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");
CREATE INDEX "price_histories_product_id_created_at_idx" ON "price_histories"("product_id", "created_at");
CREATE INDEX "stock_movements_product_id_created_at_idx" ON "stock_movements"("product_id", "created_at");

ALTER TABLE "orders" ADD CONSTRAINT "orders_cashier_id_fkey" FOREIGN KEY ("cashier_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "price_histories" ADD CONSTRAINT "price_histories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "price_histories" ADD CONSTRAINT "price_histories_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
