'use client'

import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import axios from 'axios'
import { redirect, useRouter } from 'next/navigation'

interface IFormInput {
  email: string,
  password: string
}

export default function SignInForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>()
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (data: IFormInput) => {
    try{
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/signin`, {
        data: {
          email: data.email,
          password: data.password,
        }
      },{
        withCredentials: true
      })
      if(response){
        alert("Signin successful");
        router.push("/dashboard")
      }
    } catch(e){
      console.log("Error while signing in: ", e);
    }
    // Submit to backend
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl space-y-8 border border-gray-100">
        <div>
          <h2 className="text-3xl font-extrabold text-center mb-1">Sign in to your account</h2>
          <p className="text-center text-sm text-gray-500">
            Join the community to start connecting
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              {...register('email', { required: 'Email is required' })}
              className={cn(errors.email && 'border-red-500')}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Choose a password"
                {...register('password', { required: 'Password is required' })}
                className={cn(errors.password && 'border-red-500 pr-10')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-xs text-gray-500"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

            
        <div className='flex flex-col gap-2 mt-8'>

       
          {/* Submit */}
          <Button type="submit" className="w-full rounded-full text-base py-3 font-semibold bg-primary hover:bg-primary/90 transition">
            Sign In
          </Button>
          <div className='flex w-full justify-center items-right gap-1 font-semibold text-sm text-gray-500'>
                Don't have an account? <a href="/auth/signup" className="text-blue-500 hover:underline">Sign Up</a>
            </div>
             </div>
        </form>

        
      </div>
    </div>
  )
}