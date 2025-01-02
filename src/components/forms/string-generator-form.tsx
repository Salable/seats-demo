'use client'
import {useState} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {LockIcon} from "@/components/icons/lock-icon";
import LoadingSpinner from "@/components/loading-spinner";
import {generateString} from "@/app/actions/strings";
import {toast} from "react-toastify";

export type Bytes = '16' | '32' | '64' | '128'
export type LicenseCheckResponse = {
  capabilities: {
    capability: string;
    expiry: string
  }[],
  signature: string,
}

export const StringGeneratorForm = ({check}: {check: LicenseCheckResponse | null}) => {
  const [randomString, setRandomString] = useState<string | null>(null)
  const {register, handleSubmit, watch, formState: {isSubmitting}} = useForm<{
    bytes: Bytes
  }>({
    ...(check && {defaultValues: {bytes: '16'}}),
    mode: 'onChange'
  })

  const onSubmit: SubmitHandler<{
    bytes: Bytes
  }> = async (formData) => {
    const randomString = await generateString(formData)
    if (typeof randomString === 'string') {
      setRandomString(randomString)
    } else {
      toast.error(randomString.error)
    }
  }

  const bytes: Bytes[] = ['16', '32', '64', '128']

  const Byte = ({size, capability}: {size: string; capability: boolean}) => {
    return (
      <>
        <label
          htmlFor={size}
          className={`p-3 inline-flex items-center leading-none border-2 mr-2 rounded-md font-bold
            ${watch().bytes === size ? "border-black bg-black text-white" : ""}
            ${capability ? "cursor-pointer" : ""}
            ${!capability ? "bg-gray-200" : ""}
          `}
        >
          {size}
          {!capability ? (
            <div className='ml-1'><LockIcon height={14} width={14} fill='black'/></div>
          ) : null}
        </label>
        <input disabled={!capability} id={size} type="radio" value={size} {...register('bytes')} className='hidden' />
      </>
    )
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='flex justify-center items-center'>
          <h2 className='text-center mr-3'>Bytes</h2>
          {bytes.map((byte, index) => (
            <Byte size={byte} capability={!!check?.capabilities.find((c) => c.capability === byte)} key={`${byte}-${index}`} />
          ))}

          {check ? (
            <button
              className={`p-3 text-white rounded-md leading-none font-bold bg-blue-700 hover:bg-blue-800 transition text-sm`}
              disabled={isSubmitting}
            >{!isSubmitting ? "Generate" :
              <div className='w-[15px]'><LoadingSpinner fill="white"/></div>}</button>
          ) : null}

        </div>
      </form>

      {randomString ? (
        <div className='mt-6 relative text-center flex justify-center'>
          <pre className='p-2 leading-none truncate text-lg text-center bg-white rounded-l-full'>{randomString}</pre>
          <CopyButton text={randomString} />
        </div>
      ) : null}
    </div>
  )
}

const CopyButton = ({text}: {text: string}) => {
  const [showMessage, setShowMessage] = useState(false)
  return (
    <button
      className='rounded-r-full font-bold bg-blue-700 hover:bg-blue-800 transition uppercase px-2 pr-[12px] text-white text-xs relative'
      onClick={() => {
        navigator.clipboard.writeText(text)
        setShowMessage(true)
        setTimeout(() => {
          setShowMessage(false)
        }, 600)
      }}
    >
      Copy
      <span
        aria-disabled={true}
        className={`absolute p-2 leading-none bg-black text-white top-[-30px] right-0 ${showMessage ? 'opacity-100' : 'opacity-0'} transition rounded-sm pointer-events-none normal-case`}
      >
        Copied!
      </span>
    </button>
  )
}

