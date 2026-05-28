# 📱 PokedexPlusPlus

A modern Pokémon Pokédex mobile application built with **React Native CLI**, featuring Pokémon search, detailed stats, Google authentication with Supabase, profile management, offline caching, and a beautiful UI inspired by the Pokémon universe.

---

# ✨ Features

* 🔍 Search Pokémon by name
* 📖 View detailed Pokémon information
* ❤️ Save favorites locally
* 👤 Google Authentication with Supabase
* ☁️ Persistent login sessions
* 📱 Responsive mobile UI
* ⚡ Offline Pokémon caching using AsyncStorage
* 🎨 Clean modern Pokédex design
* 🔄 Smooth navigation between screens
* 📊 Trainer profile system
* 🌈 Custom gradients and animations

---

# 🛠️ Tech Stack

## Frontend

* React Native CLI
* TypeScript
* React Navigation
* React Native Vector Icons
* React Native Linear Gradient

## Backend & Auth

* Supabase
* Google OAuth

## Storage

* AsyncStorage

## APIs

* PokéAPI

---

# 📸 Screenshots

*Add your screenshots here*

| Home Screen | Details Screen | Profile Screen |
| ----------- | -------------- | -------------- |
| Screenshot  | Screenshot     | Screenshot     |

---

# 🚀 Getting Started

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/pokedexplusplus.git
cd pokedexplusplus
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Start Metro

```bash
npx react-native start
```

---

## 4️⃣ Run on Android

```bash
npx react-native run-android
```

---

# 🔐 Supabase Setup

Create a `.env` file or configure your credentials inside:

```ts
supabase/client.ts
```

Add your:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

---

# 🔗 Google OAuth Setup

Inside Supabase:

### Redirect URL

```txt
pokedex://login-callback
```

### Android Deep Link

Configured in:

```xml
AndroidManifest.xml
```

---

# 📂 Project Structure

```bash
PokedexPlusPlus/
│
├── screens/
│   ├── HomeScreen.tsx
│   ├── DetailsScreen.tsx
│   ├── ProfileScreen.tsx
│
├── supabase/
│   ├── auth.ts
│   ├── client.ts
│
├── components/
│
├── assets/
│
├── App.tsx
│
└── package.json
```

---

# 📦 Main Dependencies

```json
{
  "@react-navigation/native": "^7",
  "@supabase/supabase-js": "^2",
  "react-native-linear-gradient": "^2",
  "react-native-vector-icons": "^10"
}
```

---

# 🧠 What I Learned Building This

* React Native CLI setup
* Android native configuration
* OAuth authentication flows
* Deep linking
* Supabase integration
* State management with hooks
* AsyncStorage caching
* Mobile UI/UX design
* Debugging Metro & Gradle issues

---

# 🔥 Future Improvements

* Pokémon evolution chains
* Team builder
* Battle simulator
* Dark mode
* Firebase push notifications
* Pokémon comparison tool
* Cloud sync for favorites
* Infinite scrolling & pagination

---

# 🤝 Contributing

Pull requests are welcome.

If you’d like to improve the project, feel free to fork the repo and submit a PR.

---

# 📜 License

MIT License

---

# 👨‍💻 Author

Built with ❤️ by Dipur Movies
