import * as React from 'react';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import Grid from '@mui/material/Unstable_Grid2';
import Searchform from '../components/Searchform';
import Typography from '@mui/material/Typography';

export default function BasicGrid() {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center" textAlign="center" style={{ paddingTop: '1%' }}>
      <Grid xs={3}>
        {user ? (
          <>
          <Grid>
            <Typography>Ciao {user.displayName}</Typography>
          </Grid>
          <Grid>
            <Typography>La tua mail: {user.email}</Typography>
          </Grid>
          <Grid>
            <Searchform />
          </Grid>
          </>
        ) : (
          <Typography>Per favore, registrati</Typography>
        )}
      </Grid>
    </Grid>
  );
}
