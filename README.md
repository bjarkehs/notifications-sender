# Firebase Notification Sender

Send push notifications to multiple devices using Firebase Cloud Messaging.

## Setup

1. Install: `npm install`
2. Add Firebase service account key as `serviceAccountKey.json` (get from Firebase Console → Project Settings → Service Accounts)
3. Copy `deviceIds.txt.example` to `deviceIds.txt` and add FCM tokens (one per line)
4. Run: `npm start`

## Troubleshooting

- **Firebase SDK error**: Check `serviceAccountKey.json` exists and is valid
- **No devices found**: Verify `deviceIds.txt` has uncommented tokens
- **Send failed**: Token expired or FCM not enabled in project

## License

MIT
