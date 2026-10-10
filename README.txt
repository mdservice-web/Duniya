ONLY US CHAT — ANDROID STARTER

Included:
- Mobile-first chat UI
- Demo passcode screen
- Text messages stored in this browser's localStorage
- Voice recording preview and local demo message storage

IMPORTANT LIMITATIONS:
- This is a FRONTEND DEMO, not a real private online chat.
- Demo passcode is visible in app.js and is not secure authentication.
- Data is local to this browser/device; it will NOT sync with your girlfriend's phone.
- Do not use it for confidential messages yet.
- Real online private chat requires backend authentication, database policies (e.g. Supabase RLS), and private voice-file storage policies.
- Voice files may exceed browser local storage limits.

Demo passcode: our-secret

To preview:
1. Open index.html in a browser that supports local files, or upload these files to a static hosting service.
2. Microphone access usually requires HTTPS (a secure website) or localhost.
3. Enter any name and passcode our-secret.

For real deployment:
1. Create a Supabase project.
2. Configure exactly two accounts and disable public sign-ups.
3. Create a conversations/messages table with strict row-level security.
4. Create a private storage bucket and policies for voice files.
5. Connect the frontend to Supabase using only the public anon/publishable key; never expose the service-role key.
6. Test with both accounts and verify a third account cannot read or write messages.
