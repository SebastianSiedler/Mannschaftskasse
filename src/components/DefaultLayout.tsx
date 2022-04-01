import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Head from 'next/head';
import { ReactNode, useEffect, useState } from 'react';
import { ReactQueryDevtools } from 'react-query/devtools';
import CssBaseline from '@mui/material/CssBaseline';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PeopleIcon from '@mui/icons-material/People';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

type DefaultLayoutProps = { children: ReactNode };

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  const [value, setValue] = useState(0);
  const router = useRouter();

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
    setValue(items.findIndex((x) => router.pathname.includes(x.route)));
  }, [router.pathname, items]);

  return (
    <>
      <Head>
        <title>Mannschaftskasse</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ pb: 7 }} className="text-slate-900">
        <main>{children}</main>
        <CssBaseline />

        <Paper
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
          elevation={3}
        >
          <BottomNavigation
            value={value}
            onChange={(event, newValue) => {
              setValue(newValue);
            }}
          >
            {items.map((item, i) => (
              <BottomNavigationAction
                label={item.name}
                icon={item.icon}
                key={i}
                onClick={() => router.push(item.route)}
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
