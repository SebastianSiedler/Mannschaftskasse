import PeopleIcon from '@mui/icons-material/People';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { type ReactNode, useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';

type DefaultLayoutProps = { children: ReactNode };

const tabScrollPositions = new Map<string, number>();

const getTabKey = (pathname: string) => {
  if (pathname.startsWith('/spiele')) return '/spiele';
  if (pathname.startsWith('/kader')) return '/kader';
  if (pathname.startsWith('/stats')) return '/stats';
  return pathname;
};

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  const [value, setValue] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const currentTabKey = getTabKey(location.pathname);

  const { data: session } = useSession();

  const items = [
    {
      name: 'Spiele',
      icon: <SportsSoccerIcon />,
      route: '/spiele',
      admin: false,
    },
    { name: 'Kader', icon: <PeopleIcon />, route: '/kader', admin: true },
    {
      name: 'Statistiken',
      icon: <QueryStatsIcon />,
      route: '/stats',
      admin: false,
    },
  ].filter((item) => !item.admin || session?.user.role === 'ADMIN');

  useEffect(() => {
    setValue(items.findIndex((x) => location.pathname.includes(x.route)));
  }, [location.pathname, items.findIndex]);

  useEffect(() => {
    const savedY = tabScrollPositions.get(currentTabKey);
    if (savedY !== undefined) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedY, behavior: 'instant' });
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    const handleScroll = () => {
      tabScrollPositions.set(currentTabKey, window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentTabKey]);

  return (
    <>
      <Box sx={{ pb: 7 }} className="text-slate-900">
        <main>{children}</main>
        <CssBaseline />

        <Paper
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }}
          elevation={3}
        >
          <BottomNavigation
            value={value}
            onChange={(_event, newValue) => {
              setValue(newValue);
            }}
          >
            {items.map((item, i) => (
              <BottomNavigationAction
                label={item.name}
                icon={item.icon}
                key={i}
                onClick={() => {
                  tabScrollPositions.set(currentTabKey, window.scrollY);
                  navigate({ to: item.route, resetScroll: false });
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      </Box>

      {process.env.NODE_ENV !== 'production' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </>
  );
};
