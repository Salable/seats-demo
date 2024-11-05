'use client'
import React, {useRef, useState} from "react";
import {LockIcon} from "@/components/icons/lock-icon";
import {TickIcon} from "@/components/icons/tick-icon";
import Head from "next/head";
import LoadingSpinner from "@/components/loading-spinner";
import {useOnClickOutside} from "usehooks-ts";
import {useRouter} from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import {Session, User} from "@/app/settings/subscriptions/[uuid]/page";
import {CrossIcon} from "@/components/icons/cross-icon";
import {PlanButton} from "@/components/plan-button";
import {salableBasicPlanUuid, salableProductUuid, salableProPlanUuid} from "@/app/constants";
import {GetAllSubscriptionsResponse, SalableSubscription} from "@/app/api/subscriptions/route";

export type LicenseCheckResponse = {
  capabilities: string[],
  publicHash: string,
  signature: string,
  capsHashed: string,
  capabilitiesEndDates: Record<string, string>
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Salable Seats Demo</title>
      </Head>
      <main>
        <div className="w-full font-sans text-sm">
          <Main />
        </div>
      </main>
    </>
  );
}

const Main = () => {
  const {data: session, isLoading: isLoadingSession, isValidating: isValidatingSession} = useSWR<Session>(`/api/session`)
  const {data: licenseCheck, isLoading: isLoadingLicenseCheck, isValidating: isValidatingLicenseCheck} = useSWR<LicenseCheckResponse>(`/api/licenses/check?productUuid=${salableProductUuid}`)
  const {data: owner} = useSWR<User[]>(`/api/organisations/${session?.organisationUuid}/owner`)
  const {data: subscriptions, isLoading: isLoadingSubscriptions, isValidating: isValidatingSubscriptions} = useSWR<GetAllSubscriptionsResponse>(`/api/subscriptions?status=active`)

  const isOwner = session?.uuid === owner

  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        {(!isLoadingSession && !isValidatingSession) && (!isLoadingLicenseCheck && !isValidatingLicenseCheck) && (!isLoadingSubscriptions && !isValidatingSubscriptions) ? (
          <>
            {(!licenseCheck?.capabilitiesEndDates && isOwner && subscriptions?.data.length === 0) || !session?.uuid ? (
              <div className='grid grid-cols-3 gap-6'>

                <div className='p-6 rounded-lg bg-white shadow flex-col'>
                  <h2 className='mb-2 font-bold text-2xl'>Basic</h2>
                  <div className='mb-4'>
                    <div className='flex items-end mb-1'>
                      <div className='text-3xl mr-2'>
                        <span className='font-bold'>£1</span>
                        <span className='text-xl'> / per seat</span>
                      </div>
                    </div>
                    <div className='text-xs'>per month</div>
                  </div>
                  <p className='text-gray-500 text-lg mb-4'>
                    Everything you need to start building.
                  </p>
                  <div className='mb-6'>
                    <div className='flex items-center'>
                      <span className='mr-1'><TickIcon fill="#000" width={15} height={15}/></span>Photos
                    </div>
                    <div className='flex items-center'>
                      <span className='mr-1'><TickIcon fill="#000" width={15} height={15}/></span>Videos
                    </div>
                    <div className='flex items-center line-through'>
                      <span className='mr-1'><CrossIcon fill="#000" width={15} height={15}/></span>Export
                    </div>
                    <div className='flex items-center line-through'>
                      <span className='mr-1'><CrossIcon fill="#000" width={15} height={15}/></span>Crop
                    </div>
                  </div>
                  <div>
                    {!isLoadingSession && !session?.uuid ? (
                      <Link
                        href={"/sign-up?planUuid=" + salableBasicPlanUuid}
                        className='block p-4 text-white rounded-md leading-none bg-blue-700 w-full text-center'
                      >
                        Sign up
                      </Link>
                    ) : (
                      <PlanButton uuid={salableBasicPlanUuid} />
                    )}
                  </div>
                </div>

                <div className='p-6 rounded-lg bg-white shadow flex-col'>
                  <h2 className='mb-2 font-bold text-2xl'>Pro</h2>
                  <div className='mb-4'>
                    <div className='flex items-end mb-1'>
                      <div className='text-3xl mr-2'>
                        <span className='font-bold'>£2</span>
                        <span className='text-xl'> / per seat</span>
                        <span className='text-sm ml-1'>(min 4 seats)</span>
                      </div>
                    </div>
                    <div className='text-xs'>per month</div>
                  </div>
                  <p className='text-gray-500 text-lg mb-4'>
                    Access to every tool you could ever need.
                  </p>
                  <div className='mb-6'>
                    <div className='flex items-center'>
                      <span className='mr-1'><TickIcon fill="#000" width={15} height={15}/></span>Photos
                    </div>
                    <div className='flex items-center'>
                      <span className='mr-1'><TickIcon fill="#000" width={15} height={15}/></span>Videos
                    </div>
                    <div className='flex items-center'>
                      <span className='mr-1'><TickIcon fill="#000" width={15} height={15}/></span>Export
                    </div>
                    <div className='flex items-center'>
                      <span className='mr-1'><TickIcon fill="#000" width={15} height={15}/></span>Crop
                    </div>
                  </div>
                  <div>
                    {!isLoadingSession && !session?.uuid ? (
                      <Link
                        href={`/sign-up?planUuid=${salableProPlanUuid}`}
                        className='block p-4 text-white rounded-md leading-none bg-blue-700 w-full text-center'
                      >
                        Sign up
                      </Link>
                    ) : (
                      <PlanButton uuid={salableProPlanUuid} />
                    )}
                  </div>
                </div>

              </div>
            ) : null}

            {!isOwner && session?.uuid || isOwner && subscriptions?.data.length ? (
              <div className='mt-6'>
                <div className='mb-6 flex items-center flex-shrink-0'>
                  <h2 className='text-2xl font-bold text-gray-900 mr-4'>
                    User capabilities
                  </h2>
                </div>
                <div className='flex flex-col'>
                  <div
                    className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!licenseCheck?.capabilitiesEndDates?.photos || isValidatingLicenseCheck ? "bg-gray-500" : "bg-green-800"}`}>
                    <span>Photos capability</span>
                    {isValidatingLicenseCheck ? <div className='w-[24px]'><LoadingSpinner fill="white"/>
                    </div> : (!licenseCheck?.capabilitiesEndDates?.photos ? (<LockIcon/>) : (<TickIcon/>))}
                  </div>
                  <div
                    className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!licenseCheck?.capabilitiesEndDates?.videos || isValidatingLicenseCheck ? "bg-gray-500" : "bg-green-800"}`}>
                    <span>Videos capability</span>
                    {isValidatingLicenseCheck ? <div className='w-[24px]'><LoadingSpinner fill="white"/>
                    </div> : (!licenseCheck?.capabilitiesEndDates?.videos ? (<LockIcon/>) : (<TickIcon/>))}
                  </div>
                  <div
                    className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!licenseCheck?.capabilitiesEndDates?.export || isValidatingLicenseCheck ? "bg-gray-500" : "bg-green-800"}`}>
                    <span>Export capability</span>
                    {isValidatingLicenseCheck ? <div className='w-[24px]'><LoadingSpinner fill="white"/>
                    </div> : (!licenseCheck?.capabilitiesEndDates?.export ? (<LockIcon/>) : (<TickIcon/>))}
                  </div>
                  <div
                    className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!licenseCheck?.capabilitiesEndDates?.crop || isValidatingLicenseCheck ? "bg-gray-500" : "bg-green-800"}`}>
                    <span>Crop capability</span>
                    {isValidatingLicenseCheck ? <div className='w-[24px]'><LoadingSpinner fill="white"/>
                    </div> : (!licenseCheck?.capabilitiesEndDates?.crop ? (<LockIcon/>) : (<TickIcon/>))}
                  </div>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="w-[20px]">
            <LoadingSpinner/>
          </div>
        )}
      </div>
    </>
  )
}

const LoadingSkeleton = () => {
  return (
    <div className="shadow rounded-sm p-4 w-full bg-white mx-auto mb-2">
      <div className="animate-pulse flex w-full">
        <div className="flex-1 space-y-6 py-1">
          <div className="flex justify-between">
            <div className='flex'>
              <div className="mr-2 h-2 bg-slate-300 rounded w-[100px]"></div>
            </div>
            <div className='flex'>
              <div className="mr-2 h-2 bg-slate-300 rounded w-[100px]"></div>
              <div className="h-2 bg-slate-300 rounded w-[50px]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}