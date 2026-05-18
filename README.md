# OK Strojevi

Monorepo: React (Vite + TS) client and Express 4 + Mongoose 8 (TS) API, with
JWT auth and three roles — **admin**, **control**, **user**.

```
.
├── client/   # Vite + React + TypeScript (deploy to Netlify)
├── server/   # Express 4 + Mongoose 8 + TypeScript (deploy to Render)
├── render.yaml
└── package.json   # root dev scripts
```

## Local development

Prerequisites: Node 18+, and a MongoDB instance (local or MongoDB Atlas).

```bash
npm run install:all

# server env
cp server/.env.example server/.env      # then edit MONGODB_URI / JWT_SECRET
# client env (optional in dev — Vite proxies /api to localhost:5000)
cp client/.env.example client/.env

npm run dev    # runs server (:5000) and client (:5173) together
```

## Auth & roles

- `POST /api/auth/register` — creates a `user`. Elevated roles (`admin`,
  `control`) can only be assigned by an authenticated admin.
- `POST /api/auth/login` — returns `{ token, user }`.
- `GET /api/auth/me` — current user (requires `Authorization: Bearer <token>`).

Route protection on the server: `requireAuth` and `requireRole('admin', …)`
in `server/src/middleware/auth.ts`. On the client: `<ProtectedRoute roles={[…]}>`.

### Creating the first admin

There is no public way to create an admin (by design). Once a user exists,
promote them directly in MongoDB:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

That admin can then register `control`/`admin` users via the API.

## Deployment

- **Client → Netlify**: base directory `client`, build `npm run build`,
  publish `client/dist`. Set `VITE_API_URL` to the Render API URL.
  SPA redirects are in `client/netlify.toml`.
- **Server → Render**: uses `render.yaml`. Set `MONGODB_URI` (Atlas) and
  `CLIENT_ORIGIN` (the Netlify site URL) in the Render dashboard.

## Next

Feature work (machines / domain model) is not built yet — pending the
domain spec.
