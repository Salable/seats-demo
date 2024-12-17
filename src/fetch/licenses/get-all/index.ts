import {env} from "@/app/environment";
import {salableApiBaseUrl} from "@/app/constants";
import {Result} from "@/app/actions/checkout-link";
import {getErrorMessage} from "@/app/actions/get-error-message";

export type License = {
  uuid: string;
  startTime: string;
  granteeId: string;
  productUuid: string;
  planUuid: string;
  status: string;
}

export type GetAllLicensesResponse = {
  first: string;
  last: string;
  data: License[]
}

export async function getAllLicenses(params?: {
  subscriptionUuid?: string;
  status?: 'active' | 'canceled'
  planUuid?: string
}): Promise<Result<GetAllLicensesResponse>> {
  try {
    const searchParams = new URLSearchParams()
    if (params) {
      const entries = Object.entries(params)
      for (const entry of entries) {
        if (entry !== undefined) searchParams.set(entry[0], entry[1])
      }
    }
    const res = await fetch(`${salableApiBaseUrl}/licenses?${searchParams.toString()}`, {
      headers: { 'x-api-key': env.SALABLE_API_KEY, version: 'v2' },
      cache: "no-store"
    })
    if (res.ok) {
      const data = await res.json() as GetAllLicensesResponse
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