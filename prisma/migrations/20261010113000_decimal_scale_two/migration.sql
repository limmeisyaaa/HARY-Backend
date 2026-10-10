ALTER TABLE "point_records"
  ALTER COLUMN "amount" TYPE NUMERIC(65, 2)
  USING "amount"::NUMERIC(65, 2);

ALTER TABLE "coupons"
  ALTER COLUMN "discount_amount" TYPE NUMERIC(65, 2)
  USING "discount_amount"::NUMERIC(65, 2);

ALTER TABLE "ticket_types"
  ALTER COLUMN "price" TYPE NUMERIC(65, 2)
  USING "price"::NUMERIC(65, 2);

ALTER TABLE "vouchers"
  ALTER COLUMN "discount_amount" TYPE NUMERIC(65, 2)
  USING "discount_amount"::NUMERIC(65, 2);

ALTER TABLE "transactions"
  ALTER COLUMN "points_used" TYPE NUMERIC(65, 2)
  USING "points_used"::NUMERIC(65, 2),
  ALTER COLUMN "total_price" TYPE NUMERIC(65, 2)
  USING "total_price"::NUMERIC(65, 2);
