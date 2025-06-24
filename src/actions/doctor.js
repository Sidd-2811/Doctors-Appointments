"use server"
// getting and setting availability slots

import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SlotStatus } from "@/generated/prisma/client";

export const setAvailabilitySlots = async(formData)=>{
    // check if user is logged in or not

    const {userId} = await auth();
    if(!userId) {
        throw new Error("Unauthorized")
    } 

    try{
      const doctor = await db.user.findUnique({
        where: {
          clerkUserId: userId,
          role: "DOCTOR",
        },
      });
      if (!doctor) {
        throw new Error("Doctor not found");
      }

      // Set start and end time using formData
      const startTime = formData.get("startTime");
      const endTime = formData.get("endTime");

      // validate input
      if (!startTime || !endTime) {
        throw new Error("Start Time and End Time is required");
      }
      if (startTime >= endTime) {
        throw new Error("Start Time Must Be Before End Time");
      }

      // 🔍 Find all availability slots for the doctor from the database
      const existingSlots = await db.availability.findMany({
        where: {
          doctorId: doctor.id, // Match slots for this specific doctor
        },
      });

      // ✅ If the doctor has any existing slots
      if (existingSlots.length > 0) {
        // 📌 Filter out the slots that do NOT have an appointment linked
        const slotsWithNoAppointments = existingSlots.filter(
          (slot) => !slot.appointment
        );

        // ✅ If there are any free (unbooked) slots
        if (slotsWithNoAppointments.length > 0) {
          // 🗑️ Delete all free slots from the database
          await db.availability.deleteMany({
            where: {
              id: {
                // Get the IDs of the free slots to delete them
                in: slotsWithNoAppointments.map((slot) => slot.id),
              },
            },
          });
        }
      }

      // 🆕 Create a new availability slot in the database
      const newSlot = await db.availability.create({
        data: {
          doctorId: doctor.id, // ✅ Link the slot to the doctor's unique ID

          startTime: new Date(startTime), // 🕒 The time doctor chose to start availability (converted to Date)
          endTime: new Date(endTime), // 🕔 The time doctor chose to end availability (converted to Date)

          status:SlotStatus.AVAILABLE, // 📌 Mark this slot as available for appointments
        },
      });

      revalidatePath("/doctor");
      return { success: true, slot: newSlot };
    }

    catch(error){
        console.error("failed to set availability " + error.message)
    }
    
}
export const getDoctorAvailability = async()=>{
  // check if user is logged in or not

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  try{
     // 🔍 Find the doctor using the logged-in user's ID
    const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // find all the availability slots for that doctor
    const availabilitySlots = await db.availability.findMany({
        where : {
            doctorId : doctor.id
        },
        orderBy : {
            startTime : "asc"
        }
    })

    return {slots : availabilitySlots}

  }
  catch(error){
    console.error("failed to fetch availability slots : "+error.message)
  }
}

export const getDoctorAppointments = async()=>{
    return []
}