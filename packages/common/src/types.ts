import { z }    from 'zod';

export const UserSignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(20),
    name: z.string().min(3).max(20)
});

export const UserSigninSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(20)
});

export const CreateRoomSchema = z.object({
    name: z.string().min(3).max(20)
})