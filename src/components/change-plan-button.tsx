'use client'
import React, {useState} from "react";
import LoadingSpinner from "@/components/loading-spinner";
import {changeSubscription} from "@/app/actions/subscriptions";
import {toast} from "react-toastify";

export const ChangePlanButton = ({subscriptionUuid, planUuid, planName}: {subscriptionUuid: string; planUuid: string, planName: string}) => {
  const [isChangingSubscription, setIsChangingSubscription] = useState(false);

  const handleClick  = async () => {
    setIsChangingSubscription(true)
    const change = await changeSubscription(subscriptionUuid, planUuid)
    if (change?.error) toast.error(change?.error)
    setIsChangingSubscription(false)
  }

  return (
    <button
      onClick={handleClick}
      className='p-4 text-white rounded-md leading-none font-bold bg-blue-700 hover:bg-blue-800 transition flex items-center justify-center mr-2'
      disabled={isChangingSubscription}
    >
      {isChangingSubscription ? (
        <div className='w-[14px] mr-2'><LoadingSpinner fill="white"/></div>
      ) : ''}
      Move to {planName}
    </button>
  )
}