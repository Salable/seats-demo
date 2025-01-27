'use client'
import React, {useRef, useState} from "react";
import {useOnClickOutside} from "usehooks-ts";
import { User } from "@prisma/client";
import {Session} from "@/app/actions/sign-in";
import {updateLicense} from "@/app/actions/licenses/update";
import {toast} from "react-toastify";
import LoadingSpinner from "@/components/loading-spinner";
import {License} from "@salable/node-sdk/dist/src/types";

export const AssignUser = (
  {
    assignedUser,
    nonLicensedUsers,
    subscriptionUuid,
    subscriptionStatus,
    license,
    session
  }: {
    assignedUser: User | null,
    nonLicensedUsers: User[],
    subscriptionUuid: string,
    subscriptionStatus: string,
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
  const handleClickInviteUser = () => {
    const params = new URLSearchParams()
    params.set("modalOpen", "true")
    params.set("licenseUuid", license.uuid)
    params.set("subscriptionUuid", subscriptionUuid)
    history.pushState(null, '', `?${params.toString()}`)
  }
  return (
    <div className='border-b-2 relative'>
      <div className='p-3 flex justify-between'>
        <div>
          <div
            className='flex items-center'
            aria-label={assignedUser?.username ? 'Reassign seat' : 'Assign seat'}
          >
            <div className='rounded-full mr-3'>
              <div className='w-[38px] h-[38px] rounded-full bg-blue-200 leading-none flex items-center justify-center'>
                <span>{!isPending ? assignedUser?.username?.[0].toUpperCase() : "?"}</span>
              </div>
            </div>
            <div className='text-left' ref={ref}>
              {assignedUser?.username ? (
                <div>{assignedUser.username}</div>
              ) : null}
              {!assignedUser && nonLicensedUsers.length ? (
                <>
                  {isUpdatingUser ? (
                    <div className='h-[14px] w-[14px]'><LoadingSpinner fill='#000000'/></div>
                  ) : (
                    <button
                      className='p-2 border-2 rounded-md text-gray-500 text-xs font-bold'
                      onClick={() => {
                        if (!isUser) setShowUsers(!showUsers)
                      }}
                      disabled={subscriptionStatus === 'CANCELED'}
                    >
                      Assign user
                    </button>
                  )}
                  {showUsers ? (
                    <div className='absolute z-10 border-2 bg-white'>
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
                </>
              ) : null}
              {assignedUser ? <div className='text-xs text-gray-500'>{assignedUser.email}</div> : null}
            </div>
          </div>
        </div>
        <div className='flex items-center'>
          {isPending ? (
            <div className='mb-1'><span className='p-1 bg-yellow-300 text-xs rounded-sm mr-2 uppercase font-bold'>Pending</span></div>
          ) : null}
          {isUser ? <div className='p-1 ml-2 rounded-sm text-gray-500 bg-gray-200 text-xs font-bold uppercase'>You</div> : null}
          {subscriptionStatus !== 'CANCELED' ? (
            <>
              {assignedUser?.uuid && assignedUser.uuid !== session.uuid ? (
                <button className='p-2 border-2 rounded-md text-gray-500 text-xs font-bold' onClick={handleClickUnassignUser}>
                  Unassign user
                </button>
              ) : null}
              {!assignedUser ? (
                <button className='p-2 border-2 rounded-md text-gray-500 text-xs font-bold' onClick={handleClickInviteUser}>
                  Invite user
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}