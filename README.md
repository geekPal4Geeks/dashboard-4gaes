# Dashboard 4Geeks

A modern React dashboard application built with Vite, Material-UI, and React Router.

## 🚀 Features

- ⚡️ Vite for lightning fast development
- 🎨 Material-UI for beautiful, responsive components
- 🛣️ React Router for navigation
- 📦 Modern React with hooks
- 🎭 Emotion for styled components
- 🎨 Lottie for animations
- 🔍 ESLint for code quality

## 📦 Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd dashboard-4gaes
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
VITE_4GEEKS_API_URL=https://breathecode.herokuapp.com/v1
```

4. Start the development server:
```bash
npm run dev
```

## 🏗️ Project Structure

```
src/
├── assets/        # Static assets like images, fonts, etc.
├── components/    # Reusable React components
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── services/      # API services and utilities
├── App.jsx        # Main App component
├── main.jsx       # Application entry point
├── routes.jsx     # Route definitions
└── store.js       # State management
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🔒 Security & Role Validation

### ⚠️ Important: Never trust frontend state for security
- The store (Context, Redux, etc.) and localStorage can be manipulated by users.
- Always validate roles and permissions on the backend before allowing sensitive actions.
- The frontend should only be used for UI/UX, not for enforcing security.

### Role Validation Hook: `useRoleValidation`

This project includes a reusable hook to validate the user's role in real time against the backend before performing sensitive actions (e.g., modifying data in Notion):

```js
import { useRoleValidation } from './hooks/useRoleValidation';

const { validateRole, loading, error } = useRoleValidation();

const handleSensitiveAction = async () => {
  const isValid = await validateRole();
  if (!isValid) {
    alert(error || 'No tienes permisos');
    return;
  }
  // Proceed with the sensitive action
};
```

- You can use the `watch` option to automatically revalidate if the role changes:
  ```js
  const { validateRole } = useRoleValidation({ watch: true });
  ```
- This hook is useful for keeping the UI in sync and for extra validation, but **never replaces backend security**.

## 🧑‍💻 Contributing
- Use the provided hooks and services for API calls and role validation.
- Place all API logic in the `services/` folder for maintainability.
- Use the global store/context for user info, not for security enforcement.

## 📝 License

MIT 