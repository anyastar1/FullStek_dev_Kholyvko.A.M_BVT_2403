import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PetsIcon from "@mui/icons-material/Pets";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/entities/user";
import { getInitials } from "@/shared/lib/format";

const navItems = [
  { label: "Главная", to: "/" },
  { label: "Лента объявлений", to: "/feed" },
  { label: "ИИ-поиск по фото", to: "/search" },
  { label: "Разместить объявление", to: "/pets/new" },
];

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { user, status, logout } = useAuth();

  const handleLogout = () => {
    setDrawerOpen(false);
    navigate("/"); // сначала уходим с приватной страницы, чтобы охрана маршрута не перекинула на /login
    void logout();
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 3, py: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            component={NavLink}
            to="/"
            sx={{ textDecoration: "none", color: "inherit", mr: 1 }}
          >
            <PetsIcon color="primary" />
            <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
              FindPetik
            </Typography>
          </Stack>

          <Stack direction="row" gap={0.5} sx={{ display: { xs: "none", md: "flex" }, flexGrow: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.to}
                component={NavLink}
                to={item.to}
                sx={{
                  color: "text.primary",
                  "&.active": { color: "primary.main", backgroundColor: "rgba(62,92,70,0.08)" },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ flexGrow: 1, display: { xs: "block", md: "none" } }} />

          <Stack direction="row" gap={1.5} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
            {status === "authenticated" && user && (
              <>
                <IconButton onClick={() => navigate("/profile")} aria-label="Личный кабинет" title={user.name}>
                  <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: "0.9rem" }}>
                    {getInitials(user.name)}
                  </Avatar>
                </IconButton>
                <Button variant="outlined" onClick={handleLogout}>
                  Выйти
                </Button>
              </>
            )}
            {status === "anonymous" && (
              <>
                <Button variant="text" onClick={() => navigate("/login")}>
                  Войти
                </Button>
                <Button variant="outlined" onClick={() => navigate("/register")}>
                  Регистрация
                </Button>
              </>
            )}
          </Stack>

          <IconButton
            aria-label="Открыть меню"
            sx={{ display: { xs: "inline-flex", md: "none" } }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <List>
            {navItems.map((item) => (
              <ListItemButton key={item.to} component={NavLink} to={item.to}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
            {status === "authenticated" && (
              <>
                <ListItemButton component={NavLink} to="/profile">
                  <ListItemText primary="Личный кабинет" />
                </ListItemButton>
                <ListItemButton onClick={handleLogout}>
                  <ListItemText primary="Выйти" />
                </ListItemButton>
              </>
            )}
            {status === "anonymous" && (
              <>
                <ListItemButton component={NavLink} to="/login">
                  <ListItemText primary="Войти" />
                </ListItemButton>
                <ListItemButton component={NavLink} to="/register">
                  <ListItemText primary="Регистрация" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
