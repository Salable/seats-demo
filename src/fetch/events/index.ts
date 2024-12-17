import {env} from "@/app/environment";
import {salableApiBaseUrl} from "@/app/constants";
import {Result} from "@/app/actions/checkout-link";
import {getErrorMessage} from "@/app/actions/get-error-message";

export type SalableEvent = {
  uuid: string
  status: string
}

export async function getOneEvent(uuid: string): Promise<Result<SalableEvent>> {
  try {
    const res = await fetch(`${salableApiBaseUrl}/events/${uuid}`, {
      headers: { 'x-api-key': env.SALABLE_API_KEY, version: 'v2' },
      cache: "no-store"
    })
    if (res.ok) {
      const data = await res.json() as SalableEvent
      return {
        data,
        error: null
      }
    }
    const error = await getErrorMessage(res)
    console.log(error)
    return {
      data: null,
      error: 'Failed to fetch licenses'
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch licenses'
    }
  }
}