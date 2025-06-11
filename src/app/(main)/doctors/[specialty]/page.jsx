"use client";
import { useParams } from 'next/navigation';
import React from 'react'

const SpecialtyPage = () => {
    // This is a placeholder for the speciality page component.
    const {specialty} =  useParams();

  return (
    <div>SpecialtyPage : {specialty}</div>
  )
}

export default SpecialtyPage