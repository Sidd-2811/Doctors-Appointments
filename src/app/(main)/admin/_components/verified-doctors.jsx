"use client"
import React, { useEffect, useState } from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import useFetch from '@/hooks/use-fetch';
import { updateDoctorActiveStatus } from '@/actions/admin';
import { Ban, Loader, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
const VerifiedDoctors = ({doctors}) => {

  const[searchTerm,setSearchTerm] = useState("");
  const[targetDoctor,setTargetDoctor] = useState(null);

  // to filter doctors
  const filterDoctors = doctors.filter((doctor)=>{
    const query = searchTerm.toLowerCase();
    return (
      doctor.name.toLowerCase().includes(query) ||
      doctor.specialty.toLowerCase().includes(query) ||
      doctor.email.toLowerCase().includes(query)
    )
  })
  

  const{loading,fn:submitStatusUpdate,data} = useFetch(updateDoctorActiveStatus);

  const handleStatusChange = async(doctor)=>{
    const confirmed =window.confirm(`Are your sure you want to suspend ${doctor.name}`)
    if(!confirmed || loading ) return ;

    const formData = new FormData();
    formData.append("doctorId", doctor.id)
    formData.append("suspend", true)
    setTargetDoctor(doctor)
    await submitStatusUpdate(formData)
  }
  useEffect(()=>{
    // data is true and targetDoctor is here
    if( data?.success && targetDoctor){
      toast.success(`Suspended ${targetDoctor.name} successfully!`)
      setTargetDoctor(null)
    }
  },[data])

  return (
    <div>
      <Card className="bg-muted/20 border-emerald-900/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-white">
                Manage Doctors
              </CardTitle>
              <CardDescription>
                View and manage all verified doctors
              </CardDescription>
            </div>

            {/* For searching a doctor */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground " />
              <Input
                placeholder="Search doctors..."
                className="pl-8 bg-background border-emerald-900/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-4'>
          {/* when doctors is not available || searching invalid doctor name */}
          {filterDoctors.length === 0 ? (
            <div>
              {searchTerm
                ? "No doctor matches your criteria"
                : "No verified doctors available"}
            </div>
          ) : (
            <div className='space-y-4'>
              {filterDoctors.map((doctor) => {
                return (
                  <Card
                    key={doctor.id}
                    className="bg-background border-emerald-900/20 hover:border-emerald-700/30 transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className='flex items-center gap-3'>
                          {/* for icons */}
                          <div className="bg-muted/20 rounded-full p-2">
                            <User className="h-5 w-5 text-emerald-400" />
                          </div>
                          {/* for name  */}
                          <div>
                            <h3 className="font-medium text-white">
                              {doctor.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {doctor.specialty} • {doctor.experience} years
                              experience
                            </p>
                          </div>
                        </div>

                        {/* pending badge and  */}

                        <div className="flex items-center gap-2 self-end md:self-auto">
                          <Badge
                            variant="outline"
                            className="bg-emerald-900/20 border-emerald-900/30 text-emerald-400"
                          >
                            Active
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(doctor)}
                            className="bg-red-900/30 border-red-900/10 text-red-400"
                          >
                           {
                            loading && targetDoctor?.id === doctor.id ? (
                              <Loader className='h-4 w-4 mr-1 animate-spin '/>
                            ) : <Ban className='h-4 w-4 mr-1'/>
                           }
                           Suspend
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default VerifiedDoctors