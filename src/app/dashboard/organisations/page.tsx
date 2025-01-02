import {redirect} from "next/navigation";
import {getSession} from "@/fetch/session";
import {getOneOrganisation} from "@/fetch/organisations";
import {InviteUserButton} from "@/components/invite-user-button";
import {CopyInviteLink} from "@/components/copy-invite-link";
import {FetchError} from "@/components/fetch-error";
import {getAllUsers} from "@/fetch/users";
import {Suspense} from "react";
import {InviteUserModal} from "@/components/invite-user-modal";

export const metadata = {
  title: 'Organisation',
}

export default function UsersPage() {
  return (
    <main>
      <div className="w-full font-sans text-sm">
        <div className='max-w-[1000px] m-auto'>
          <Suspense fallback={<LoadingSkeleton />}>
            <Users />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

const Users = async () => {
  const session = await getSession();
  if (!session?.uuid) {
    redirect('/')
  }
  const organisation = await getOneOrganisation(session.organisationUuid)
  const users = await getAllUsers(session.organisationUuid)
  const pendingInvites = users.data?.filter((u) => !u.username)

  return (
    <>
      {organisation.data ? (
        <h1 className='text-3xl mb-4'>{organisation.data?.name}</h1>
      ) : organisation.error ? (
        <FetchError error={organisation.error}/>
      ) : null}
      <div className='mb-3 bg-white shadow rounded-md'>
        {users.data ? (
          <>
            {users.data?.filter((u) => u.username).map((user, i) => (
              <div className='p-3 rounded-sm border-b-2' key={`loading-${user}-${i}`}>
                <div className='flex justify-between items-center'>
                  <p className='mr-2'>
                    {user.username ? <span className='mr-1'>{user.username}</span> : null}
                    <span className='text-gray-500 italic text-sm'>({user.email})</span>
                  </p>
                  <div className='flex items-center'>
                    {user.organisations[0]?.isAdmin ? (
                      <div className='p-1 rounded-sm text-green-700 bg-green-200 text-xs leading-none font-bold uppercase'>Admin</div>
                    ) : null}
                    {!user.username && user.email && user.tokens[0]?.value ? (
                      <div>
                        <span className='p-1 bg-yellow-300 text-xs rounded-sm ml-2 uppercase font-bold'>Pending</span>
                        <CopyInviteLink token={user.tokens[0].value}/>
                      </div>
                    ) : null}
                    {user.uuid === session.uuid ? (
                      <div className='p-1 ml-2 rounded-sm text-gray-500 bg-gray-200 text-xs leading-none font-bold uppercase'>You</div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : users.error ? (
          <FetchError error={users.error}/>
        ) : null}
      </div>
      {session.organisationUuid ? (
        <div className='flex justify-end'>
          <InviteUserButton />
        </div>
      ) : null}
      {pendingInvites && pendingInvites.length > 0 ? (
        <>
          <h2 className='text-lg mb-3 mt-6'>Pending Invites</h2>
          <div className='mb-6 bg-white shadow rounded-md'>
            {users.data ? (
              <>
                {pendingInvites.map((user, i) => (
                  <div className='p-3 rounded-sm border-b-2' key={`loading-${user}-${i}`}>
                    <div className='flex justify-between items-center'>
                      <p className='mr-2'>
                        {user.username ? <span className='mr-1'>{user.username}</span> : null}
                        <span className='text-gray-500 italic text-sm'>({user.email})</span>
                      </p>
                      {user.uuid === session.uuid ? <div
                        className='p-1 border-2 rounded-md text-gray-500 bg-gray-200 text-xs leading-none font-bold'>You</div> : null}
                      {!user.username && user.email && user.tokens[0]?.value ? (
                        <div>
                          <span
                            className='p-1 bg-yellow-300 text-xs rounded-sm mr-2 uppercase font-bold'>Pending</span>
                          <CopyInviteLink token={user.tokens[0].value}/>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </>
            ) : users.error ? (
              <FetchError error={users.error}/>
            ) : null}
          </div>
        </>
      ) : null}
      <InviteUserModal session={session} />
    </>
  )
}

const LoadingSkeleton = () => {
  return (
    <div>
      <div className="mb-4 h-2 bg-slate-300 rounded w-[100px]"></div>

      {[...new Array(4)].map((_, index) => (
        <div className="shadow rounded-sm p-4 w-full bg-white mx-auto border-b-2" key={`loading-${index}`}>
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
      ))}

      <div className='flex justify-end mt-4'>
        <div className='w-[98px] h-[46px] rounded-md bg-slate-300 animate-pulse'></div>
      </div>
    </div>
  )
}