import {env} from "@/app/environment";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {Session} from "@/app/actions/sign-in";
import { Result } from "@/app/actions/checkout-link";
import {salable} from "@/app/salable";
import {PaginatedSubscription, PaginatedSubscriptionInvoice, Subscription, Plan, PlanCurrency} from "@salable/node-sdk/dist/src/types";

export async function getAllSubscriptions(): Promise<Result<PaginatedSubscription>> {
  try {
    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    if (!session) {
      return {
        data: null,
        error: 'Unauthorised'
      }
    }
    const data = await salable.subscriptions.getAll({
      email: session.email,
      expand: ['plan'],
      // sort: 'desc',
      // productUuid: salableProductUuid
    })
    return {
      data, error: null
    }
  } catch (e) {
    // handle salable error
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch subscriptions',
    }
  }
}

export type SubscriptionExpandedPlanCurrency = Subscription & {
  plan: Plan & {
    currencies: PlanCurrency[]
  }
}

export async function getOneSubscription(uuid: string): Promise<Result<SubscriptionExpandedPlanCurrency>> {
  try {
    const data = await salable.subscriptions.getOne(uuid, {expand: ['plan.currencies']}) as SubscriptionExpandedPlanCurrency
    return {
      data, error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch subscription',
    }
  }
}

export const getSubscriptionInvoices = async (subscriptionUuid: string): Promise<Result<PaginatedSubscriptionInvoice>> => {
  try {
    const data = await salable.subscriptions.getInvoices(subscriptionUuid)
    return {
      data, error: null
    }
  } catch (e) {
    // handle salable error
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch subscription invoices'
    }
  }
}