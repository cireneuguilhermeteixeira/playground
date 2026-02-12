# Service Worker Preload & Cache Demo

This project demonstrates how to use a **Service Worker** to:

-   Preload a heavy page and its assets
-   Store them in **Cache Storage**
-   Serve them using a **cache-first strategy**
-   Improve perceived performance
-   Enable offline support

The demo uses a lightweight loading page to pre-cache a heavy page
before navigation.

------------------------------------------------------------------------

## Project Structure

    /index.html          → Loading page
    /heavy.html          → Heavy content page
    /app.js              → Client logic (register SW, trigger precache)
    /sw.js               → Service Worker
    /assets/
        heavy.css
        heavy.js
        big-data.json
        hero.jpg

------------------------------------------------------------------------

# What This Demo Shows

1.  How a Service Worker is registered\
2.  How a Service Worker is activated\
3.  How to programmatically pre-cache assets\
4.  How fetch interception works\
5.  How Cache Storage speeds up subsequent visits\
6.  How offline mode works

------------------------------------------------------------------------

# Execution Flow

## First Visit

1.  The browser loads `index.html` normally (no SW control yet).
2.  `app.js` registers `sw.js`.
3.  The Service Worker goes through its lifecycle:
    -   `install`
    -   `activate`
4.  After activation, the page may reload to gain control.
5.  When clicking **"Preload and Open"**:
    -   A message is sent to the SW (`PRECACHE_HEAVY`)
    -   The SW fetches each heavy asset
    -   Each response is stored in Cache Storage
6.  When precaching finishes:
    -   The page navigates to `heavy.html`
7.  Requests are now served via the Service Worker.

------------------------------------------------------------------------

## Subsequent Visits

1.  The Service Worker is already active.
2.  `heavy.html` and `/assets/*` are intercepted.
3.  The SW checks Cache Storage first.
4.  If found, the response is returned immediately.
5.  The page loads significantly faster.
6.  The app can even work offline.

------------------------------------------------------------------------

# Service Worker Lifecycle Overview

The Service Worker transitions through the following states:

-   **installing**
-   **installed (waiting)**
-   **activating**
-   **activated**
-   **redundant**

Once activated and controlling the page, it can intercept fetch
requests.

------------------------------------------------------------------------

# Caching Strategy Used

This demo uses a **Cache First strategy** for heavy assets:

    If in cache → return cached response
    Else → fetch from network → store in cache → return response

This approach prioritizes speed over always getting fresh data.

------------------------------------------------------------------------

# Advantages

-   Faster repeat visits\
-   Reduced network usage\
-   Offline capability\
-   Full control over caching behavior

------------------------------------------------------------------------

# Trade-offs

-   Requires careful cache invalidation (versioning)
-   Adds architectural complexity
-   Does not improve CPU-bound performance
-   First load may still require network access

------------------------------------------------------------------------

# How to Test

1.  Run on `http://localhost` or `https://`
2.  Open DevTools → Application → Service Workers
3.  Inspect Cache Storage
4.  Enable **Offline mode** in Network tab
5.  Reload `heavy.html` and verify it still loads

------------------------------------------------------------------------

# Key Takeaways

-   Service Workers do not run continuously; they are event-driven.
-   They intercept network requests within their scope.
-   Cache Storage is separate from traditional HTTP cache.
-   Proper versioning is essential for production use.

------------------------------------------------------------------------

This demo is designed to illustrate how Service Workers can improve
perceived performance and enable offline-first experiences in modern web
applications.