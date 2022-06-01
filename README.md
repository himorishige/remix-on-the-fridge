# Stick notes on the fridge

This is an application that imagines writing notes on sticky notes on refrigerator doors.  
In Japan, many people leave notes on their fridges about what they need for shopping or school, and stick them on the fridge.

You can consult with family members or friends via chat, assign a person to be in charge, and record the information as a sticky note. You can also filter who is in charge to make it easier to see your tasks. The people who can be assigned are either yourself or people who are online.

- Applications are delivered using Cloudflare Workers.
- Message and sticky note updates are implemented using Durable Objects.
- Workers KV is used to manage login sessions.
- May be largely replaced when D1 is released🤔

## Quick Start

1. First, create a new private board.
2. Choose your own username and log in.
3. Copy the QR code or URL from the share icon and send it to the people you want to share it with.
4. Communicate with family and friends via messages!
5. Check out what you want to leave on the sticky note from your message. At that time, choose the person you would like to ask.
6. When a task is completed, the sticky note can be marked as done.
7. You can also export your assigned stickies as images.
8. Make a note of the board URL so you don't forget it.

## What's inside?

This turborepo uses Yarn as a package manager. It includes the following packages/apps/services:

### Apps and Packages

- `apps/remix-app`: [Remix](https://remix.run) app
- `services/worker`: Worker
- `packages/board-do`: DO that implements a websocket interface to place and manage messages and sticky notes
- `packages/sticky-do`: DO to manage sticky notes
- `packages/user-state-do`: DO to manage users online state
- `packages/rate-limiter-do`: DO to manage rate limiter
- `packages/counter-do`: DO to manage counter state
- `packages/cloudflare-config`: worker configurations
- `packages/tsconfig`: `tsconfig.json`s used throughout the monorepo
- `packages/eslint-config-custom`: `eslint` configurations

## Setup

This repository uses turborepo, and selected when choosing which package manager you wish to use with your monorepo (yarn).

```
yarn install
```

### Build

To build all apps and packages, run the following command:

```
cd on-the-fridge
yarn build
```

### Develop

To develop all apps and packages, run the following command:

```
cd on-the-fridge
yarn dev
```

### Deploy

```
yarn deploy
```