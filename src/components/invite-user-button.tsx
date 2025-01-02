'use client'
import {useSearchParams} from "next/navigation";

export const InviteUserButton = () => {
  const searchParams = useSearchParams()
  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("modalOpen", "true")
    history.pushState(null, '', `?${params.toString()}`)
  }
  return (
      <button
        onClick={handleClick}
        className={`p-4 text-white rounded-md leading-none font-bold bg-blue-700`}
      >
        Invite user
      </button>
  )
}