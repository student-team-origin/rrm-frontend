import EventNoteIcon from '@mui/icons-material/EventNote';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState, type ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { APPROVER_ROLES } from '../../features/approvals/utils/approvalRules';
import { useCurrentUser } from '../../features/auth/hooks/useCurrentUser';
import { useLogout } from '../../features/auth/hooks/useLogout';
import type { Role } from '../../features/auth/types';

const DRAWER_WIDTH = 240;

/** O intrare din meniu; cu `roles`, apare doar utilizatorilor cu cel puțin unul dintre ele. */
type NavItem = { label: string; to: string; icon: ReactNode; roles?: Role[] };

/** Intrările din meniul lateral. Se adaugă aici pe măsură ce apar paginile noi. */
const NAV_ITEMS: NavItem[] = [
  { label: 'Catalog resurse', to: '/resources', icon: <Inventory2Icon /> },
  { label: 'Rezervările mele', to: '/reservations', icon: <EventNoteIcon /> },
  { label: 'Aprobări', to: '/approvals', icon: <FactCheckIcon />, roles: APPROVER_ROLES },
];

/**
 * Structura comună a paginilor: bara de sus (cu utilizatorul curent și deconectarea), meniul
 * lateral și conținutul paginii curente.
 */
export function AppLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const logoutMutation = useLogout();
  const userRoles = currentUser?.roluri?.map((role) => role.rol) ?? [];
  const navItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.some((role) => userRoles.includes(role)),
  );

  const navigation = (
    <Box component="nav" aria-label="Meniu principal">
      <Toolbar />
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            sx={{ '&.active': { bgcolor: 'action.selected' } }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          {!isDesktop && (
            <IconButton
              color="inherit"
              edge="start"
              aria-label="Deschide meniul"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="span" noWrap sx={{ flexGrow: 1 }}>
            Research Resource Manager
          </Typography>
          {currentUser?.nume && (
            <Typography
              variant="body2"
              component="span"
              noWrap
              sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}
            >
              {currentUser.nume}
            </Typography>
          )}
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            Deconectare
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop || mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {navigation}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, minWidth: 0 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
