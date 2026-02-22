import { z } from 'zod';

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * JobType enum - matches backend
 */
export enum JobType {
  SPECIAL_EDUCATION = 'SPECIAL_EDUCATION',
  DAYCARE_TEACHER = 'DAYCARE_TEACHER',
  KINDERGARTEN = 'KINDERGARTEN',
  CARE_TEACHER = 'CARE_TEACHER',
  STUDENT = 'STUDENT',
  DIRECTOR = 'DIRECTOR',
  LAWYER = 'LAWYER',
  OTHER = 'OTHER',
}

/**
 * Register schema
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, '닉네임은 2자 이상이어야 합니다')
      .max(100)
      .refine((val) => !/[<>]/.test(val), '닉네임에 사용할 수 없는 문자가 포함되어 있습니다'),
    email: z.string().email('유효한 이메일 주소를 입력해주세요'),
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다')
      .max(100)
      .refine(
        (val) => /[a-zA-Z]/.test(val) && /\d/.test(val),
        '비밀번호는 영문과 숫자를 포함해야 합니다',
      ),
    confirmPassword: z.string(),
    jobType: z.nativeEnum(JobType).optional(),
    career: z.number().int().min(0).max(50).optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * User response schema
 */
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof userSchema>;
