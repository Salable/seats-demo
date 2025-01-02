![Salable Per Seat Pricing Demo](https://raw.githubusercontent.com/Salable/seats-demo/refs/heads/main/public/per-seat-banner.gif?token=GHSAT0AAAAAACMKGD334OISGS2OXLK7TK6YZ3WY5JA)

This app demonstrates using [per seat](https://www.salable.app/features/per-seat-pricing) billing with Salable.

## Tech stack
- [Next.js](http://Next.js)
- [Vercel](https://vercel.com/docs)
- [Iron sessions](https://github.com/vvo/iron-session)
- [Turso (DB)](https://turso.tech/)
- [Prisma (ORM)](https://www.prisma.io/)
- [Turso + Prisma](https://www.prisma.io/docs/orm/overview/databases/turso) (warning: using Turso with Prisma is currently experimental)

## Demo

[View demo](https://flat-rate-demo.vercel.app/)

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
