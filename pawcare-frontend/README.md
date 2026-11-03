# 🐾 PawCare Frontend

The client-side single page application for PawCare, built with **React 19**, **TypeScript**, and **Vite**.

---

## 🎨 UI & Features

- **Claymorphism Design System:** Soft inflated 3D clay aesthetic with inner highlights and layered shadows defined in `src/index.css`.
- **Dynamic Species Themes:**
  - 🐶 **Dog Theme:** Soft mint-green palette with cute puppy face floating background icons.
  - 🐱 **Cat Theme:** Soft pastel butter-yellow palette with cute kitten face floating background icons.
  - 🐾 **Neutral Theme:** Clean neutral clay palette.
- **Mobile-First Gestures:** Touch-swipe sliding screen navigation and animated floating bottom pill bar.
- **State & Data Fetching:** TanStack React Query 5 with Axios interceptors for seamless JWT authentication and automatic token refresh.

---

## 🛠️ Scripts

```bash
# Start development server on http://localhost:5173
npm run dev

# Type-check and build production bundle
npm run build

# Fast linting with Oxlint
npm run lint

# Preview production build locally
npm run preview
```

---

## 🔌 API Proxy

Vite is pre-configured with a local proxy in `vite.config.ts`:
- Requests to `/api/*` are automatically forwarded to `http://localhost:8000/api/*`.
