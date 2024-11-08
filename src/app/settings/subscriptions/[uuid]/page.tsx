'use client'
import React, {useEffect, useState} from "react";
import LoadingSpinner from "@/components/loading-spinner";
import Link from "next/link";
import Head from "next/head";
import useSWR from "swr";
import {AssignUser} from "@/components/assign-user";
import {useRouter, useSearchParams} from "next/navigation";
import {Modal} from "@/components/modal";
import {SalableSubscription} from "@/app/api/subscriptions/route";
import {
  appBaseUrl,
  salableBasicPlanUuid,
  salableProPlanUuid,
} from "@/app/constants";
import {format} from "date-fns";

export type User = {
  uuid: string;
  username: string;
  email: string;
}
export type GetLicensesCountResponse = {
  assigned: number;
  unassigned: number;
  count: number;
}
export type GetAllLicensesResponse = {
  first: string;
  last: string;
  data: License[]
}
export type License = {
  uuid: string;
  startTime: string;
  granteeId: string;
  productUuid: string;
  planUuid: string;
  status: string;
}
export type Session = {
  uuid: string;
  organisationUuid: string;
  email: string;
}

export default function SubscriptionView({params}: { params: { uuid: string } }) {
  return (
    <>
      <Head><title>Salable Seats Demo</title></Head>
      <main>
        <div className="w-full font-sans text-sm">
          <Main uuid={params.uuid}/>
        </div>
      </main>
    </>
  );
}

const Main = ({uuid}: { uuid: string }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isModalOpen = searchParams.get("modalOpen")
  const [isPolling, setIsPolling] = useState(false)
  const [salableEventUuid, setSalableEventUuid] = useState<string | null>(null)
  const [disableButton, setDisableButton] = useState(false)
  const [updatedLicenseCount, setUpdatedLicenseCount] = useState<number | null>(null)
  const [isCancellingSubscription, setIsCancellingSubscription] = useState<boolean>(false)
  const [pollLicenseCount, setPollLicenseCount] = useState<boolean>(false)
  const [isReactivatingSubscription, setIsReactivatingSubscription] = useState<boolean>(false)
  const [isChangingSubscription, setIsChangingSubscription] = useState<boolean>(false)
  const [isChangingSeatCount, setIsChangingSeatCount] = useState<boolean>(false)
  const [changingPlanUuid, setChangingPlanUuid] = useState<string | null>(null)

  const {data: session, isLoading, isValidating} = useSWR<Session>(`/api/session`)
  const {data: users} = useSWR<User[]>(`/api/organisations/${session?.organisationUuid}/users`)
  const {
    data: subscription,
    mutate: mutateSubscription,
    isValidating: isValidatingSubscription,
    isLoading: isLoadingSubscription
  } = useSWR<SalableSubscription>(`/api/subscriptions/${uuid}`)
  const {
    data: licenses,
    mutate: mutateLicenses,
    isLoading: isLoadingLicenses,
    isValidating: isValidatingLicenses
  } = useSWR<GetAllLicensesResponse>(`/api/licenses?subscriptionUuid=${uuid}${subscription?.status !== 'CANCELED' ? "&status=active" : ""}`)
  const {
    data: licenseCount,
    mutate: mutateLicenseCount,
    isLoading: isLoadingLicenseCount,
    isValidating: isValidatingLicenseCount
  } = useSWR<GetLicensesCountResponse>(`/api/licenses/count?subscriptionUuid=${uuid}&status=active`)
  const {
    data: invoices,
    mutate: mutateInvoices,
    isLoading: isLoadingInvoices,
    isValidating: isValidatingInvoices
  } = useSWR<{
    first: string;
    last: string;
    hasMore: boolean;
    data: {
      created: number;
      effective_at: number;
      automatically_finalizes_at: number;
      hosted_invoice_url: string;
      invoice_pdf: string;
      lines: {
        data: {
          amount: number;
          price: { unit_amount: 1 }
          quantity: number;
        }[]
      }
    }[]
  }>(`/api/subscriptions/${uuid}/invoices`)

  const licenseTotalHasChanged = updatedLicenseCount && licenseCount?.count !== updatedLicenseCount

  const fetchSalableEvent = async (eventUuid: string) => {
    try {
      const res = await fetch(`/api/events/${eventUuid}`)
      return await res.json()
    } catch (e) {
      console.log(e)
    }
  }

  const addSeats = async (increment: number) => {
    try {
      setDisableButton(true)
      const addSeats = await fetch(`/api/subscriptions/${uuid}/seats`, {
        method: 'post',
        body: JSON.stringify({increment})
      })
      const data = await addSeats.json()
      if (addSeats.ok) {
        if (data) setSalableEventUuid(data.eventUuid)
        setIsPolling(true)
      }
      if (data.error) {
        setDisableButton(false)
      }
    } catch (e) {
      console.log(e)
    }
  }

  const removeSeats = async (decrement: number) => {
    try {
      setDisableButton(true)
      const removeSeats = await fetch(`/api/subscriptions/${uuid}/seats`, {
        method: 'put',
        body: JSON.stringify({decrement})
      })
      const data = await removeSeats.json()
      if (removeSeats.ok) {
        if (data) setSalableEventUuid(data.eventUuid)
        setIsPolling(true)
      }
      if (data.error) {
        setDisableButton(false)
        if (licenseCount?.count) setUpdatedLicenseCount(licenseCount?.count)
      }
    } catch (e) {
      setDisableButton(false)
      console.log(e)
    }
  }

  const cancelSubscription = async () => {
    try {
      setIsCancellingSubscription(true)
      setDisableButton(true)
      const cancel = await fetch(`/api/subscriptions/${uuid}`, {
        method: 'DELETE',
      })
      if (cancel.ok) {
        setIsPolling(true)
        setPollLicenseCount(true)
      } else {
        setDisableButton(false)
      }
    } catch (e) {
      setDisableButton(false)
      console.log(e)
    }
  }

  const reactivateSubscription = async () => {
    try {
      setIsReactivatingSubscription(true)
      setDisableButton(true)
      const reactivate = await fetch(`/api/subscriptions/${uuid}/reactivate`, {
        method: 'PUT',
      })
      if (reactivate.ok) {
        setIsPolling(true)
        setPollLicenseCount(true)
      } else {
        setDisableButton(false)
      }
    } catch (e) {
      setDisableButton(false)
      console.log(e)
    }
  }

  const changeSubscription = async (planUuid: string) => {
    try {
      setIsChangingSubscription(true)
      setDisableButton(true)
      const change = await fetch(`/api/subscriptions/${uuid}/change`, {
        method: 'PUT',
        body: JSON.stringify({planUuid: planUuid})
      })
      if (change.ok) {
        if (subscription?.plan.licenseType === 'metered') {
          router.push('/settings/subscriptions')
        }
        setIsPolling(true)
        setChangingPlanUuid(planUuid)
      } else {
        setDisableButton(false)
      }
    } catch (e) {
      setDisableButton(false)
      console.log(e)
    }
  }

  useEffect(() => {
    if (!isLoadingLicenseCount && licenseCount?.count && !isPolling) {
      setUpdatedLicenseCount(licenseCount.count)
    }
  }, [isLoadingLicenseCount, isValidatingLicenseCount]);

  useEffect(() => {
    if (isPolling) {
      if (salableEventUuid) {
        const eventPolling = setInterval(async () => {
          const event = await fetchSalableEvent(salableEventUuid)
          if (event) {
            if (['success', 'failed', 'incomplete'].includes(event.status)) {
              clearInterval(eventPolling)
              setIsPolling(false)
              await mutateLicenses()
              await mutateLicenseCount()
              setSalableEventUuid(null)
              setDisableButton(false)
              setIsChangingSeatCount(false)
            }
          }
        }, 500);
      }
      if (pollLicenseCount) {
        const licenseCountPolling = setInterval(async () => {
          try {
            const countRes = await fetch(`/api/licenses/count?subscriptionUuid=${uuid}&status=active`)
            const data = await countRes.json()
            if (data?.count === 0 || data?.cancelAtPeriodEnd) {
              clearInterval(licenseCountPolling)
              setIsPolling(false)
              await mutateLicenses()
              await mutateLicenseCount()
              await mutateSubscription()
              setDisableButton(false)
              setIsCancellingSubscription(false)
              setPollLicenseCount(false)
            }
          } catch (e) {
            console.log(e)
          }
        }, 500);
      }
      if (isReactivatingSubscription) {
        const subscriptionPolling = setInterval(async () => {
          try {
            const countRes = await fetch(`/api/subscriptions/${uuid}`)
            const data = await countRes.json()
            if (!data?.cancelAtPeriodEnd) {
              clearInterval(subscriptionPolling)
              setIsPolling(false)
              await mutateSubscription()
              setDisableButton(false)
              setIsReactivatingSubscription(false)
            }
          } catch (e) {
            console.log(e)
          }
        }, 500);
      }
      if (isChangingSubscription) {
        const subscriptionPolling = setInterval(async () => {
          try {
            if (subscription?.plan.licenseType === 'metered') {
              const subRes = await fetch(`/api/licenses?planUuid=${changingPlanUuid}`)
              const data = await subRes.json() as GetAllLicensesResponse
              if (data?.data.length) {
                clearInterval(subscriptionPolling)
                setIsPolling(false)
                router.push('/settings/subscriptions')
              }
            } else {
              const subRes = await fetch(`/api/subscriptions/${uuid}`)
              const data = await subRes.json() as SalableSubscription
              if (data?.planUuid === changingPlanUuid) {
                clearInterval(subscriptionPolling)
                setIsPolling(false)
                await mutateSubscription()
                await mutateLicenses()
                await mutateLicenseCount()
                setDisableButton(false)
                setChangingPlanUuid(null)
                setIsChangingSubscription(false)
              }
            }
          } catch (e) {
            console.log(e)
          }
        }, 500);
      }
    }
  }, [salableEventUuid, isLoadingLicenseCount, pollLicenseCount, changingPlanUuid, isReactivatingSubscription]);

  if (!isValidating && !isLoading && !session?.uuid) {
    router.push("/")
  }
  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        <div>
          <h1 className='text-3xl mb-6 flex items-center'>Subscription
            {subscription?.status === 'ACTIVE' ? <span
              className='px-2 ml-2 py-2 rounded-md leading-none bg-sky-200 text-sky-500 uppercase text-lg font-bold'>{subscription.plan.displayName}</span> : null}
            {subscription?.status === 'CANCELED' ? <span
              className='px-2 ml-2 py-2 rounded-md leading-none bg-red-200 text-red-500 uppercase text-lg font-bold'>{subscription.status}</span> : null}
          </h1>
          {!isValidatingLicenseCount && !isLoadingLicenseCount && !isLoadingLicenses && !isValidatingLicenses && !isValidatingSubscription && !isLoadingSubscription ? (
            <div>

              {subscription?.status === 'CANCELED' ? (
                <div className='w-[300px] bg-white p-4 rounded-md shadow'>
                  <div className='border-b-2 flex justify-between items-end pb-3'>
                    <div>
                      <div className='text-gray-500'>Plan</div>
                      <div className='text-xl'>{subscription?.plan?.displayName}</div>
                    </div>
                    <div>
                      <div className='text-xl'>£{subscription?.plan?.currencies?.[0].price / 100}
                        <span className='ml-1 text-sm'>seat / {subscription?.plan?.interval}</span>
                      </div>
                    </div>
                  </div>
                  <div className='mt-3'>
                    <Price price={subscription.plan.currencies?.[0].price} count={Number(subscription.quantity)}
                           interval={subscription.plan.interval} label="Total"/>
                  </div>
                </div>
              ) : null}
              {subscription?.status !== 'CANCELED' ? (
                <>
                  <div className='flex justify-between items-center'>
                    <div className='mb-6 flex items-center'>
                      <h2 className='text-2xl font-bold text-gray-900 mr-4'>Seats</h2>
                      {disableButton ? (
                        <div className='w-[20px]'><LoadingSpinner/></div>
                      ) : null}
                    </div>
                  </div>
                  <div className='grid grid-cols-[2fr_1fr] gap-6'>
                    <div>
                      <div className='flex flex-col rounded-md shadow bg-white'>
                        {licenses?.data?.sort((a, b) => {
                          if (a.granteeId === null) return 1
                          if (b.granteeId === null) return -1
                          const aDate = new Date(a.startTime).getTime()
                          const bDate = new Date(b.startTime).getTime()
                          return aDate - bDate
                        }).map((l, i) => {
                          const assignedUser = users?.find((u) => u.uuid === l.granteeId) ?? null
                          return (
                            <React.Fragment key={`licenses_${i}`}>
                              <AssignUser assignedUser={assignedUser} license={l} subscriptionUuid={uuid}
                                          key={`assign_users_${i}`}/>
                            </React.Fragment>
                          );
                        })}
                      </div>
                      <div className='flex items-start justify-between mt-3'>
                        <div>
                          <span
                            className='mr-4 leading-none text-xs text-gray-500'>{licenseCount?.assigned} out of {licenseCount?.count} seats assigned</span>
                        </div>
                      </div>

                      {users?.filter((u) => !u.username && u.email)?.length ? (
                        <div className='mt-6'>
                          <h2 className='text-2xl font-bold text-gray-900 mr-4 mb-6'>Pending invites</h2>

                          <div className='flex flex-col rounded-md shadow bg-white'>
                            {users.filter((u) => !u.username && u.email).map((u, i) => {
                              const licenseUuid = licenses?.data.find((l) => l.granteeId === u.uuid)?.uuid
                              return (
                                <div className='p-3 border-b-2 flex justify-between items-center'>
                                  {u.email}
                                  <button
                                    className='p-2 border-2 rounded-md text-gray-500 text-xs'
                                    onClick={async () => {
                                      try {
                                        const res = await fetch(`/api/tokens?email=${encodeURIComponent(u.email)}`)
                                        const data = await res.json()
                                        if (res.ok) {
                                          const link = `${appBaseUrl}/accept-invite?token=${data.value}${licenseUuid ? "&licenseUuid=" + licenseUuid : ""}`
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
                              )
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <button
                        className={`p-4 text-white rounded-md leading-none bg-blue-700 flex items-center mb-6 w-full justify-center`}
                        onClick={async () => {
                          await changeSubscription(subscription?.planUuid === salableBasicPlanUuid ? salableProPlanUuid : salableBasicPlanUuid)
                        }}
                        disabled={disableButton}>
                        {isChangingSubscription ? (
                          <div className='w-[14px] mr-2'><LoadingSpinner fill="white"/></div>) : ''}
                        Change
                        to {subscription?.planUuid === salableBasicPlanUuid ? "Pro" : "Basic"} plan
                      </button>
                      <div className='flex flex-col rounded-md border-gray-300 border-2 p-4'>
                        <div className='text-xl text-center mb-2'>Update seat count</div>
                        <div className='mb-2 text-center'>To change the seat count you will need to update your
                          subscription
                          which will incur a change to your billing.
                        </div>
                        <div className='border-b-2 flex justify-center items-center pb-4'>
                          {updatedLicenseCount && (
                            <>
                              <button
                                className={`flex items-center justify-center leading-none text-xl p-3 text-white rounded-full h-[38px] w-[38px] bg-blue-700`}
                                onClick={() => {
                                  if (updatedLicenseCount) setUpdatedLicenseCount(updatedLicenseCount - 1);
                                }}>
                                -
                              </button>
                              <div className='px-4 text-xl'>
                                <span>{updatedLicenseCount}</span>
                              </div>
                              <button
                                className={`flex items-center justify-center leading-none text-xl p-3 text-white rounded-full h-[38px] w-[38px] bg-blue-700`}
                                onClick={() => {
                                  if (updatedLicenseCount) setUpdatedLicenseCount(updatedLicenseCount + 1);
                                }}>
                                +
                              </button>
                            </>
                          )}
                        </div>
                        {subscription && updatedLicenseCount && licenseCount ? (
                          <>
                            <div className='border-b-2 flex justify-between items-end py-4'>
                              <div>
                                <div className='text-gray-500'>Current Plan</div>
                                <div className='text-xl'>{subscription?.plan?.displayName}</div>
                              </div>
                              <div>
                                <div className='text-xl'>£{subscription?.plan?.currencies?.[0].price / 100}
                                  <span className='ml-1 text-sm'>seat / {subscription?.plan?.interval}</span>
                                </div>
                              </div>
                            </div>
                            <div
                              className={`items-center ${licenseTotalHasChanged ? "border-b-2 py-4" : "pt-4"} text-right`}>
                              <Price price={subscription.plan?.currencies[0].price} count={licenseCount.count}
                                     interval={subscription.plan?.interval} label="Current total"/>
                            </div>
                            {licenseTotalHasChanged ? (
                              <div className='items-center py-4 text-right'>
                                <Price price={subscription.plan.currencies?.[0].price} count={updatedLicenseCount}
                                       interval={subscription.plan.interval} label="New total"/>
                              </div>
                            ) : null}
                          </>
                        ) : null}

                        {licenseTotalHasChanged ? (
                          <div className='flex justify-end'>
                            <button
                              className={`w-full p-4 text-white rounded-md leading-none bg-blue-700 flex items-center justify-center`}
                              onClick={async () => {
                                if (updatedLicenseCount && licenseCount) {
                                  setIsChangingSeatCount(true)
                                  if (updatedLicenseCount > licenseCount.count) {
                                    await addSeats(updatedLicenseCount - licenseCount.count)
                                  }
                                  if (updatedLicenseCount < licenseCount.count) {
                                    await removeSeats(licenseCount.count - updatedLicenseCount)
                                  }
                                }
                              }}
                              disabled={disableButton}>
                              {isChangingSeatCount ? (
                                <div className='w-[14px] mr-2'><LoadingSpinner fill="white"/></div>) : ''} Update
                              subscription
                            </button>
                          </div>
                        ) : null}
                      </div>
                      {/*{!subscription?.cancelAtPeriodEnd ? (*/}
                      {/*  <>*/}
                      {/*    <button*/}
                      {/*      className={`p-4 text-white rounded-md leading-none bg-blue-700 flex items-center justify-center mr-2`}*/}
                      {/*      onClick={async () => {*/}
                      {/*        await changeSubscription(subscription?.planUuid === salableProUsagePlanUuid ? salableBasicUsagePlanUuid : salableProUsagePlanUuid)*/}
                      {/*      }}*/}
                      {/*      disabled={disableButton}*/}
                      {/*    >*/}
                      {/*      {isChangingSubscription ? (*/}
                      {/*        <div className='w-[14px] mr-2'><LoadingSpinner fill="white"/></div>*/}
                      {/*      ) : ''}*/}
                      {/*      Change to {subscription?.planUuid === salableProUsagePlanUuid ? "Basic" : "Pro"}*/}
                      {/*    </button>*/}
                      {/*    <button*/}
                      {/*      className={`p-4 rounded-md leading-none text-white bg-red-600 flex items-center justify-center`}*/}
                      {/*      onClick={async () => {*/}
                      {/*        await cancelSubscription()*/}
                      {/*      }}*/}
                      {/*      disabled={disableButton}>*/}
                      {/*      {isCancellingSubscription ? (*/}
                      {/*        <div className='w-[14px] mr-2'><LoadingSpinner fill="white"/></div>) : ''}*/}
                      {/*      Cancel subscription*/}
                      {/*    </button>*/}
                      {/*  </>*/}
                      {/*) : (*/}
                      {/*  <div className='p-3 bg-gray-200 rounded-md max-w-[400px]'>*/}
                      {/*    <p className='mb-2'>Your subscription is set to cancel at the end of the month. If you'd like revert this change you can reactivate your subscription below.</p>*/}
                      {/*    <button*/}
                      {/*      className={`p-4 text-white rounded-md leading-none bg-blue-700 flex items-center justify-center mr-2`}*/}
                      {/*      onClick={async () => {*/}
                      {/*        await reactivateSubscription()*/}
                      {/*      }}*/}
                      {/*    >*/}
                      {/*      {isReactivatingSubscription ? (*/}
                      {/*        <div className='w-[14px] mr-2'><LoadingSpinner fill="white"/></div>) : ''}*/}
                      {/*      Reactivate*/}
                      {/*    </button>*/}
                      {/*  </div>*/}
                      {/*)}*/}
                      <button
                        className={`p-4 mt-6 rounded-md leading-none text-white bg-red-600 flex items-center justify-center w-full`}
                        onClick={async () => {
                          await cancelSubscription()
                        }}
                        disabled={disableButton}>
                        {isCancellingSubscription ? (
                          <div className='w-[14px] mr-2'><LoadingSpinner fill="white"/></div>) : ''}
                        Cancel subscription
                      </button>
                    </div>
                  </div>
                </>
              ) : null}

              {invoices && invoices.data.length > 0 ? (
                <div className='mt-6'>
                  <h2 className='text-2xl font-bold text-gray-900'>Invoices</h2>
                  <div className='mt-3 rounded-md bg-white'>
                    {invoices?.data.sort((a, b) => a.created + b.created).map((invoice, index) => {
                      return (
                        <div className='border-b-2 p-3 flex justify-between items-center' key={`invoice-${index}`}>
                          <div>
                            {invoice.effective_at ? (
                              <span>{format(new Date(invoice.effective_at * 1000), "d LLL yyy")}</span>
                            ) : null}
                            {invoice.automatically_finalizes_at ? (
                              <span>Will finalise at {format(new Date(invoice.automatically_finalizes_at * 1000), 'd LLL yyy H:mm')}</span>
                            ) : null}
                          </div>
                          <div className='flex items-center'>
                            <span
                              className='mr-2'>£{(invoice.lines.data[0].quantity * invoice.lines.data[0].price.unit_amount) / 100}</span>
                            {invoice.automatically_finalizes_at && invoice.lines.data[0].price.unit_amount ? (
                              <>
                                <span
                                  className='p-1 leading-none uppercase rounded-sm bg-gray-200 text-gray-500 text-xs font-bold'>DRAFT</span>
                              </>
                            ) : null}
                            {invoice.hosted_invoice_url ? (
                              <Link className='text-blue-700' href={invoice.hosted_invoice_url}>View</Link>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="ml-3 w-[20px]">
              <LoadingSpinner/>
            </div>
          )}
        </div>
      </div>
      {isModalOpen ? (
        <Modal/>
      ) : null}
    </>
  )
}

const Price = ({price, count, interval, label}: { price: number, count: number, interval: string, label: string }) => {
  return (
    <>
      <div className='flex justify-between'>
        <div className='text-xl text-gray-500'>{label}</div>
        <div className='text-xl'>£{(price * count) / 100}
          <span className='ml-1 text-sm'>/ {interval}</span>
        </div>
      </div>
      <div className='text-xs text-gray-500'>
        <span>{count}</span> x
        £{price / 100}
      </div>
    </>
  )
}

const LoadingSkeleton = () => {
  return (
    <div>
      <div>
        <div className="animate-pulse flex items-center">
          <div className="mr-2 h-2 bg-slate-300 rounded w-[162px]"></div>
          <div className="mr-2 h-[34px] w-[95px] bg-slate-300 rounded-md"></div>
        </div>
      </div>

      <div className='mt-6 animate-pulse'>
        <div className="h-2 mb-2 bg-slate-300 rounded w-[75px]"></div>
        <div className="h-2 bg-slate-300 rounded w-[200px]"></div>
        <div className='flex items-center mt-6'>
          <div className="mr-2 h-[46px] w-[100px] bg-slate-300 rounded-md"></div>
          <div className="mr-2 h-[46px] w-[160px] bg-slate-300 rounded-md"></div>
        </div>
      </div>

      <div className='mt-6'>
        <div className="mb-4 h-2 bg-slate-300 rounded w-[100px]"></div>

        {[...new Array(2)].map((_, index) => (
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

      <div className='mt-6'>
        <div className="mb-4 h-2 bg-slate-300 rounded w-[100px]"></div>

        {[...new Array(2)].map((_, index) => (
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
    </div>
  )
}