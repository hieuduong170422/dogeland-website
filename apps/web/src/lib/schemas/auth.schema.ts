import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Tối thiểu 3 ký tự')
    .max(30, 'Tối đa 30 ký tự')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Chỉ được dùng chữ, số, dấu _ và -'),
  email: z.string().email('Email không hợp lệ'),
  password: z
    .string()
    .min(8, 'Tối thiểu 8 ký tự')
    .max(100, 'Tối đa 100 ký tự')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  login: z.string().min(1, 'Vui lòng nhập username hoặc email'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  rememberMe: z.boolean().optional(),
  totpCode: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  login: z.string().min(1, 'Vui lòng nhập username hoặc email'),
});

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Tối thiểu 8 ký tự')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
