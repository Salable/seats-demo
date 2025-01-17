import {Result} from "@/app/actions/checkout-link";
import {salable} from "@/app/salable";
import {Event} from "@salable/node-sdk/dist/src/types";

export async function getOneEvent(uuid: string): Promise<Result<Event>> {
  try {
    const data = await salable.events.getOne(uuid);
    return {
      data, error: null
    }
  } catch (e) {
    // handle salable error
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch licenses'
    }
  }
}