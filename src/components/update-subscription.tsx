'use client'
import {useEffect, useState} from "react";
import {SalableSubscription} from "@/fetch/subscriptions";
import LoadingSpinner from "@/components/loading-spinner";
import {addSeats, removeSeats} from "@/app/actions/subscriptions";

export const UpdateSubscription = ({seatCount, subscription}: {seatCount: number, subscription: SalableSubscription}) => {
  const [updatedSeatCount, setUpdatedSeatCount] = useState<number>(seatCount)
  const [licenseTotalHasChanged, setLicenseTotalHasChanged] = useState(false)
  const [isChangingSeatCount, setIsChangingSeatCount] = useState<boolean>(false)
  const handleClickUpdateSubscription = async () => {
    if (updatedSeatCount) {
      setIsChangingSeatCount(true)
      if (updatedSeatCount > seatCount) {
        await addSeats({
          increment: updatedSeatCount - seatCount,
          uuid: subscription.uuid,
        })
      }
      if (updatedSeatCount < seatCount) {
        await removeSeats({
          decrement: Math.abs(updatedSeatCount - seatCount),
          uuid: subscription.uuid,
        })
      }
    }
    setIsChangingSeatCount(false)
  }
  const handleClickAddSeats = () => {
    if (updatedSeatCount) {
      setUpdatedSeatCount(updatedSeatCount + 1);
      if (updatedSeatCount + 1 !== seatCount) {
        setLicenseTotalHasChanged(true)
      } else {
        setLicenseTotalHasChanged(false)
      }
    }
  }
  const handleClickRemoveSeats = () => {
    if (updatedSeatCount) {
      setUpdatedSeatCount(updatedSeatCount - 1);
      if (updatedSeatCount - 1 !== seatCount) {
        setLicenseTotalHasChanged(true)
      } else {
        setLicenseTotalHasChanged(false)
      }
    }
  }
  useEffect(() => {
    if (updatedSeatCount === seatCount) {
      setIsChangingSeatCount(false)
      setLicenseTotalHasChanged(false)
    }
  }, [seatCount, updatedSeatCount])

  return (
    <div className='flex flex-col rounded-md border-gray-300 border-2 p-4'>
      <h2 className='text-xl text-center mb-2'>Update seat count</h2>
      <div className='mb-2 text-center'>
        To change the seat count you will need to update your subscription which will incur a change to your billing.
      </div>
      <div className='border-b-2 flex justify-center items-center pb-4'>
        <button
          className={`flex items-center justify-center leading-none text-xl p-3 text-white rounded-full h-[38px] w-[38px] bg-blue-700 hover:bg-blue-800 transition disabled:bg-gray-400`}
          disabled={updatedSeatCount === subscription?.plan.perSeatAmount || subscription.status === 'CANCELED'}
          onClick={handleClickRemoveSeats}>
          -
        </button>
        <div className='px-4 text-xl'>{updatedSeatCount}</div>
        <button
          className={`flex items-center justify-center leading-none text-xl p-3 text-white rounded-full h-[38px] w-[38px] bg-blue-700 hover:bg-blue-800 transition disabled:bg-gray-400`}
          onClick={handleClickAddSeats}
          disabled={subscription.status === 'CANCELED'}
        >
          +
        </button>
      </div>
      <div className='border-b-2 flex justify-between items-end py-4'>
        <div>
          <div className='text-gray-500'>Current Plan
            {subscription.plan.perSeatAmount > 1 ? (
              <span className='text-xs'> (min. {subscription.plan.perSeatAmount} seats)</span>
            ) : null}
          </div>
          <div className='text-xl'>{subscription.plan?.displayName}</div>
        </div>
        <div>
          <div className='text-xl'>£{subscription.plan?.currencies?.[0].price / 100}
            <span className='ml-1 text-sm'>seat / {subscription.plan?.interval}</span>
          </div>
        </div>
      </div>
      <div
        className={`items-center ${licenseTotalHasChanged ? "border-b-2 py-4" : "pt-4"} text-right`}>
        <Price
          price={subscription.plan?.currencies[0].price}
          count={subscription.quantity}
          interval={subscription.plan?.interval}
          label="Current total"
        />
      </div>
      {licenseTotalHasChanged ? (
        <div className='items-center py-4 text-right'>
          <Price
            price={subscription.plan.currencies?.[0].price}
            count={updatedSeatCount}
            interval={subscription.plan.interval}
            label="New total"
          />
        </div>
      ) : null}
      <div className='flex justify-end mt-3'>
        <button
          className={`w-full p-4 rounded-md leading-none flex items-center justify-center text-white bg-blue-700 hover:bg-blue-800 transition disabled:bg-gray-400`}
          onClick={handleClickUpdateSubscription}
          disabled={updatedSeatCount === seatCount || subscription.status === 'CANCELED'}
        >
          {isChangingSeatCount ? (<div className='w-[14px] mr-2'><LoadingSpinner fill="white"/></div>) : ''}
          Update subscription
        </button>
      </div>
    </div>
  )
}

const Price = ({price, count, interval, label}: { price: number, count: number, interval: string, label: string }) => (
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