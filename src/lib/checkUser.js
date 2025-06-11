import { currentUser } from "@clerk/nextjs/server"
import { db } from "./prisma";

export const checkUser = async()=>{
    // to get the current User from clerk
const user = await currentUser();
// console.log("Current User:", user);
if(!user){
    return null;
}
try{
    const loggedInUser = await db.user.findUnique({
        where: {
            clerkUserId: user.id, // Assuming you store Clerk user ID in your database
        },
        include : {
            transactions : {
            where : {
                type:"CREDIT_PURCHASE", // Assuming you want to include transactions of type CREDIT_PURCHASE
                createdAt : {
                    gte: new Date(new Date().getFullYear(),new Date().getMonth(),1) // Last 30 days
                },
            },
            orderBy: {
                createdAt : 'desc', // Order by createdAt in descending order
            },
            take: 1, // Get the most recent transaction
        }
       } 
    })
    if(loggedInUser){
        return loggedInUser;
    }
    // If user is not found in the database, then we can simply add them to the database

    const name = `${user.firstName} ${user.lastName}`;
    const newUser = await db.user.create({
        data : {
            clerkUserId : user.id,
            name,
            imageUrl : user.imageUrl,
            email:user.emailAddresses[0].emailAddress,
            // to add some credit points when a new user is created
            transactions :{
                create : {
                    type : "CREDIT_PURCHASE",
                    packageId : "free_user",
                    amount : 2,
                }
            }
        }
    })
    return newUser;

}
catch(error){
    console.error("Error checking user:", error.message);
}
}