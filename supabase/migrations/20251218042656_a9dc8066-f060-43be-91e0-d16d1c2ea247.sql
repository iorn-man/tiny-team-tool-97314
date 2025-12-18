-- Drop existing constraints
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_category_check;
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_status_check;

-- Add updated constraints to match UI values
ALTER TABLE feedback ADD CONSTRAINT feedback_category_check 
CHECK (category IN ('feedback', 'complaint', 'suggestion', 'academic', 'facility', 'staff', 'other'));

ALTER TABLE feedback ADD CONSTRAINT feedback_status_check 
CHECK (status IN ('pending', 'in_progress', 'under_review', 'resolved', 'rejected', 'closed'));