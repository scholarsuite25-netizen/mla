-- Create product_reviews table
CREATE TABLE product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES digital_products(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (product_id, buyer_id)
);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can read reviews for published products
CREATE POLICY "Reviews are viewable by everyone" ON product_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM digital_products 
      WHERE digital_products.id = product_reviews.product_id 
      AND digital_products.status = 'published'
    )
  );

-- Only buyers who own a license can insert a review
CREATE POLICY "Buyers can insert their own reviews" ON product_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id AND 
    EXISTS (
      SELECT 1 FROM product_licenses
      WHERE product_licenses.product_id = product_reviews.product_id
      AND product_licenses.buyer_id = auth.uid()
    )
  );

-- Buyers can update their own reviews
CREATE POLICY "Buyers can update their own reviews" ON product_reviews
  FOR UPDATE USING (
    auth.uid() = buyer_id
  );

-- Index for querying reviews for a product
CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
