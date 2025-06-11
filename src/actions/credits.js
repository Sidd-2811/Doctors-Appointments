"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

 // define credit allocation per plan
    const PLAN_CREDITS = {
        free_user: 0, //  basic plan : 2 credits for free users
        standard: 10, // standard plan : 10 credits
        premium: 24, // premium plan : 20 credits
    } 
     const APPOINTMENT_CREDIT_COST = 2; // cost of an appointment in credits
      

    export async function checkAndAllocateCredits(user) {
   
    try{
        if (!user) {
        return null;
    }
    // only allocate credits for PATIENT role
    if(user.role !== "PATIENT"){
        return user; // if user is not PATIENT, return user
    }
    // to check current subscription plan
    const{has} = await auth();
    const hasBasic = has({plan : "free_user"})  // check if user has free user plan
    const hasStandard = has({plan : "standard"}); // check if user has standard plan
    const hasPremium = has({plan : "premium"}); // check if user has premium plan

    let currentPlan = null;
    let creditsToAllocate = 0;

    // determine current plan and credits to allocate
    if(hasPremium){
        currentPlan = "premium";
        creditsToAllocate = PLAN_CREDITS.premium;
    }
     else if(hasStandard){
        currentPlan = "standard";
        creditsToAllocate = PLAN_CREDITS.standard;
    }
    else if(hasBasic){
        currentPlan = "basic";
        creditsToAllocate = PLAN_CREDITS.free_user;
    }
    if(!currentPlan){
        return user; // if no plan found, return user
    }

    // check if the credits are already allocated for the current plan
    const currentMonth = format(new Date(), "yyyy-MM"); // get current month in YYYY-MM format

    if(user.transactions.length > 0){
        // find latest transaction for the user
        const latestTransaction = user.transactions[0];
        // get the month of the latest transaction
        const transactionMonth = format(new Date (latestTransaction.createdAt),"yyyy-MM");
        // get the transaction plan
        const transactionPlan = latestTransaction.packageId;
        
        // check if the transaction month is same as current month and plan is same as current plan
        if(transactionMonth === currentMonth && transactionPlan === currentPlan){
            console.log("Credits already allocated for this month and plan.");
            return user; // if credits already allocated, return user
        }
    }
        // updated user object with new credits
        const updatedUser = await db.$transaction(async (tx)=>{
            await tx.creditTransaction.create({
                data : {
                userId : user.id,
                amount : creditsToAllocate,
                type : "CREDIT_PURCHASE",
                packageId : currentPlan,
                }
            })

            // update user's credit balance
            const updatedUser = await tx.user.update({
                where : {
                    id : user.id
                },
                data : {
                    credits : {
                        increment : creditsToAllocate
                    }
                }
            })
            return updatedUser;
        })
        // refetch the data 
        revalidatePath("/appointments"); // revalidate the appointments page to reflect new credits
        revalidatePath("/doctors"); // revalidate the doctors page to reflect new credits
    }
    catch(error){
        console.error("Error checking and allocating credits:", error.message);
    }
    return null; // return null if any error occurs
}
