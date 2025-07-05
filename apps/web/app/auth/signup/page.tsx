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
  name: string
  phone: string
  email: string
  password: string
  agree: boolean
}

export default function SignUpForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>()
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (data: IFormInput) => {
    console.log(data)

    try{
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/signup`, {
        data:{
          email: data.email,
          password: data.password,
          name: data.name,
        }
      })
      if(response){
        alert("Signup successful");
        router.push("/auth/signin")
      }
    } catch(e){
      console.log("Error while signing up: ", e)
    }
    
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl space-y-8 border border-gray-100">
        <div>
          <h2 className="text-3xl font-extrabold text-center mb-1">Create an account</h2>
          <p className="text-center text-sm text-gray-500">
            Join the community to start connecting
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              {...register('name', { required: 'Name is required' })}
              className={cn(errors.name && 'border-red-500')}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

         

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

          {/* Terms */}
          <div className="flex items-center space-x-2">
            <Checkbox id="agree" {...register('agree', { required: true })} />
            <label
              htmlFor="agree"
              className="text-sm text-gray-600 leading-none cursor-pointer"
            >
              I agree to the{' '}
              <a href="#" className="text-primary font-medium underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary font-medium underline">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.agree && <p className="text-xs text-red-500">You must agree to continue.</p>}

           
            <div className='flex flex-col gap-2 mt-8'>

            
          {/* Submit */}
          <Button type="submit" className="w-full rounded-full text-base py-3 font-semibold bg-primary hover:bg-primary/90 transition">
            Create Account
          </Button>

          <div className='flex w-full justify-center items-right gap-1 font-semibold text-sm text-gray-500'>
                Already have an account? <a href="/auth/signin" className="text-blue-500 hover:underline">Sign In</a>
            </div>
            </div>
        </form>
        

        
      </div>
    </div>
  )
}