'use client'
import React, {useRef, useState} from "react";
import {useOnClickOutside} from "usehooks-ts";
import { User } from "@prisma/client";
import {License} from "@/fetch/licenses/get-all";
import {Session} from "@/app/actions/sign-in";
import {updateLicense} from "@/app/actions/licenses/update";
import {toast} from "react-toastify";
import LoadingSpinner from "@/components/loading-spinner";

export const AssignUser = (
  {
    assignedUser,
    nonLicensedUsers,
    subscriptionUuid,
    license,
    session
  }: {
    assignedUser: User | null,
    nonLicensedUsers: User[],
    subscriptionUuid: string,
    license: License,
    session: Session
  },
) => {
  const isPending = assignedUser && !assignedUser.username
  const isUser = assignedUser?.uuid === session.uuid
  const ref = useRef(null)
  const [showUsers, setShowUsers] = useState<boolean>(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState<boolean>(false);
  const clickOutside = () => {
    setShowUsers(false)
  }
  useOnClickOutside(ref, clickOutside)
  const handleClickAssignSeat = (granteeId: string) => async () => {
    try {
      setShowUsers(false)
      setIsUpdatingUser(true)
      const updateUser = await updateLicense({
        uuid: license.uuid,
        granteeId
      }, `/dashboard/subscriptions/${subscriptionUuid}`)
      if (updateUser?.error) toast.error(updateUser.error)
      setIsUpdatingUser(false)
    } catch (e) {
      console.error(e)
      toast.error('Failed to update license')
      setIsUpdatingUser(false)
    }
  }
  const handleClickUnassignUser = async () => {
    try {
      setShowUsers(false)
      setIsUpdatingUser(true)
      const updateUser = await updateLicense({
        uuid: license.uuid,
        granteeId: null
      }, `/dashboard/subscriptions/${subscriptionUuid}`)
      if (updateUser?.error) toast.error(updateUser.error)
      setIsUpdatingUser(false)
    } catch (e) {
      console.error(e)
      toast.error('Failed to update license')
      setIsUpdatingUser(false)
    }
  }

  return (
    <div className={`border-b-2`} ref={ref}>
      <div className='p-3 flex justify-between'>
        <div>
          <div
            className={`flex items-center ${!isUser ? 'cursor-pointer' : ''}`}
            onClick={() => {
              if (!isUser) setShowUsers(!showUsers)
            }}
          >
            <div className='rounded-full mr-3'>
              <div className='w-[38px] h-[38px] cursor-pointer rounded-full bg-blue-200 leading-none flex items-center justify-center'>
                <span>{!isPending ? assignedUser?.username?.[0].toUpperCase() : "?"}</span>
              </div>
            </div>
            <div>
              {assignedUser?.username ? (
                <div>{assignedUser.username}</div>
              ) : null}
              {!assignedUser && nonLicensedUsers.length ? (
                <>
                  {isUpdatingUser ? (
                    <div className='h-[14px] w-[14px]'><LoadingSpinner fill='#000000'/></div>
                  ) : (
                    <div>Assign Seat</div>
                  )}
                </>
              ) : null}
              {assignedUser ? <div className='text-xs text-gray-500'>{assignedUser.email}</div> : null}
            </div>
          </div>
          {showUsers ? (
            <div className='absolute border-2 bg-white'>
              {nonLicensedUsers.map((user, i) => (
                <button
                  className='flex items-center p-2 cursor-pointer hover:bg-gray-200 text-xs w-full' key={`${i}_assign_users`}
                  aria-label={`Assign seat to user ${user.username}`}
                  onClick={handleClickAssignSeat(user.uuid)}
                >
                  <div className='rounded-full mr-3'>
                    <div className='w-[24px] h-[24px] text-sm cursor-pointer rounded-full bg-blue-200 leading-none flex items-center justify-center'>
                      <span className='text-xs'>{user.username?.[0].toUpperCase()}</span>
                    </div>
                  </div>
                  <div>{user.username}</div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className='flex items-center'>
          {isPending ? (
            <div className='mb-1'><span className='p-1 bg-yellow-300 text-xs rounded-sm mr-2 uppercase font-bold'>Pending</span></div>
          ) : null}
          {isUser ? <div className='p-1 ml-2 rounded-sm text-gray-500 bg-gray-200 text-xs font-bold uppercase'>You</div> : null}
          {assignedUser?.uuid && assignedUser.uuid !== session.uuid ? (
            <button
              className='p-2 border-2 rounded-md text-gray-500 text-xs'
              onClick={handleClickUnassignUser}
            >
              Unassign user
            </button>
          ) : null}
          {!assignedUser ? (
            <button className='p-2 border-2 rounded-md text-gray-500 text-xs'
              onClick={() => {
                const params = new URLSearchParams()
                params.set("modalOpen", "true")
                params.set("licenseUuid", license.uuid)
                params.set("subscriptionUuid", subscriptionUuid)
                history.pushState(null, '', `?${params.toString()}`)
              }}
            > Invite user</button>
          ) : null}
        </div>
      </div>
    </div>
  )
}