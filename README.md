# Birthday Reminder

Birthday Reminder is a simple web app that helps you keep track of important birthdays so you never miss a celebration again. Add names and birthdates, and the app will automatically show upcoming birthdays sorted by the soonest date.

Visit the site live at: https://adarlings-bday-reminders.vercel.app/

![overview screenshot](public/overview.png)

##  Features
- Add a person's **name and birthday**
- View a list of **upcoming birthdays**
- Automatically **sorted by the soonest birthday**
- Shows **days remaining**
- Delete birthdays from the list
- Data saved using **localStorage**
- Create shared **photo albums**
- Upload photos that are visible to anyone with the website link

## Built With
- React
- Vite
- Tailwind CSS
- LocalStorage
- PocketBase (self-hosted backend + file storage)

## Shared Albums Setup (PocketBase)

The Albums tab uses PocketBase so data and uploaded photos are shared across all visitors.

1. Download PocketBase for your machine from the PocketBase releases page.
2. Extract it somewhere local, then start it:

```bash
./pocketbase serve
```

On Windows PowerShell, that is usually:

```powershell
.\pocketbase.exe serve
```

3. Open the PocketBase admin UI, usually at `http://127.0.0.1:8090/_/`.
4. Create the first admin account when prompted.
5. Create two collections:

### albums collection

- Collection name: `albums`
- Type: `Base`
- Fields:
	- `name` as text, required
	- `description` as text, optional
- API rules:
	- List rule: leave empty for public access
	- View rule: leave empty for public access
	- Create rule: leave empty for public access
	- Delete rule: leave empty for public access

### photos collection

- Collection name: `photos`
- Type: `Base`
- Fields:
	- `album` as relation, required, single-select, linked to `albums`
	- `caption` as text, optional
	- `image` as file, required, max files = 1, recommended max size = 5MB to 10MB
- API rules:
	- List rule: leave empty for public access
	- View rule: leave empty for public access
	- Create rule: leave empty for public access
	- Delete rule: leave empty for public access

6. Add this env var to a `.env` file:

```bash
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

7. If your frontend runs on a different origin, add that origin to PocketBase CORS settings.
8. Keep PocketBase running while developing, or deploy it to a small VPS if you want the albums online for others.

Notes:
- PocketBase automatically serves uploaded files from the `photos` collection, so there is no separate storage bucket setup.
- Deleting a photo record removes its file automatically.
- Deleting an album in this app deletes all related photo records first, then deletes the album.
- The current setup is intentionally public. Anyone with the site link can create, upload, and delete unless you tighten the collection rules later.

## Run the Project

```bash
npm install
npm run dev
```

---
Developed by Richelle Adarlo <3