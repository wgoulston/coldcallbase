# ColdCallBase

Track cold calls to small businesses — log outcomes, view a heatmap, and click businesses directly on Google Maps to add notes.

## Features

- **Google Maps** — click any business on the map to open a call log form
- **Heatmap** — visualise call density across your area
- **Status tracking** — Pending / Interested / Not Interested / Call Back / Closed
- **Dashboard** — at-a-glance counts and recent activity
- **Full-text search** — filter calls by name, address, or notes
- **Auth** — separate accounts for owner and employee (Supabase Auth)

## Setup

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/coldcallbase.git
cd coldcallbase
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Authentication → Users** and create accounts for yourself and your employee
4. Copy your project URL and keys from **Settings → API**

### 3. Google Maps API

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project and enable billing (you get $200/month free — more than enough)
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Places API**
4. Create an API key and restrict it to your Vercel domain (e.g. `https://yourapp.vercel.app/*`)

### 4. Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your-google-maps-api-key
```

### 5. Run locally

```bash
npm run dev
```

### 6. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add the same environment variables in your Vercel project settings under **Settings → Environment Variables**.

## Usage

- **Map page** — navigate to an area, click any business (yellow POI icons) to open the log form. Existing calls show as coloured dots. Toggle the heatmap on/off with the button in the top right.
- **Calls page** — search and filter all call records, click Edit to update a record.
- **Dashboard** — overview of all call counts and recent activity.
