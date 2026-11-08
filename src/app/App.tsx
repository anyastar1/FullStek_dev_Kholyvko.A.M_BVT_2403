import { Route, Routes } from "react-router-dom";
import { CreateListingPage } from "@/pages/CreateListingPage";
import { FeedPage } from "@/pages/FeedPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PetDetailPage } from "@/pages/PetDetailPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { SearchPage } from "@/pages/SearchPage";
import { AppLayout } from "./layout/AppLayout";
import { GuestRoute } from "./routes/GuestRoute";
import { ProtectedRoute } from "./routes/ProtectedRoute";

/** Все маршруты приложения в одном месте: публичные, приватные и только для гостей. */
export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/pets/:petId" element={<PetDetailPage />} />

        {/* приватные страницы: только для вошедших */}
        <Route element={<ProtectedRoute />}>
          <Route path="/pets/new" element={<CreateListingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* вход и регистрация: только для гостей */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
