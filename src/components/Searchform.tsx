import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { getFirestore, doc, setDoc, increment, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

export default function Searchform() {
  const [codice, setCodice] = React.useState('');
  
  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    alert('Numero inserito: ' + codice);
  
    const response = await fetch(`https://api.opendota.com/api/players/${codice}/matches`);
    const data = await response.json();
    console.log(data);

    // Incrementare il numero di query dell'utente
    const userId = auth.currentUser.uid;
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { numberOfQueries: increment(1) }, { merge: true });

    // Recupera i dati dell'utente aggiornati
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      console.log("User data:", docSnap.data());
    } else {
      console.log("No such document!");
    }
  };

  return (
    <Grid container>
      <form onSubmit={handleSearch}>
        <TextField
          id="outlined-basic"
          label="Nome utente"
          variant="outlined"
          value={codice}
          onChange={(event) => setCodice(event.target.value)}
        />
        <IconButton aria-label="delete" type="submit">
          <SearchIcon />
        </IconButton>
      </form>
    </Grid>
  );
}
