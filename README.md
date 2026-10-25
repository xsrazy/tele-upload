# Tele Upload

A web file uploader backed by Telegram and Google Drive. The website is the
only UI: upload, list, download, and delete files from one page. File bytes
live in Telegram (and, as a mirror, in Google Drive). Downloads are proxied
through the server, so the bot token never reaches the browser.

Live site: https://upload.xsrazy.web.id/

## How it works

- Upload (POST /api/upload) sends the file to a Telegram chat via
  `sendDocument`. Metadata and the Telegram `file_id` are stored in
  Cloudflare D1.
- List (GET /api/list) reads the file index from D1.
- Download (GET /api/download/:id) streams the file back through the Worker
  using Telegram `getFile`, or the Drive API for Drive-only files.
- Delete (DELETE /api/delete/:id) removes the Telegram message, the Drive
  copy (when present), and the D1 row, so the download link dies too.
- Bulk upload: the form accepts many files at once, sent one by one with a
  ~1.2 second gap and one automatic retry on Telegram 429 responses.
- Drive mirror (OAuth, scope `drive.file`): every Telegram upload is also
  uploaded to a target Drive folder. A Drive failure never fails the Telegram
  upload (`drive_error` is reported in the response instead).
- Size rule: files up to 20 MB go to Telegram + Drive. Files over 20 MB go to
  Drive only (Telegram is skipped, because Telegram bot downloads via
  `getFile` are capped at 20 MB). A file over 20 MB is rejected when Google
  credentials are not configured, so it can never end up stored nowhere.
- Locked page: opening the site shows a key form first. A correct key sets
  an HttpOnly session cookie valid for 30 days (stored in D1 as
  `session:<token>`). Every API endpoint accepts the upload key header
  (`x-upload-key`) or the session cookie, and returns 401 without either.
  Logout clears the session.

## Limits

- Telegram bots can send up to 50 MB, but bot downloads via `getFile` are
  capped at 20 MB per file. That is why the Telegram path stops at 20 MB.
- Telegram allows roughly 1 message per second per chat, so bulk uploads are
  throttled on purpose.
- The Worker runs on the Cloudflare free tier (100k requests per day).

## Configuration (secrets, set with `wrangler secret put`)

- `TELEGRAM_BOT_TOKEN`: bot token from @BotFather.
- `TELEGRAM_CHANNEL_ID`: the chat the bot sends files to (a private chat
  works; the bot must be able to post there).
- `UPLOAD_KEY`: the key that unlocks the page and authorizes uploads.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`:
  OAuth credentials for the Drive mirror (Desktop app client,
  `drive.file` scope, offline access).
- `DRIVE_FOLDER_ID` (optional): target Drive folder. Without it, the Worker
  creates its own `Upload-tele` folder and remembers it in D1.

Never delete the Telegram chat messages by hand: the messages are the files.

## Deploy

1. `wrangler d1 create tele-upload` (put the real database id in
   `wrangler.toml`; the id in this repo is censored).
2. `wrangler d1 execute tele-upload --remote --file schema.sql`
3. `wrangler secret put TELEGRAM_BOT_TOKEN TELEGRAM_CHANNEL_ID UPLOAD_KEY`
   (plus the Google secrets for the Drive mirror).
4. `wrangler deploy`

## Security notes

- Uploads require the key. Without it, anyone could park files in the
  Telegram chat.
- The bot token and Google credentials live only as Worker secrets, never in
  this repository. Values that would identify private infrastructure are
  censored with `******` in this repo.

## Credits

Tele Upload is an original project by Rahmatul Usra (@xsrazy), built from
scratch.
