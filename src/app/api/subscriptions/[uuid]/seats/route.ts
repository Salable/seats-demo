import {NextRequest, NextResponse} from "next/server";
import {env} from "@/app/environment";
import {salableApiBaseUrl} from "@/app/constants";

export const revalidate = 0

export async function POST(req: NextRequest, params: {params:{uuid: string}}) {
  try {
    const res = await fetch(`${salableApiBaseUrl}/subscriptions/${params.params.uuid}/seats`, {
      method: 'post',
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2'
      },
      body: JSON.stringify(await req.json())
    })
    const data = await res.json()
    return NextResponse.json(
      data, { status: res.status }
    );
  } catch (e) {
    const error = e as Error
    console.log(error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest,  params: {params:{uuid: string}}) {
  try {
    const res = await fetch(`${salableApiBaseUrl}/subscriptions/${params.params.uuid}/seats`, {
      method: 'put',
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2'
      },
      body: JSON.stringify(await req.json())
    })
    const data = await res.json()
    return NextResponse.json(
      data, { status: res.status }
    );
  } catch (e) {
    const error = e as Error
    console.log(error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}