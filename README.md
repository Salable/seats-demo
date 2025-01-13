![Salable Per Seat Pricing Demo](https://raw.githubusercontent.com/Salable/seats-demo/refs/heads/main/public/per-seat-banner.gif)

This demo application showcases Salable's
[per seat](https://www.salable.app/features/per-seat-pricing) billing model.

## Tech stack

- [Next.js](https://nextjs.org/)
- [Vercel](https://vercel.com/docs)
- [Iron Session](https://github.com/vvo/iron-session)
- [Turso (DB)](https://turso.tech/)
- [Prisma (ORM)](https://www.prisma.io/)
- [Turso + Prisma](https://www.prisma.io/docs/orm/overview/databases/turso)
  (Prisma's Turso support is currently in Early Access)

## Demo

[View Hosted Demo](https://seats-demo.vercel.app/)

The product in the demo generates strings with random data which vary in size
based on the number of bytes selected. To get access to the product a user must
sign up and subscribe to a plan. The byte sizes for the strings are feature
locked behind different plans. Once a user has subscribed they will be able
access some or all of these features depending on what plan they are licensed
on.

The email of the sign up does not have to be real, this is just for demo
purposes.

The demo is integrated with Stripe to handle payments and is running in test
mode so a fake/demonstration card can be used.

### Demo Card Details

**Card Number**: `4242 4242 4242 4242` \
**Expiry Date**: Any future date (`09/42`) \
**CVC**: Any 3 digit number (`123`) \
**Cardholder Name**: Anything (`Mr John Doe`)

## Auth

User details are stored in the Turso database, and passwords are securely hashed
with unique salts. The ID of the logged-in user is used as the `granteeId` when
creating a license on Salable. It is also used for the license checks. If you're
developing an app within an existing ecosystem like Trello or Slack, you can
swap out the included authentication system with theirs.

## Project Setup

### Getting the code

1. Clone the repo (`git clone git@github.com:Salable/seats-demo.git`)
1. Run `npm install`
1. Create an `.env` file (`cp .env.example .env`)
1. Run `npx prisma db push`

### Accessing Salable

1. [Sign up](https://salable.app/login) for Salable or [Login](https://salable.app/login) if you already have an account.
1. Ensure you have "Test Mode" enabled.

#### Create Product

1. Go to the Products page and click the "Create Product" button.
1. Give your product any name.
1. Tick the `Paid Product` checkbox.
1. Select the test payment integration that is created for you on sign up. If you already have created a payment integration this can be used instead.
1. Select whichever default currency you'd prefer.

#### Create Plan

1. Go to the "Plans" tab on the sidebar and select "Create Plan"
1. Set the plan name as `Basic` and optionally provide a description.
1. Press "Continue" to configure "License Type" information.
1. For the type of plan select `Standard`.
1. Select `Month` for subscription cycle.
1. Select `Per Seat` license type.
1. Select `Paid` to make it a paid plan.
1. Currencies will then appear, input the per seat cost of the plan’s subscription which will be billed to a customer every month.
1. Continue to `Assign values`.
1. This is section is for assigning feature values that can be used on pricing tables. This is not required to get set up.
1. Click continue to `Capabilities`.
1. Create three capabilities of `16`, `32` and `64`. These will be used to lock features behind the license check in the demo app.
1. Create Plan.
1. Set a higher monthly cost to the `Basic` plan.
1. Set the minimum amount of seats to `4`.
1. Select all capabilities `16`, `32` and `64` and create a new capability of `128`.

### Update Environment Variables

1. Copy the Product ID from the "General Settings" tab and assign to
   `NEXT_PUBLIC_PRODUCT_UUID` in the `.env` file.
1. Go to the "Plans". Assign the `Basic` ID to `NEXT_PUBLIC_SALABLE_PLAN_UUID`
   and the `Pro` ID to `NEXT_PUBLIC_SALABLE_PRO_PLAN_UUID`.
1. Visit the "API Keys" page.
1. Copy the API Key that was generated on sign up and assign to `SALABLE_API_KEY`.
1. Run `npm run dev`

## Need some help?

Get answers and guidance from our own developers and commercial model consultants. If you have an implementation query, or you are not sure which pricing model to use for your app, our people are ready to help.

<a href="https://discord.com/channels/1064480618546737163/1219751191483781214">
<img alt="Join the salable discord" src="https://raw.githubusercontent.com/Salable/seats-demo/refs/heads/main/public/discord-button.png" width="258" />
</a>
