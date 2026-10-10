ONLY US CHAT — FIREBASE TEXT-ONLY VERSION

Files:
- index.html
- style.css
- app.js

This version uses Firebase Authentication (Email/Password) and Cloud Firestore.
It is designed for the two Firebase user UIDs supplied for this project.

IMPORTANT SETUP:
1. Keep the Firestore security rules restricted to those two UIDs.
2. In Firebase Console > Authentication > Settings > Authorized domains, ensure your GitHub Pages domain is listed.
3. In GitHub, replace index.html and app.js with these files. Keep your existing style.css.
4. Commit changes, wait for GitHub Pages to redeploy, then test sign-in on both devices.
5. This uses client-side Firebase config; never add a service-account/private key to these files.
6. This is access-controlled, but not end-to-end encrypted. Use strong passwords and keep accounts secure.

Firestore collection used: messages
Fields: text, senderUid, createdAt

If Firestore ordering errors appear, ensure the documents contain createdAt timestamps; messages are ordered by createdAt.
