![Salable Per Seat Pricing Demo](https://raw.githubusercontent.com/Salable/seats-demo/refs/heads/main/public/per-seat-banner.gif)

This app demonstrates using [per seat](https://www.salable.app/features/per-seat-pricing) billing with Salable.

## Tech stack
- [Next.js](http://Next.js)
- [Vercel](https://vercel.com/docs)
- [Iron sessions](https://github.com/vvo/iron-session)
- [Prisma (ORM)](https://www.prisma.io/)
- [Neon on Vercel (DB)](https://neon.tech/docs/guides/vercel-overview)

## Demo

[View demo](https://seats-demo.vercel.app/)

The product in the demo generates strings with random data which vary in size based on the number of bytes selected. To get access to the product a user must sign up and subscribe to a plan. The email of the sign up does not have to be real, this is just for demo purposes. The byte sizes for the strings are feature locked behind different plans. Once a user has subscribed they will be able access some or all of these features depending on what plan they are licensed on.

### Checkout
This instance of Salable is integrated with Stripe in test mode so no real money will ever be taken.
The customer email will be pre-populated with the email you have signed up with
In the Stripe checkout use the card number `4242 4242 4242 4242`, set a date in the future and the `CVC` can be any 3-digit number
Cardholder name can be any name.


## Auth
User details are stored in a Turso database, and passwords are securely hashed with unique salts. The ID of the logged-in user is used as the `granteeId` when creating a license on Salable and is also used for the Salable license checks. If you're developing an app within an existing ecosystem like Trello or Slack, you can swap out these authentication checks with their native authentication systems.

### User sessions
[Iron Session](https://github.com/vvo/iron-session) is used for storing user session data. 

## Getting started
### Project set up
1. Clone the project
2. Run `npm install`
3. Copy `.env.example` and paste as `.env`
4. Add the below to your `.env`
    ```
    DATABASE_URL="postgresql://admin:password@localhost:5432/demo-seats-db"
    NEXT_PUBLIC_APP_BASE_URL='http://localhost:3000'
    SESSION_COOKIE_NAME='salable-session-seats'
    SESSION_COOKIE_PASSWORD='Q2cHasU797hca8iQ908vsLTdeXwK3BdY'
    ```
5. [Install Docker](https://www.docker.com/get-started/). If you already have Docker installed skip this step. If you don't want to run Docker for local development skip to the next stage.
6. Run `docker-compose up -d`
7. Run `npx prisma db push`

### Alternative to Docker
If you are using Docker skip to [Configure Salable](#configure-salable).

To remove the requirement of Docker we will change the db provider to `sqlite`. 
1. Update the datasource in the `schema.prisma` file in the root of the project to use the provider `"sqlite"`
   ```
   datasource db {  
      provider = "sqlite"  
      url = env("DATABASE_URL")
   }
   ```
2. Update the `DATABASE_URL` var in your `.env` file to be `file:./dev.db`
3. Replace the contents of `./prisma/index.ts` with the code below -
   ```typescript
   import { PrismaClient } from "@prisma/client";
   import { PrismaLibSQL } from "@prisma/adapter-libsql";
   import { createClient } from "@libsql/client";
   import { env } from "@/app/environment";
   
   const libsql = createClient({ url: env.DATABASE_URL });
   const adapter = new PrismaLibSQL(libsql);
   export const prismaClient = new PrismaClient({ adapter });
   ```
4. Run `npx prisma db push`

### Configure Salable
1. [Sign up](https://salable.app/login) to Salable or [login](https://salable.app/login) if you already have an account.
2. Select `test mode`.
#### Create Product
1. `Select Products` > `Create Product`.
2. Give your product a name
3. Select `Paid Product`.
4. Select the test payment integration that is created for you on sign up. If you already have created a payment integration this can be used instead.
5. The default currency can be your preference.
#### Create Plan
1. `Select Plans` > `Create Plan`
2. Set the plan name as `Basic`
3. Continue to `License type`.
4. For the type of plan select `Standard`.
5. Select `Month` for subscription cycle.
6. Select `Per seat` license type. 
7. Select `Paid` to make it a paid plan.
8. Currencies will then appear, input the per seat cost of the plan’s subscription which will be billed to a customer every month.
9. Continue to `Assign values`.
10. This is section is for assigning feature values that can be used on pricing tables. This is not required to get set up.
11. Click continue to `Capabilities`.
12. Create three capabilities of `16`, `32` and `64`. These will be used to lock features behind the license check in the demo app.
13. Create Plan.
14. Repeat the above steps for a `Pro` plan but with the changes in the next steps.
15. Set the plan name to `Pro`.
16. Set a higher monthly cost to the `Basic` plan.
17. Select all capabilities `16`, `32` and `64` and create a new capability of `128`.

### Update project .env
1. Go back to `Products`.
2. Select `Api Keys`.
3. Copy the api key that was generated on sign up and assign to `SALABLE_API_KEY`.
4. Select `Products` > Select the product created in the previous steps.
5. Copy the product ID and assign to `NEXT_PUBLIC_PRODUCT_UUID`.
6. Select `Plans`.
7. Copy the ID of the `Basic` plan and assign to `NEXT_PUBLIC_SALABLE_PLAN_UUID`.
8. Copy the ID of the `Pro` plan and assign to `NEXT_PUBLIC_SALABLE_PRO_PLAN_UUID`.
9. Run `npm run dev`

## Need some help?
Get answers and guidance from our own developers and commercial model consultants. If you have an implementation query, or you are not sure which pricing model to use for your app, our people are ready to help.

<a href="https://discord.com/channels/1064480618546737163/1219751191483781214">
<img alt="Join the salable discord" src="https://raw.githubusercontent.com/Salable/seats-demo/refs/heads/main/public/discord-button.png" width="258" />
</a>