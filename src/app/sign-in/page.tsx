'use client'
import React, {useRef, useState} from "react";
import {User, useSalableContext} from "@/components/context";
import Link from "next/link";
import {LockIcon} from "@/components/lock-icon";
import {TickIcon} from "@/components/tick-icon";
import Head from "next/head";
import Image from "next/image";
import {DownIcon} from "@/components/down-icon";
import LoadingSpinner from "@/components/loading-spinner";
import {useOnClickOutside} from "usehooks-ts";
import {Resolver, useForm} from "react-hook-form";
import {pbkdf2Sync, randomBytes} from "crypto";
import {useRouter} from "next/navigation";



export default function SignIn() {
  return (
    <>
      <Head>
        <title>Salable Seats Demo</title>
      </Head>
      <main className="min-h-screen p-24 bg-gray-100">
        <div className="w-full font-sans text-sm">
          <Main />
        </div>
      </main>
    </>
  );
}

type FormValues = {
  email: string;
  password: string;
};

const resolver: Resolver<FormValues> = async (values) => {
  const errors = () => {
    const obj: Record<string, {
      type: string;
      message: string;
    }> = {}
    if (!values.email) {
      obj.email = {
        type: 'required',
        message: 'Email is required.',
      }
    }
    if (!values.password) {
      obj.password = {
        type: 'required',
        message: 'Password is required.',
      }
    }
    return obj
  }
  return {
    values: values ?? {},
    errors: errors(),
  };
};

const Main = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver });
  const router = useRouter()
  const {setUser} = useSalableContext()
  const onSubmit = handleSubmit(async (data) => {
    const userResponse = await fetch('/api/sign-in', {
      method: 'post',
      body: JSON.stringify({...data})
    })
    const user = await userResponse.json() as User
    if (setUser) {
      console.log('==== HERE')
      setUser(user)
    }
    router.push('/')
  });
  return (
    <>
      <div className='max-w-[500px] m-auto'>
        <h1 className='text-3xl mb-4'>Sign In</h1>
        <form onSubmit={onSubmit} className='grid gap-3'>
          <fieldset>
            <input className='p-3 w-full' {...register("email")} placeholder="Email"/>
            {errors.email && <p className='text-red-600'>{errors.email.message}</p>}
          </fieldset>

          <fieldset>
            {/*<input type="password" className='p-3 w-full' {...register("password")} placeholder="Password"/>*/}
            <input className='p-3 w-full' {...register("password")} placeholder="Password"/>
            {errors.password && <p className='text-red-600'>{errors.password.message}</p>}
          </fieldset>

          <div>
            <button className={`p-4 text-white rounded-md leading-none bg-blue-700`}>Sign in</button>
          </div>
        </form>
      </div>
    </>
  )
}