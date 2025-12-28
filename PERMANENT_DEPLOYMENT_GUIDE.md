# Permanent Deployment Guide for IATrackMe

This guide explains how to host your habit tracker app permanently using free and reliable platforms.

## Option 1: GitHub Pages (Easiest & Free)
Since your project is already on GitHub, you can use GitHub Pages to host the web version for free.

1.  **Install the `gh-pages` package**:
    ```bash
    pnpm add -D gh-pages
    ```
2.  **Add deployment scripts to `package.json`**:
    ```json
    "scripts": {
      "predeploy": "npx expo export --platform web",
      "deploy": "gh-pages -d dist"
    }
    ```
3.  **Deploy**:
    ```bash
    pnpm deploy
    ```
4.  **Enable GitHub Pages**: Go to your GitHub repository settings > Pages and set the source to the `gh-pages` branch.

## Option 2: Vercel or Netlify (Recommended for Web)
These platforms offer excellent performance and automatic deployments whenever you push to GitHub.

1.  **Connect your GitHub account** to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2.  **Import the `iatrackme-permanent` repository**.
3.  **Configure Build Settings**:
    *   **Build Command**: `npx expo export --platform web`
    *   **Output Directory**: `dist`
    *   **Install Command**: `pnpm install`
4.  **Deploy**: The platform will automatically build and host your site.

## Option 3: Vercel (with Server Support)
If you need the server-side features (like the API in `server/`), Vercel is the best choice as it supports Node.js functions.

1.  Create a `vercel.json` in the root:
    ```json
    {
      "rewrites": [{ "source": "/api/(.*)", "destination": "/api/index.js" }]
    }
    ```
2.  Vercel will automatically detect the `package.json` and handle the deployment.

## Summary of Your Fixed Features
*   **Settings Icon**: Now uses the correct gear icon.
*   **Export/Import**: Fully functional in the Settings menu.
*   **Reset Data**: Safely clears all local data and notifications.

Your code is now live at: [https://github.com/rashedobeid14-ops/iatrackme-permanent](https://github.com/rashedobeid14-ops/iatrackme-permanent)
