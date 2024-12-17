'use client'
import {usePathname, useRouter, useSearchParams} from "next/navigation";

export const InviteUserButton = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  return (
      <button
        onClick={() => {
          const params = new URLSearchParams(searchParams.toString())
          params.set("modalOpen", "true")
          router.push(pathname + '?' + params.toString())
        }}
        className={`p-4 text-white rounded-md leading-none bg-blue-700`}
      >
        Invite user
      </button>
  )
}