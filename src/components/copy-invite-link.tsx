'use client'
import {appBaseUrl} from "@/app/constants";
import {useState} from "react";

export const CopyInviteLink = ({token, licenseUuid}: {token: string, licenseUuid?: string}) => {
  const [showMessage, setShowMessage] = useState(false)
  const handleClick = async () => {
    try {
      const params = new URLSearchParams()
      params.set('token', token)
      if (licenseUuid) params.set('licenseUuid', licenseUuid)
      await navigator.clipboard.writeText(`${appBaseUrl}/accept-invite?${params.toString()}`);
      setShowMessage(true)
      setTimeout(() => {
        setShowMessage(false)
      }, 600)
    } catch (e) {
      console.log(e)
    }
  }
  return (
    <button
      className='p-2 border-2 rounded-md text-gray-500 text-xs relative font-bold'
      onClick={handleClick}
    >
      Copy invite link
      <span
        aria-disabled={true}
        className={`absolute p-2 leading-none bg-black text-white top-[-32px] right-0 ${showMessage ? 'opacity-100' : 'opacity-0'} transition rounded-sm pointer-events-none normal-case`}
      >
        Copied!
      </span>
    </button>
  )
}