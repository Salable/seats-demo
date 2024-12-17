import {licenseCheck} from "@/fetch/licenses/check";
import React, {Suspense} from "react";
import {StringGeneratorForm} from "@/components/forms/string-generator-form";
import {getSession} from "@/fetch/session";
import {bytes, salableApiBaseUrl} from "@/app/constants";
import {env} from "@/app/environment";
import { Result } from "./actions/checkout-link";
import { Session } from "./actions/sign-in";
import {getErrorMessage} from "@/app/actions/get-error-message";
import {FetchError} from "@/components/fetch-error";
import Link from "next/link";
import {LockIcon} from "@/components/icons/lock-icon";
import LoadingSpinner from "@/components/loading-spinner";

export const metadata = {
  title: 'Salable Per Seat Demo',
}

export type GetAllLicenses = {
  first: string;
  last: string;
  data: {
    uuid: string;
    granteeId: string;
    planUuid: string;
    subscriptionUuid: string;
  }[]
}

export default async function Home({searchParams}: {
  searchParams: Promise<Record<string, string>>
}) {
  return (
    <main>
      <div className='max-w-[1200px] m-auto text-sm'>
        <div className='md:grid md: md:grid-cols-2 md:gap-6'>
          <div>
            <p className='text-lg mb-3'>
              The product in the demo generates strings with random data which vary in size based on the number of bytes
              selected. To get access to the product a user must create an organisation and sign up then subscribe to a
              plan. The email of the sign up does not have to be real, this is just for demo purposes. This product is
              using test mode in Salable which allows use of test cards. Use the card number <span className='font-mono'>4242 4242 4242 4242</span>, expiry
              is any date in the future and CVC can be any three-digit number. The byte sizes
              for the strings are feature locked behind different plans. Once a user has subscribed they will be able
              access some or all of these features depending on what plan they are licensed on.
            </p>
            <p className='text-lg mb-3'>
              Once you have signed up you will be assigned as an admin to the organisation you created. This will enable
              you to test creating/inviting other users to your organisation via an invite link that has a token in it.
              You can use this link to paste into a new browser window and simulate a new user signing up to your
              organisation. The admin of the organisation can then assign a seat to the new user which will license them
              to use the product.
            </p>
          </div>
          <div className='mb-6'>
            <h1 className='text-4xl font-bold text-gray-900 mr-4 text-center'>
              Random String Generator
            </h1>
            <div className='mt-6'>
              <Suspense fallback={<Loading/>}>
                <StringGenerator search={await searchParams}/>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const StringGenerator = async ({search}: { search: Record<string, string> }) => {
  const session = await getSession();
  if (search.planUuid && session?.uuid) {
    let retries = 0
    await new Promise<void>(async (resolve) => {
      while (true) {
        try {
          const licenses = await getLicenses(session, search.planUuid);
          if (licenses.error) break
          if (licenses.data?.data[0].planUuid === search.planUuid  || retries >= 30) {
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
  }
  const check = session?.uuid ? await licenseCheck(session.uuid) : {
    data: null, error: null
  }
  return (
    <>
      {!check.error ? (
        <>
          <StringGeneratorForm check={check.data} />

          {check.data && !check.data.capabilities.find((c) => c.capability === '128') ? (
            <div className='flex justify-center'>
              <div className='rounded-md inline-flex flex-col mx-auto mt-6 p-3 border-2'>
                <p>
                  Upgrade to Pro to unlock <span className='font-bold'>128 Byte strings</span>
                </p>
                <div className='flex mt-2'>
                  <Link
                    href={'/dashboard/subscriptions'}
                    className='p-3 text-white rounded-md leading-none bg-blue-700 hover:bg-blue-800 transition'
                  >
                    Upgrade now
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          {!check.data ? (
            <div className='flex justify-center max-w-[400px] mx-auto'>
              <div className='rounded-md inline-flex flex-col mx-auto mt-6 p-3 border-2'>
                <p>To start creating secure strings subscribe to a plan from our pricing table and get started!</p>
                <div className='mt-3'>
                  <Link href='/pricing' className='inline-block p-3 text-white rounded-md leading-none bg-blue-700 hover:bg-blue-800 transition'>
                    Pricing
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <FetchError error={check.error} />
      )}
    </>
  )
}

const Loading = () => {
  return (
    <div className='flex justify-center items-center'>
      <h2 className='text-center mr-2'>Bytes</h2>
      {bytes.map((size, i) => (
        <div
          className={`p-3 inline-flex items-center leading-none border-2 mr-2 rounded-md bg-gray-200`}
          key={`loading-${i}`}
        >
          {size}
          <div className='ml-1'><LockIcon height={14} width={14} fill='black'/></div>
        </div>
      ))}
      <div>
        <div className='h-[20px] w-[20px]'>
          <LoadingSpinner fill={'#000'} />
        </div>
      </div>
    </div>
  )
}


async function getLicenses(session: Session, planUuid: string): Promise<Result<GetAllLicenses>> {
  try {
    const res = await fetch(`${salableApiBaseUrl}/licenses?granteeId=${session.uuid}&planUuid=${planUuid}&status=active`, {
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2',
        cache: 'no-cache',
      },
    })
    if (res.ok) {
      const data = await res.json() as GetAllLicenses
      return {data, error: null}
    }
    const error = await getErrorMessage(res)
    return {data: null, error}
  } catch (e) {
    console.log(e)
    return {data: null, error: 'Unknown error'}
  }
}