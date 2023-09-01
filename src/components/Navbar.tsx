import * as React from 'react';
import { getAuth, onAuthStateChanged, User, signOut } from "firebase/auth";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import toast, { Toaster } from 'react-hot-toast';

export default function Navbar() {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(getAuth());
      toast.success('Sloggato con successo.');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            E-Storm
          </Typography>
          <Button color="inherit" href="/">Homepage</Button>
          {user ? (
            <>
              <Typography sx={{ marginLeft: 2 }}>{user.email ? user.displayName : ''}</Typography>
              <Button color="inherit" onClick={handleSignOut}>Esci</Button>
            </>
          ) : (
            <Button color="inherit" href="/login">Iscriviti</Button>
          )}
        </Toolbar>
        <Toaster />
      </AppBar>
    </Box>
  );
}
