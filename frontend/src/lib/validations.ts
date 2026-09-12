import { z } from 'zod';

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(20, 'Name must be at least 20 characters').max(60, 'Name must be at most 60 characters'),
  email: z.string().email('Invalid email address'),
  address: z.string().max(400, 'Address must be at most 400 characters').min(1, 'Address is required'),
  password: z.string().regex(passwordRegex, 'Password must be 8–16 characters with at least one uppercase letter and one special character'),
});

export const createUserSchema = z.object({
  name: z.string().min(20, 'Name must be at least 20 characters').max(60, 'Name must be at most 60 characters'),
  email: z.string().email('Invalid email address'),
  address: z.string().max(400, 'Address must be at most 400 characters').min(1, 'Address is required'),
  password: z.string().regex(passwordRegex, 'Password must be 8–16 characters with at least one uppercase letter and one special character'),
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER']),
});

export const createStoreSchema = z.object({
  name: z.string().min(20, 'Name must be at least 20 characters').max(60, 'Name must be at most 60 characters'),
  email: z.string().email('Invalid email address'),
  address: z.string().max(400, 'Address must be at most 400 characters').min(1, 'Address is required'),
  ownerId: z.string().min(1, 'Store owner is required'),
});

export const ratingSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().regex(passwordRegex, 'Password must be 8–16 characters with at least one uppercase letter and one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
