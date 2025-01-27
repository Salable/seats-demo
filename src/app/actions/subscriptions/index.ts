'use server'
import {revalidatePath} from "next/cache";
import {getOneSubscription} from "@/fetch/subscriptions";
import {redirect} from "next/navigation";
import {getOneEvent} from "@/fetch/events";
import {salable} from "@/app/salable";

export const changeSubscription = async (subscriptionUuid: string, planUuid: string) => {
  try {
    await salable.subscriptions.changePlan(subscriptionUuid, {planUuid})
    await new Promise<void>(async (resolve) => {
      while (true) {
        try {
          const subscription = await getOneSubscription(subscriptionUuid)
          if (subscription.data?.planUuid === planUuid) {
            resolve()
            break
          }
          await new Promise(r => setTimeout(r, 500));
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
    const create = await salable.subscriptions.addSeats(uuid, {increment})
    await pollSalableEvent(create.eventUuid)
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

export const removeSeats = async ({
  uuid,
  decrement,
}: {
  uuid: string,
  decrement: number,
}) => {
  try {
    const remove = await salable.subscriptions.removeSeats(uuid, {decrement})
    await pollSalableEvent(remove.eventUuid)
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
    await salable.subscriptions.cancel(subscriptionUuid, {when: 'now'})
    await new Promise<void>(async (resolve) => {
      while (true) {
        try {
          const subscription = await getOneSubscription(subscriptionUuid)
          if (subscription.data?.status === 'CANCELED') {
            resolve()
            break
          }
          await new Promise(r => setTimeout(r, 500));
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
  redirect(`/dashboard/subscriptions/${subscriptionUuid}`)
}

const pollSalableEvent = async (uuid: string) => {
  await new Promise<void>(async (resolve) => {
    while (true) {
      try {
        const event = await getOneEvent(uuid)
        if (event.data?.status === 'success' || event.data?.status === 'failed') {
          resolve()
          break
        }
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        console.log(e)
        break
      }
    }
  })
}