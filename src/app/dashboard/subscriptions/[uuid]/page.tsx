import {getOneSubscription, SalableSubscription} from "@/fetch/subscriptions";
import { salableBasicPlanUuid, salableProPlanUuid} from "@/app/constants";
import React, {Suspense} from "react";
import {ChangePlanButton} from "@/components/change-plan-button";
import {getSubscriptionInvoices} from "@/app/actions/subscriptions";
import {format} from "date-fns";
import Link from "next/link";
import {CancelPlanButton} from "@/components/cancel-plan-button";
import {FetchError} from "@/components/fetch-error";
import {getAllLicenses} from "@/fetch/licenses/get-all";
import {AssignUser} from "@/components/assign-user";
import {getAllUsers} from "@/fetch/users";
import {getSession} from "@/fetch/session";
import {redirect} from "next/navigation";
import {User} from "@prisma/client";
import {UpdateSubscription} from "@/components/update-subscription";
import {InviteUserModal} from "@/components/invite-user-modal";
import {CopyInviteLink} from "@/components/copy-invite-link";
import {Session} from "@/app/actions/sign-in";

export const metadata = {
  title: 'Subscription',
}

export default async function SubscriptionPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  const session = await getSession()
  if (!session?.uuid) redirect('/')
  const subscription = await getOneSubscription(uuid)
  if (subscription.error) {
    return (
      <div className='max-w-[1000px] m-auto text-sm'>
        <FetchError error={subscription.error}/>
      </div>
    )
  }
  if (subscription.data?.email !== session.email) redirect('/')

  return (
    <div className='max-w-[1000px] m-auto text-sm'>
      <Suspense fallback={<SubscriptionLoading />}>
        <Subscription subscription={subscription.data} />
      </Suspense>
      <div className='mt-6'>
        <div className='md:grid md:grid-cols-[2fr_1fr] md:gap-6'>
          <Suspense fallback={<SeatsLoading />}>
            <Seats uuid={uuid} subscription={subscription.data} session={session} />
          </Suspense>
          <UpdateSubscription seatCount={subscription.data.quantity} subscription={subscription.data} />
        </div>
      </div>
      <div className='mt-6'>
        <h2 className='text-2xl font-bold text-gray-900'>Invoices</h2>
        <div className='mt-3'>
          <Suspense fallback={<InvoicesLoading />}>
            <Invoices uuid={uuid}/>
          </Suspense>
        </div>
      </div>
    </div>
  )
}

const Subscription = async ({subscription}: { subscription: SalableSubscription }) => {
  return (
    <>
      <h1 className='text-3xl mb-6 flex items-center'>Subscription
        <span className={`px-2 ml-2 py-2 rounded-md leading-none ${subscription.status === 'CANCELED' ? 'bg-red-200 text-red-500' : 'bg-green-200 text-green-700'} uppercase text-lg font-bold`}>
            {subscription.status}
        </span>
      </h1>
      <div className='mb-3'>
        <div className='flex justify-between items-end mb-3'>
          <div>
            <div className='text-gray-500'>Plan</div>
            <div className='text-xl'>{subscription.plan.displayName}</div>
          </div>
        </div>
      </div>
      {subscription.status !== 'CANCELED' ? (
        <div>
          <div className='flex'>
            <ChangePlanButton
              subscriptionUuid={subscription.uuid}
              planUuid={subscription.planUuid === salableProPlanUuid ? salableBasicPlanUuid : salableProPlanUuid}
              planName={subscription.planUuid === salableProPlanUuid ? 'Basic plan' : 'Pro plan'}
            />
            <CancelPlanButton subscriptionUuid={subscription.uuid}/>
          </div>
        </div>
      ) : null}
    </>
  )
}

const Seats = async ({uuid, subscription, session}: { uuid: string, subscription: SalableSubscription, session: Session }) => {
  const seats = await getAllLicenses({
    subscriptionUuid: uuid,
    status: subscription.status === 'CANCELED' ? 'canceled' : 'active'
  })
  if (seats.error) return <FetchError error={seats.error}/>
  const users = await getAllUsers(session.organisationUuid)
  if (users.error) return <FetchError error={users.error}/>
  const nonLicensedUsers = users.data?.reduce((arr: User[], user) => {
    if (!user.username) return arr
    if (!seats.data?.data.find((s) => s.granteeId === user.uuid)) arr.push(user)
    return arr
  }, [])
  const pendingInvites = users.data?.filter((u) => !u.username && u.email)
  const pendingInvitesOnSubscription = pendingInvites?.reduce((arr: User[], user) => {
    if (seats.data?.data?.find((l) => user.uuid === l.granteeId)) arr.push(user)
    return arr
  }, [])
  return (
    <>
      <div className='mb-6 md:mb-0'>
        {seats.data && users.data && nonLicensedUsers ? (
          <>
            <div className='flex flex-col rounded-sm shadow bg-white'>
              {seats?.data.data.sort((a, b) => {
                if (a.granteeId === null) return 1
                if (b.granteeId === null) return -1
                return 0
              }).map((l, i) => {
                if (l.granteeId === null && subscription.status === 'CANCELED') return null
                const assignedUser = users.data.find((u) => u.uuid === l.granteeId) ?? null
                return (
                  <React.Fragment key={`licenses_${i}`}>
                    <AssignUser
                      session={session}
                      assignedUser={assignedUser}
                      license={l}
                      subscriptionUuid={uuid}
                      subscriptionStatus={subscription.status}
                      nonLicensedUsers={nonLicensedUsers}
                      key={`assign_users_${i}`}
                    />
                  </React.Fragment>
                );
              })}
            </div>
            {pendingInvitesOnSubscription?.length && subscription.status === 'ACTIVE' ? (
              <div className='mt-6'>
                <h2 className='text-lg'>Pending Invites</h2>
                <div className='mt-3 flex flex-col rounded-sm shadow bg-white'>
                  {users.data.filter((u) => !u.username && u.email).map((u, i) => {
                    const licenseUuid = seats.data.data.find((l) => l.granteeId === u.uuid)?.uuid
                    if (!licenseUuid) return null
                    return (
                      <div className='p-3 border-b-2 flex justify-between items-center' key={`users_${i}`}>
                        <div className='flex items-center'>
                          <div className='w-[38px] h-[38px] cursor-pointer rounded-full bg-blue-200 leading-none flex items-center justify-center mr-3'>
                            <span>?</span>
                          </div>
                          {u.email}
                        </div>
                        <CopyInviteLink token={u.tokens[0].value} licenseUuid={licenseUuid}/>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : subscription.status === 'CANCELED' ? (
              <div className='mt-2 text-gray-500 text-sm'>Assigned seats at subscription cancellation</div>
            ) : null}
          </>
        ) : null}
      </div>
      <InviteUserModal session={session} revalidatePage={`/dashboard/subscriptions/${uuid}`} />
    </>
  )
}

const Invoices = async ({uuid}: { uuid: string }) => {
  const invoices = await getSubscriptionInvoices(uuid);
  return (
    <div>
      {invoices.data ? (
        <div className='rounded-sm bg-white'>
          {invoices?.data.data.sort((a, b) => a.created + b.created).map((invoice, index) => {
            return (
              <div className='border-b-2 p-3 flex justify-between items-center' key={`invoice-${index}`}>
                <div>
                  {invoice.effective_at ? (
                    <span>{format(new Date(invoice.effective_at * 1000), "d LLL yyy")}</span>
                  ) : null}
                  {invoice.automatically_finalizes_at ? (
                    <span>Finalises at {format(new Date(invoice.automatically_finalizes_at * 1000), 'd LLL yyy H:mm')}</span>
                  ) : null}
                </div>
                <div className='flex items-center'>
                  <span className='mr-2'>£{(invoice.lines.data[0].quantity * invoice.lines.data[0].price.unit_amount) / 100}</span>
                  {invoice.automatically_finalizes_at && invoice.lines.data[0].price.unit_amount ? (
                    <span className='p-1 leading-none uppercase rounded-sm bg-gray-200 text-gray-500 text-xs font-bold'>DRAFT</span>
                  ) : null}
                  {invoice.hosted_invoice_url ? (
                    <Link className='text-blue-700 hover:underline' href={invoice.hosted_invoice_url}>View</Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : invoices.error ? (
        <FetchError error={invoices.error}/>
      ) : null}
    </div>
  )
}

const InvoicesLoading = () => {
  return (
    <div>
      {[...new Array(1)].map((_, index) => (
        <div className="shadow rounded-sm p-4 w-full bg-white mx-auto border-b-2" key={`loading-${index}`}>
          <div className="animate-pulse flex justify-between w-full">
            <div className='flex'>
              <div className="mr-2 h-2 bg-slate-300 rounded w-[100px]"></div>
            </div>
            <div className='flex'>
              <div className="mr-2 h-2 bg-slate-300 rounded w-[20px]"></div>
              <div className="h-2 bg-slate-300 rounded w-[50px]"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const SeatsLoading = () => {
  return (
    <div>
      {[...new Array(2)].map((_, index) => (
        <div className="shadow rounded-sm p-3 w-full bg-white mx-auto border-b-2" key={`loading-${index}`}>
          <div className="animate-pulse flex justify-between w-full">
            <div className='flex'>
              <div className="mr-2 bg-slate-300 rounded-full w-[38px] h-[38px]"></div>
              <div className='flex flex-col justify-center'>
                <div className="mr-2 h-2 bg-slate-300 rounded w-[75px] mb-2"></div>
                <div className="mr-2 h-2 bg-slate-300 rounded w-[100px]"></div>
              </div>
            </div>
            <div className='flex items-center'>
              <div className="w-[70px] h-[30px] bg-slate-300 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const SubscriptionLoading = () => {
  return (
    <div>
    <div className="flex items-center mb-6">
        <h1 className='text-3xl flex items-center'>
          Subscription
          <div className="ml-2 h-[34px] w-[95px] bg-slate-300 rounded-md animate-pulse"></div>
        </h1>
      </div>
      <div className='mb-3'>
      <div className='flex justify-between items-end'>
          <div>
            <div className='text-gray-500'>Plan</div>
            <div className="mr-2 h-[28px] bg-slate-300 rounded w-[100px]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}