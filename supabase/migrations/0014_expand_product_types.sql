-- Expand digital_products type check to support lecture presentations, training manuals, monographs, and ebooks
ALTER TABLE public.digital_products 
  DROP CONSTRAINT IF EXISTS digital_products_type_check;

ALTER TABLE public.digital_products 
  ADD CONSTRAINT digital_products_type_check 
  CHECK (type IN ('ebook', 'software', 'pdf', 'lecture_slides', 'training_manual', 'monograph'));
