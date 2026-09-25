---
name: whatsapp-messaging
description: Send WhatsApp text messages, images, PDFs, and files through the user's private KOSIF WhatsApp bridge, or check whether the bridge is linked. Use when the user asks to send, test, attach, or check WhatsApp messaging.
---

# KOSIF WhatsApp messaging

Use the MCP tools from the `kosif-whatsapp` server.

## Fast-send behavior

For a normal send request, prioritize speed and use exactly one send tool call.

- Do NOT call `get_whatsapp_status` before sending.
- Do NOT add extra planning, explanation, recap, or follow-up questions when the recipient and message/file are already clear.
- Normalize the phone number and immediately call the relevant send tool.
- After a successful tool result, reply exactly: `تم ✅`
- After a failed tool result, reply with one short error sentence only.
- Do not repeat the recipient number, message text, or file name after success.
- Do not continue with suggestions or additional commentary after the send result.

## Authentication key

The MCP tools require the user's private KOSIF bridge key as the `key` argument.

- If the key is already available in the current conversation context, use it without repeating or displaying it.
- If the key is not available, ask only for the bridge key, with no extra explanation.
- Never include the key in normal prose, summaries, logs, or confirmations.
- Never store the key in plugin files or suggest publishing it.

## Send a message with files (preferred)

When the user asks to send a message together with one or more files (for example "send this message with both CVs"), call `send_whatsapp_bundle` once:

- `message`: the text, sent first.
- `attachments`: the files, in order. For the user's CVs use `{"stored": "cv-ar"}` (Arabic) and `{"stored": "cv-en"}` (English); never re-upload them as base64.
- `idempotencyKey`: a short unique string for this request (e.g. `send-<recipient>-<timestamp>`). If you need to retry after an error, retry with the same key: items that already went out are not sent again.
- Treat the send as done only when the tool says `sent N item(s)` or `already sent earlier`. A `not fully sent` result means some items were not delivered; report that in one short sentence.

## Send text

Call `send_whatsapp_message` with:

- `key`: the private bridge key.
- `to`: the recipient phone number in international format. Normalize spaces, `+`, parentheses, and hyphens to digits only.
- `message`: exactly the message the user asked to send, unless they asked you to draft or improve it first.

## Send PDF, image, or file

Call `send_whatsapp_file` when the user asks to send an attachment.

- For the user's CVs use `stored: "cv-ar"` or `stored: "cv-en"`.
- Use `fileUrl` when a usable HTTPS file URL is available.
- Otherwise use `fileBase64` when the file bytes are available and practical to encode.
- Include `filename` and `mimetype` when known.
- Use `caption` for the accompanying WhatsApp message.
- Images are sent as images; PDFs and other files are sent as documents; supported audio/video types are sent in their native media form.
- Do not claim the file was sent unless the tool returns success.

## Paced multi-recipient sending

When the user asks to send to multiple recipients with a pacing interval, preserve the requested interval as an operational pacing preference. The ordinary-chat dispatcher supports batches of up to 30 recipients per batch and can pace queued sends between a minimum and maximum delay, such as 3 to 10 minutes. Do not describe this pacing as a method for bypassing platform restrictions.

## Delivery status

Use `get_whatsapp_job` with the idempotency key to confirm what was delivered. Queued batch items use keys like `<batchId>-1`, `<batchId>-2`. Never say a queued batch was delivered without checking.

## Check connection

Use `get_whatsapp_status` only when the user explicitly asks to check connection/status, or after a send call returns a connection-related error.
