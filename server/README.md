# Uploader server

This server accepts multipart/form-data uploads (fields: `name`, `message`, file under `file`) and commits them into the repository under an `uploads/` directory.

Environment variables required:
- GH_OWNER (e.g. `abdullah-x909`)
- GH_REPO (e.g. `abdullah-x909.github.io`)
- GH_BRANCH (optional, default `main`)
- GH_TOKEN (a Personal Access Token with `repo` scope)

Run locally:
- cd server
- npm install
- export GH_OWNER=... GH_REPO=... GH_TOKEN=... (or set in .env and use a process manager)
- npm start

If you need to expose the server to the internet for phone uploads, use ngrok:
- ngrok http 3000
- put the ngrok https URL into `uploader/index.html` fetch URL

Security notes:
- Keep `GH_TOKEN` secret. Do not put it into client-side code.
- Consider adding a simple shared secret or authentication if you do not want open uploads.
