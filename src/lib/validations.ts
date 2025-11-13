import { z } from "zod";

export const studentSchema = z.object({
  full_name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z.string()
    .trim()
    .regex(/^\+?[\d\s-()]+$/, "Invalid phone number format")
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  student_id: z.string()
    .trim()
    .min(3, "Student ID must be at least 3 characters")
    .max(50, "Student ID must be less than 50 characters")
    .regex(/^[A-Z0-9-_]+$/i, "Student ID can only contain letters, numbers, hyphens and underscores"),
  date_of_birth: z.string().optional().or(z.literal("")),
  gender: z.enum(["Male", "Female", "Other", ""]).optional(),
  address: z.string()
    .max(500, "Address must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const facultySchema = z.object({
  full_name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z.string()
    .trim()
    .regex(/^\+?[\d\s-()]+$/, "Invalid phone number format")
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  faculty_id: z.string()
    .trim()
    .min(3, "Faculty ID must be at least 3 characters")
    .max(50, "Faculty ID must be less than 50 characters")
    .regex(/^[A-Z0-9-_]+$/i, "Faculty ID can only contain letters, numbers, hyphens and underscores"),
  department: z.string()
    .trim()
    .min(2, "Department must be at least 2 characters")
    .max(100, "Department must be less than 100 characters"),
  qualification: z.string()
    .max(100, "Qualification must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  specialization: z.string()
    .max(200, "Specialization must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  joining_date: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const courseSchema = z.object({
  course_code: z.string()
    .trim()
    .min(2, "Course code must be at least 2 characters")
    .max(20, "Course code must be less than 20 characters")
    .regex(/^[A-Z0-9-_]+$/i, "Course code can only contain letters, numbers, hyphens and underscores"),
  course_name: z.string()
    .trim()
    .min(3, "Course name must be at least 3 characters")
    .max(200, "Course name must be less than 200 characters"),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  credits: z.number()
    .int("Credits must be a whole number")
    .min(1, "Credits must be at least 1")
    .max(10, "Credits cannot exceed 10"),
  department: z.string()
    .max(100, "Department must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  semester: z.number()
    .int("Semester must be a whole number")
    .min(1, "Semester must be at least 1")
    .max(12, "Semester cannot exceed 12"),
  faculty_id: z.string().uuid("Invalid faculty ID").optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active"),
});
