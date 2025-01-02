import {env} from "@/app/environment";
import {salableApiBaseUrl} from "@/app/constants";
import {Result} from "@/app/actions/checkout-link";
import {getErrorMessage} from "@/app/actions/get-error-message";

export type GetLicensesCountResponse = {
  assigned: number;
  unassigned: number;
  count: number;
}
export async function licensesCount(params?: {
  subscriptionUuid?: string;
  status?: 'active' | 'canceled'
}): Promise<Result<GetLicensesCountResponse>> {
  try {
    const searchParams = new URLSearchParams()
    if (params) {
      const entries = Object.entries(params)
      for (const entry of entries) {
        if (entry !== undefined) searchParams.set(entry[0], entry[1])
      }
    }
    const res = await fetch(`${salableApiBaseUrl}/licenses/count?${searchParams.toString()}`, {
      headers: { 'x-api-key': env.SALABLE_API_KEY, version: 'v2' },
      cache: "no-store"
    })
    if (res.ok) {
      const data = await res.json() as GetLicensesCountResponse
      return {
        data,
        error: null
      }
    }
    const error = await getErrorMessage(res)
    console.log(error)
    return {
      data: null,
      error: 'Failed to fetch license count'
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch license count'
    }
  }
}