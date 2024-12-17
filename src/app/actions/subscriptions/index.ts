'use server'
import {salableApiBaseUrl} from "@/app/constants";
import {env} from "@/app/environment";
import {revalidatePath} from "next/cache";
import {getOneSubscription} from "@/fetch/subscriptions";
import {getErrorMessage} from "@/app/actions/get-error-message";
import { Result } from "../checkout-link";
import {redirect} from "next/navigation";
import {getOneEvent} from "@/fetch/events";

export type GetAllInvoicesResponse = {
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
}

export const getSubscriptionInvoices = async (subscriptionUuid: string): Promise<Result<GetAllInvoicesResponse>> => {
  try {
    const res = await fetch(`${salableApiBaseUrl}/subscriptions/${subscriptionUuid}/invoices`, {
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2'
      },
    })
    if (res.ok) {
      const data = await res.json() as GetAllInvoicesResponse
      return {
        data, error: null
      }
    }
    const error = await getErrorMessage(res, 'Subscription')
    console.log(error)
    return {
      data: null,
      error: 'Failed to fetch subscription invoices'
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch subscription invoices'
    }
  }
}

export const changeSubscription = async (subscriptionUuid: string, planUuid: string) => {
  try {
    const changeSubscriptionRequest = await fetch(`${salableApiBaseUrl}/subscriptions/${subscriptionUuid}/change-plan`, {
      method: 'put',
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2'
      },
      body: JSON.stringify({planUuid})
    })
    if (!changeSubscriptionRequest.ok) {
      const error = await getErrorMessage(changeSubscriptionRequest, 'Subscription')
      console.log(error)
      return {
        data: null,
        error: 'Failed to update subscription'
      }
    }
    let retries = 0
    await new Promise<void>(async (resolve) => {
      while (true) {
        try {
          const subscription = await getOneSubscription(subscriptionUuid)
          if (subscription.data?.planUuid === planUuid || retries >= 30) {
            resolve()
            break
          }
          await new Promise(r => setTimeout(r, 500));
          retries++
        } catch (e) {
          console.log(e)
          break
        }
      }
    })
  } catch (e) {
    console.error(e)
    return {data: null, error: 'Failed to update subscription'}
  }

  revalidatePath(`/dashboard/subscriptions/${subscriptionUuid}`)
}

export const addSeats = async ({
  uuid,
  increment,
}: {
  uuid: string,
  increment: number,
}) => {
  try {
    const res = await fetch(`${salableApiBaseUrl}/subscriptions/${uuid}/seats`, {
      method: 'post',
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2'
      },
      body: JSON.stringify({increment})
    })
    if (!res.ok) {
      const error = await getErrorMessage(res)
      console.log(error)
      return {
        data: null,
        error: 'Failed to add seats'
      }
    }
    const data = await res.json() as SalableEventResponse
    let retries = 0
    await new Promise<void>(async (resolve) => {
      while (true) {
        try {
          const event = await getOneEvent(data.eventUuid)
          if (event.data?.status === 'success' || retries >= 30) {
            resolve()
            break
          }
          await new Promise(r => setTimeout(r, 500));
          retries++
        } catch (e) {
          console.log(e)
          break
        }
      }
    })
  } catch (error) {
    console.log(error)
    return {
      data: null,
      error: 'Failed to add seats'
    }
  }
  revalidatePath(`/dashboard/subscriptions/${uuid}`)
  redirect(`/dashboard/subscriptions/${uuid}`)
}

export type SalableEventResponse = {
  eventUuid: string
}

export const removeSeats = async ({
  uuid,
  decrement,
}: {
  uuid: string,
  decrement: number,
}) => {
  try {
    const res = await fetch(`${salableApiBaseUrl}/subscriptions/${uuid}/seats`, {
      method: 'put',
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2'
      },
      body: JSON.stringify({decrement})
    })
    if (!res.ok) {
      const error = await getErrorMessage(res)
      console.log(error)
      return {
        data: null,
        error: 'Failed to add seats'
      }
    }
    const data = await res.json() as SalableEventResponse
    await new Promise<void>(async (resolve) => {
      let retries = 0
      while (true) {
        try {
          const event = await getOneEvent(data.eventUuid)
          if (event.data?.status === 'success' || retries >= 30) {
            resolve()
            break
          }
          await new Promise(r => setTimeout(r, 500));
          retries++
        } catch (e) {
          console.log(e)
          break
        }
      }
    })
  } catch (error) {
    console.log(error)
    return {
      data: null,
      error: 'Failed to add seats'
    }
  }
  revalidatePath(`/dashboard/subscriptions/${uuid}`)
  redirect(`/dashboard/subscriptions/${uuid}`)
}

export const cancelSubscription = async (subscriptionUuid: string) => {
  try {
    const res = await fetch(`${salableApiBaseUrl}/subscriptions/${subscriptionUuid}/cancel?when=now`, {
      method: 'PUT',
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2'
      },
    })
    if (!res.ok) {
      const error = getErrorMessage(res, 'Subscription')
      console.log(error)
      return {
        data: null,
        error: 'Failed to cancel subscription'
      }
    }
    let retries = 0
    await new Promise<void>(async (resolve) => {
      while (true) {
        try {
          const subscription = await getOneSubscription(subscriptionUuid)
          if (subscription.data?.status === 'CANCELED' || retries >= 30) {
            resolve()
            break
          }
          await new Promise(r => setTimeout(r, 500));
          retries++
        } catch (e) {
          console.log(e)
          break
        }
      }
    })
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to cancel subscription'
    }
  }
  revalidatePath(`/dashboard/subscriptions/${subscriptionUuid}`)
}