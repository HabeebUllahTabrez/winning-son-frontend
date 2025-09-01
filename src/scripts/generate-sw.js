// scripts/generate-sw.js

import fs from "fs";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

// Read the template file
const template = fs.readFileSync("src/firebase-messaging-sw.template.js", "utf8");

// Replace placeholders with actual environment variables
const finalSw = template
  .replace(
    /__NEXT_PUBLIC_FIREBASE_API_KEY__/g,
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  )
  .replace(
    /__NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN__/g,
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  )
  .replace(
    /__NEXT_PUBLIC_FIREBASE_PROJECT_ID__/g,
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )
  .replace(
    /__NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET__/g,
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  )
  .replace(
    /__NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID__/g,
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  )
  .replace(
    /__NEXT_PUBLIC_FIREBASE_APP_ID__/g,
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );

// Write the final service worker file to the public directory
fs.writeFileSync("public/firebase-messaging-sw.js", finalSw);

console.log("✅ Generated firebase-messaging-sw.js successfully!");
