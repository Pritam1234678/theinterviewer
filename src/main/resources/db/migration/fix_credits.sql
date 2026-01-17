-- Quick fix for NULL credit values
-- Run this in MySQL Workbench or any MySQL client

USE theinterviewer;

-- Update all NULL credits to 100
UPDATE users SET credits = 100 WHERE credits IS NULL;

-- Update all NULL free_interviews_used to 0
UPDATE users SET free_interviews_used = 0 WHERE free_interviews_used IS NULL;

-- Verify the update
SELECT id, full_name, email, credits, free_interviews_used FROM users;
