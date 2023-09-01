import React from 'react';
import { useFormik } from 'formik';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import toast, { Toaster } from 'react-hot-toast';

function Signup() {
  const auth = getAuth();
  const db = getFirestore();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    onSubmit: async (values) => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (values.name.length === 0) {
        alert('Inserisci il tuo nome.');
        return;
      }
      if (!emailPattern.test(values.email)) {
        alert('Inserisci un indirizzo email valido.');
        return;
      }
      if (values.password.length < 6) {
        alert('La password deve essere lunga almeno 6 caratteri');
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;
        console.log('Utente registrato con successo:', user);
        toast.success('Utente registrato con successo');

        // Aggiorna il profilo dell'utente
        await updateProfile(user, { displayName: values.name });
        console.log('Profilo aggiornato:', user);

        // Salvare il nome e l'email su Firestore
        const docRef = doc(db, "users", values.name);
        await setDoc(docRef, {
            name: values.name,
            email: values.email,
        });
        console.log("Document written with ID: ", docRef.id);

        window.location.href = '/';
      } catch (error) {
        console.error('Errore durante la registrazione:', error);
      }
    },
  });

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center" style={{ paddingTop: '1%' }}>
      <form onSubmit={formik.handleSubmit}>
        <Grid>
          <TextField id="outlined-name" label="Nome" variant="outlined" value={formik.values.name} onChange={formik.handleChange} name="name"/>
        </Grid>
        <Grid>
          <TextField id="outlined-email" label="Email" variant="outlined" type="email" value={formik.values.email} onChange={formik.handleChange} name="email"/>
        </Grid>
        <Grid>
          <TextField id="outlined-password" label="Password" variant="outlined" type="password" value={formik.values.password} onChange={formik.handleChange} name="password"/>
        </Grid>
        <Grid>
          <IconButton aria-label="signup" type="submit">
            <SendIcon />
          </IconButton>
        </Grid>
      </form>
      <Toaster />
    </Grid>
  )
}

export default Signup;
