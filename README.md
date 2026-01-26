# Pet Rock 🪨

**Pet Rock** is a dedicated **Mini App** designed for the **Base** ecosystem and the **Farcaster** social protocol.

This application serves as a demonstration of a fully integrated Farcaster MiniApp, leveraging the "Frames" and "Mini App" capabilities to provide an interactive experience directly within Farcaster clients (like Warpcast) and Base-compatible wallets.

## BaseApp & Farcaster Integration

This project displays the power of building Social Apps on Base:

- **Farcaster User Context**: The app automatically detects the viewer's Farcaster identity (FID, Profile Picture, Display Name) to personalize the experience.
- **Native Social Sharing**: Integrated "Share" functionality allows users to cast their achievements directly to their Farcaster feed without leaving the app.
- **OnchainKit**: Built using Coinbase's OnchainKit to ensure seamless integration with Base and future onchain interactions.
- **Base Mini App**: Optimized to run as a native-feeling application within the Base App ecosystem.

## Features

- **Virtual Pet**: An interactive clicker game where you pet a rock. Simple, addictive, and Zen.
- **Smooth Animations**: High-quality interactions using Framer Motion to make the "petting" feel tactile and responsive.
- **Persistence**: Usage is saved locally, allowing users to return and continue their progress.
- **Admin & Configuration**:
  - **Global Reset**: Supports versioned storage keys to reset user progress globally (e.g., for "Seasons").
  - **Customizable UI**: Features like the greeting message can be toggled via environment variables.

## Configuration

While standard installation is standard Next.js, this app uses specific Environment Variables to control its behavior on the platform:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_PROJECT_NAME` | The name displayed in the app. |
| `NEXT_PUBLIC_SHOW_GREETING` | Set to `true` or `false` to toggle the "Hi, [Name]" welcome text. |
| `NEXT_PUBLIC_PETROCK_COUNT_VERSION` | A string (e.g., "v1"). Change this to invalidate previous local storage and reset everyone's pet count. |

## Disclaimer

This is a demo application created to showcase Base and Farcaster capabilities. No real rocks were harmed in the making of this code.
