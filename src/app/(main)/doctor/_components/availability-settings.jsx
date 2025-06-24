"use client"

import { setAvailabilitySlots } from '@/actions/doctor'
import useFetch from '@/hooks/use-fetch'
import React, { useEffect, useState } from 'react'
import {  useForm } from 'react-hook-form'
import TimePicker from 'react-time-picker'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertCircle, Clock, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { format } from 'date-fns'

const AvailabilitySettings = ({slots}) => {

  const [showForm,setShowForm] = useState(false);

  const {loading,fn:submitSlots,data} = useFetch(setAvailabilitySlots)

 const {register,handleSubmit,formState : {errors}} =  useForm ({
    defaultValues : {
      startTime : "",
      endTime : ""
    }
  })
  const createLocalDateFromTime = (timeStr)=>{
    const [hours, minutes] = timeStr.split(":").map(Number);
    const now = new Date();
    const date = new Date( now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    return date;
  }


 // Handle slot submission
  const onSubmit = async (data) => {
    if (loading) return;

    const formData = new FormData();

    // Create date objects
    const startDate = createLocalDateFromTime(data.startTime);
    const endDate = createLocalDateFromTime(data.endTime);

    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

    if (startDate >= endDate) {
      toast.error("End time must be after start time");
      return;
    }

    // Add to form data
    formData.append("startTime", startDate.toISOString());
    formData.append("endTime", endDate.toISOString());

    await submitSlots(formData);
  };

  useEffect(()=>{
    if(data && data?.success){
      setShowForm(false);
      toast.success("Availability slots updated successfully");
    }
  },[data])

  const formatTimeString  = (dateString)=>{
    try {
      return format(new Date(dateString), "hh:mm a");
    }
    catch (error) {
      console.error("Error formatting time string:", error);
      return dateString; // Fallback to original if error occurs
    }
  }

  return (
    <Card className="border-emerald-900/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center ">
            <Clock className='h-5 w-5 mr-2 text-emerald-400'/>
            Availability Settings
        </CardTitle>
        <CardDescription>
          Set your daily availability for patient appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {
          showForm ? (
            <>
            <div className='mb-6'>
              <h1 className='text-lg font-medium text-white mb-3'>Current Availability</h1>
            </div>

            {slots.length === 0 ? ( <p className="text-muted-foreground">
                  You haven&apos;t set any availability slots yet. Add your
                  availability to start accepting appointments.
                </p>  ) : (
                 <div>
                  {slots.map((slot)=>{
                    console.log("Slot:", slot);
                    return (
                      <div key={slot.id}
                      className='flex items-center mb-4 p-3 rounded-md bg-muted/20 border border-emerald-900/20'
                       >

                      <div className='bg-emerald-900/20 p-2 rounded-full mr-3'>
                        <Clock className='h-4 w-4 text-emerald-400 mr-2 inline' />
                      </div>

                        <p className='text-white font-medium'>
                            { formatTimeString(slot.startTime)} - {" "}
                             {formatTimeString(slot.endTime)}
                        </p>

                      </div>
                )
                  })}
                  </div>
                )
              }

          <form className='space-y-4 border border-emerald-900/20 rounded-md p-4'
          onSubmit={handleSubmit(onSubmit)}
          >
            <h3 className='text-lg font-medium text-white mb-2'>Set Daily Availability</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor="startTime" >Start Time</Label>
                <Input 
                  id="startTime"
                  type="time"
                  {...register("startTime",{required : "Start time is required"})}
                  className="bg-background border-emerald-900/20"
                />
                {errors.startTime && 
                <p className='text-sm font-medium text-red-500'> {errors.startTime.message}</p>
                }
              </div>

              <div className='space-y-2'>
                <Label htmlFor="endTime" >End Time</Label>
                <Input 
                  id="endTime"
                  type="time"
                  {...register("endTime",{required : "End time is required"})}
                  className="bg-background border-emerald-900/20"
                />
                {errors.endTime && 
                <p className='text-sm font-medium text-red-500'> {errors.endTime.message}</p>
                }
              </div>
            </div>

                <div className='flex justify-end space-x-3 pt-2'>
                  {/* Cancel button */}
                  <Button 
                  className=" border-emerald-900/30 "
                  type="button"
                  variant="outline"
                  onClick={()=>setShowForm(false)}
                  disabled={loading}
                  >
                    Cancel
                  </Button>
                  {/* Save Availability Button */}
                  <Button
                  type="submit"
                  disabled={loading}
                   className="bg-emerald-600 hover:bg-emerald-700"
                   >
                   {loading ?(
                   <>
                    <Loader2 className='h-4 w-4 animate-spin mr-2'/> 
                    Saving...
                   </>
                   ) : ("Save Availability")
                    }
                   
                   </Button>
                </div>
          </form>
            </>
          ) :
          <>
          <Button 
          onClick={()=>setShowForm(true)}
          className= "w-full bg-emerald-600 hover:bg-emerald-700" >
            <Plus className='h-4 w-4 mr-2'/>
            Set Availability Time
          </Button>
          </>
          
        }
           <div className="mt-6 p-4 bg-muted/10 border border-emerald-900/10 rounded-md">
          <h4 className="font-medium text-white mb-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-emerald-400" />
            How Availability Works
          </h4>
          <p className="text-muted-foreground text-sm">
            Setting your daily availability allows patients to book appointments
            during those hours. The same availability applies to all days. You
            can update your availability at any time, but existing booked
            appointments will not be affected.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default AvailabilitySettings