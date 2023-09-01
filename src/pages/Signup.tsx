import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = getAuth();
  const db = getFirestore();

  const handleSignUp = async () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (name.length === 0) {
      alert('Inserisci il tuo nome.');
      return;
    }
    if (!emailPattern.test(email)) {
      alert('Inserisci un indirizzo email valido.');
      return;
    }
    if (password.length < 6) {
      alert('La password deve essere lunga almeno 6 caratteri');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Utente registrato con successo:', user);

      // Aggiorna il profilo dell'utente
      await updateProfile(user, { displayName: name });
      console.log('Profilo aggiornato:', user);

      // Salvare il nome e l'email su Firestore
      const docRef = doc(db, "users", name);
      await setDoc(docRef, {
          name: name,
          email: email,
      });
      console.log("Document written with ID: ", docRef.id);

      window.location.href = '/';
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
    }
  }

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center" style={{ paddingTop: '1%' }}>
      <Grid>
        <TextField id="outlined-name" label="Nome" variant="outlined" value={name} onChange={e => setName(e.target.value)}/>
      </Grid>
      <Grid>
        <TextField id="outlined-email" label="Email" variant="outlined" type="email" value={email} onChange={e => setEmail(e.target.value)}/>
      </Grid>
      <Grid>
        <TextField id="outlined-password" label="Password" variant="outlined" type="password" value={password} onChange={e => setPassword(e.target.value)}/>
      </Grid>
      <Grid>
        <IconButton aria-label="signup" onClick={handleSignUp}>
          <SearchIcon />
        </IconButton>
      </Grid>
    </Grid>
  )
}

export default Signup;
