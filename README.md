# Inkwell – Blog Application (Module 1: Frontend)

A responsive, front-end-only blog interface built with plain HTML, CSS and JavaScript.

## Pages
| File | Purpose |
|---|---|
| `index.html` | Home – hero section and latest posts |
| `login.html` | Login form with validation |
| `register.html` | Registration form with validation |
| `dashboard.html` | Logged-in user's stats and post list (with delete) |
| `create-blog.html` | Form to publish a new post |

Shared files: `style.css` (design tokens, responsive layout) and `app.js` (navbar, validation, mock auth).

## Run locally
1. Install [VS Code](https://code.visualstudio.com/) and the **Live Server** extension.
2. Open this folder in VS Code, right-click `index.html` → **Open with Live Server**.
   (Double-clicking `index.html` also works.)

## How it works
No backend yet. Users, the session and posts are stored in the browser's `localStorage`.
Dashboard and Create Blog redirect to Login if you are not signed in.
To reset everything, clear site data in your browser's dev tools.

## Next module
Replace the `localStorage` calls in `app.js` with API requests to a real server and database.
