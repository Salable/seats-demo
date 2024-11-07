'use client'
import React, {useState} from "react";
import LoadingSpinner from "@/components/loading-spinner";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import useSWR from "swr";
import {Session, User} from "@/app/settings/subscriptions/[uuid]/page";
import {DBOrganisation} from "@/app/api/organisations/[id]/route";
import {Modal} from "@/components/modal";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {appBaseUrl} from "@/app/constants";

export default function Dashboard() {
  return (
    <>
      <Head><title>Salable Seats Demo</title></Head>
      <main>
        <div className="w-full font-sans text-sm">
          <Main/>
        </div>
      </main>
    </>
  );
}

const Main = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const {data: session, isLoading: isLoadingSession, isValidating: isValidatingSession} = useSWR<Session>(`/api/session`)
  const {data: users, isLoading: isLoadingUsers, isValidating: isValidatingUsers} = useSWR<User[]>(`/api/organisations/${session?.organisationUuid}/users`)
  const {
    data: owner,
  } = useSWR<User[]>(`/api/organisations/${session?.organisationUuid}/owner`)
  const {
    data: organisation,
    isLoading: organisationIsLoading
  } = useSWR<DBOrganisation>(`/api/organisations/${session?.organisationUuid}`)

  const isModalOpen = searchParams.get("modalOpen")
  const isOwner = session?.uuid === owner
  if (!isValidatingSession && !isLoadingSession && !session?.uuid) {
    router.push("/")
  }
  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        {!organisationIsLoading && organisation ? <h1 className='text-3xl mb-4'>{organisation.name}</h1> : null}
        <div>
          {(!isLoadingSession && !isValidatingSession) && (!isLoadingUsers && !isValidatingUsers) && users?.length ? (
            <>
              <div className='mb-6 bg-white shadow rounded-md'>
                {users.map((user, i) => {
                  return (
                    <div className='p-3 rounded-sm border-b-2' key={user.uuid}>
                      <div className='flex justify-between items-center'>
                        <p className='mr-2'>{user.username} <span
                          className='text-gray-500 italic text-sm'>({user.email})</span></p>
                        {user.uuid === session?.uuid ? <div
                          className='p-1 border-2 rounded-md text-gray-500 bg-gray-200 text-xs leading-none font-bold'>You</div> : null}
                        {user.username && session && user.uuid !== session.uuid && isOwner ? (
                          <DeleteUser userUuid={user.uuid}/>
                        ) : null}
                        {!user.username && user.email ? (
                          <div>
                            <span
                              className='p-1 bg-yellow-300 text-xs rounded-sm mr-2 uppercase font-bold'>Pending</span>
                            <button
                              className='p-2 border-2 rounded-md text-gray-500 text-xs'
                              onClick={async () => {
                                try {
                                  const params = new URLSearchParams();
                                  params.set('email', user.email);
                                  const res = await fetch(`/api/tokens?${params}`)
                                  const data = await res.json()
                                  if (res.ok) {
                                    const link = `${appBaseUrl}/accept-invite?token=${data.value}`
                                    await navigator.clipboard.writeText(link);
                                  }
                                } catch (e) {
                                  console.log(e)
                                }
                              }}
                            >
                              Copy invite link
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
              {session?.organisationUuid ? (
                <div className='flex justify-end'>
                  <button
                    onClick={async () => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.set("modalOpen", "true")
                      router.push(pathname + '?' + params.toString())
                    }}
                    className={`p-4 text-white rounded-md leading-none bg-blue-700`}
                  >
                    Invite user
                  </button>
                </div>
              ) : null}

            </>
          ) : (
            <div>
              <LoadingSkeleton/>
            </div>
          )}
        </div>

        {isModalOpen ? (
          <Modal/>
        ) : null}
      </div>
    </>
  )
}

const DeleteUser = ({userUuid}: { userUuid: string }) => {
  const {data: session} = useSWR<Session>(`/api/session`)
  const {mutate: mutateUsers} = useSWR<User[]>(`/api/organisations/${session?.organisationUuid}/users`)
  const [isDeletingUser, setIsDeletingUser] = useState(false)
  return (
    <>
      <button
        className='text-red-600 p-1 border-2 rounded-md border-red-600 text-xs font-bold'
        onClick={async () => {
          try {
            setIsDeletingUser(true)
            await fetch(`/api/users/${userUuid}`, {
              method: 'DELETE',
            })
            await mutateUsers()
          } catch (e) {
            console.log(e)
          }
        }}
      >
        {!isDeletingUser ? "Delete" : (
          <div className='w-[15px]'><LoadingSpinner fill="#dc2726"/></div>
        )}
      </button>
    </>
  )
}

const LoadingSkeleton = () => {
  return (
    <div>
      <div className="mb-4 h-2 bg-slate-300 rounded w-[100px]"></div>

      <div className="shadow rounded-sm p-4 w-full bg-white mx-auto border-b-2">
        <div className="animate-pulse flex w-full">
          <div>
            <div className="flex justify-between">
              <div className='flex'>
                <div className="mr-2 h-2 bg-slate-300 rounded w-[100px]"></div>
                <div className="h-2 bg-slate-300 rounded w-[50px]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="shadow rounded-sm p-4 w-full bg-white mx-auto border-b-2">
        <div className="animate-pulse flex w-full">
          <div>
            <div className="flex justify-between">
              <div className='flex'>
                <div className="mr-2 h-2 bg-slate-300 rounded w-[100px]"></div>
                <div className="h-2 bg-slate-300 rounded w-[50px]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="shadow rounded-sm p-4 w-full bg-white mx-auto border-b-2">
        <div className="animate-pulse flex w-full">
          <div>
            <div className="flex justify-between">
              <div className='flex'>
                <div className="mr-2 h-2 bg-slate-300 rounded w-[100px]"></div>
                <div className="h-2 bg-slate-300 rounded w-[50px]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="shadow rounded-sm p-4 w-full bg-white mx-auto border-b-2">
        <div className="animate-pulse flex w-full">
          <div>
            <div className="flex justify-between">
              <div className='flex'>
                <div className="mr-2 h-2 bg-slate-300 rounded w-[100px]"></div>
                <div className="h-2 bg-slate-300 rounded w-[50px]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex justify-end mt-4'>
        <div className='w-[98px] h-[46px] rounded-md bg-slate-300 animate-pulse'></div>
      </div>
    </div>
  )
}