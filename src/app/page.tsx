'use client'
import React, {useEffect, useState} from "react";
import useSWR, {SWRConfig} from "swr";
import LoadingSpinner from "@/components/loading-spinner";
import {useRouter, useParams, useSearchParams} from 'next/navigation';
import Image from "next/image";
import {SalableProvider, useSalableContext} from "@/components/context";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import {subscription} from "swr/subscription";
import Link from "next/link";

const activeUser =   {
    id: 'userId_1',
    name: 'Perry George',
    avatar: '/avatars/perry-avatar.png',
    email: 'pgeorge@adaptavist.com'
}

export default function Home() {
  return (
    <SWRConfig value={{fetcher: (url) => fetch(url).then(res => res.json())}}>
      <SalableProvider>
        <main className="min-h-screen p-24 bg-gray-100">
          <div className="w-full font-sans text-sm">
            <ToastContainer />
            <Main/>
          </div>
        </main>
      </SalableProvider>
    </SWRConfig>
  );
}

const Main = () => {
  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        <Link href="/public">Back to users</Link>
        <div>I am not licensed</div>
      </div>
    </>
  )
}