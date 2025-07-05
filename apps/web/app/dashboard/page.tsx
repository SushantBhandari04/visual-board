"use client"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button';
import axios from 'axios'

interface CreateRoomInput {
    name: string
}
export default function Home() {
    const { register, handleSubmit, formState: { errors } } = useForm<CreateRoomInput>();
    const onSubmit = async (data: CreateRoomInput)=> {
        try{
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/create-room`,{
                data: {
                    name: data.name,
                }
            },{
                withCredentials: true
            })
            if(response){
                alert("Room created successfully. ")
            }
        }catch(e){
            console.log("Error: ", e);
        }
    }
    return <div className='min-h-screen flex justify-center items-center'>
        <div className='max-w-md p-12 bg-gray-100 rounded-md'>

        
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-8'>
            <div>
                <Label />
                <Input id="name" placeholder='Enter room name' {...register('name', { required: "Name is required" })}
                    className={cn(errors.name && 'border-red-500')}
                />
            </div>
            <Button type="submit" className="w-full rounded-full text-base py-3 font-semibold bg-black text-white hover:bg-gray/800 transition">
                Create Room
            </Button>
        </form>
    </div>
    </div>
}