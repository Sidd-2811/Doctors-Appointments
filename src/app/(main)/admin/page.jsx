import { getPendingDoctors, getVerifiedDoctors } from "@/actions/admin";
import { TabsContent } from "@radix-ui/react-tabs";
import React from "react";
import PendingDoctors from "./_components/pending-doctors";
import VerifiedDoctors from "./_components/verified-doctors";

const AdminPage = async() => {
    // fetch the data first
    const [pendingDoctorsData,verifiedDoctorsData] = await Promise.all([
        getPendingDoctors(),
        getVerifiedDoctors(),
    ])
  return (
    <div>
      <TabsContent 
      value="pending"
       className="border-none p-0 "     
      >
        <PendingDoctors doctors={pendingDoctorsData.doctors || []} />
      </TabsContent>
      <TabsContent 
      value="doctors"
       className="border-none p-0 " 
      >
        <VerifiedDoctors doctors={verifiedDoctorsData.doctors || []} />
      </TabsContent>
    </div>
  );
};

export default AdminPage;
