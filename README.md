# CartShare — Collaborative Shopping

CartShare is a responsive frontend project for a shared shopping cart. It uses HTML, CSS and vanilla JavaScript.

## Features
- Create a room with a unique six-character code or join an existing room.
- Add and remove shopping items with price and quantity.
- See item count, estimated total and room participants.
- Activity log showing room actions.
- Save room/cart data in browser `localStorage`.
- Synchronize changes between tabs opened on the same browser and website origin using the `storage` event.
- Print a clean receipt using the browser's print dialog.
- Responsive layout for desktop and mobile screens.

## Folder structure
```text
CartShare_Project/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── app.js
└── assets/
    └── (place project images here if needed)
```

## Run locally
1. Download and extract the project ZIP.
2. Open the `CartShare_Project` folder.
3. Double-click `index.html`, or open the folder in VS Code and use the Live Server extension.
4. Enter a name and click **Create a new room**.
5. Copy the room code. Open the same site in a second tab, enter another name, and join using that code.
6. Add or remove items in either tab to test synchronization.
7. Click **Print receipt** to preview or print the receipt.

## Important limitation
This version is a frontend demonstration. Browser storage syncs tabs that use the same browser profile and exact origin (for example, tabs on the same local server). It does **not** synchronize across separate devices or different browsers. For true internet-wide real-time collaboration, connect a backend such as Firebase or Supabase and add authentication/security rules.

## Deployment
### GitHub
1. Sign in at https://github.com and create a new public repository named `CartShare`.
2. Upload `index.html`, `README.md`, `css/`, `js/`, and `assets/` while preserving the folder structure.
3. Commit the files.

### GitHub Pages
1. Open repository **Settings → Pages**.
2. Under Build and deployment, choose **Deploy from a branch**.
3. Select branch `main` and folder `/ (root)`, then Save.
4. Wait for the published URL to appear on the Pages settings screen.
5. Open the live URL and test room creation and tab sync.

### Netlify (alternative)
1. Sign in at https://www.netlify.com/.
2. Choose **Add new site → Deploy manually**.
3. Drag the extracted project folder (the folder containing `index.html`) into the upload area.
4. Open the generated URL and test it.

## Suggested submission name
`BatchID_FullName_CartShare`

Replace `BatchID` and `FullName` with your actual batch ID and full name before submitting.
