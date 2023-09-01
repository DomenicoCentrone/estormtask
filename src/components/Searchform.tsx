import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import toast, { Toaster } from 'react-hot-toast';

const db = getFirestore();

export default function Searchform() {
  const [user, setUser] = React.useState<User | null>(null);
  const [matchesData, setMatchesData] = React.useState<any[]>([]);
  const [number, setNumber] = React.useState('10');

  React.useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const inputElement = event.currentTarget.querySelector('#outlined-basic') as HTMLInputElement;
    const numberOfMatches = parseInt(number);

    if (numberOfMatches === 0 || numberOfMatches > 10) {
      toast.error("Il numero di partite deve essere compreso tra 1 e 10.")
      return;
    }
  
    if (!inputElement || !/^\d{7,10}$/.test(inputElement.value)) {
      toast.error("Per favore, inserisci un numero tra 7 e 10 cifre.")
      return;
    }

    if (user && user.displayName) {
      const userRef = doc(db, 'users', user.displayName);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const currentQueries = docSnap.data().numberOfQueries;
        await setDoc(userRef, {
          numberOfQueries: (currentQueries || 0) + 1,
        }, { merge: true });
      } else {
        await setDoc(userRef, {
          numberOfQueries: 1,
        });
      }

      toast.loading('Caricamento in corso...')
      fetch(`https://api.opendota.com/api/players/${inputElement.value}/matches`)
      .then(response => response.json())
      .then(data => {
        if (!data || data.length === 0 || data.error) { // controlla se la risposta � vuota, ha lunghezza zero o contiene un errore
          toast.error("Non valido");
          return;
        }
        const last50Matches = data.slice(0, 51);
        const matchesData = last50Matches;
        const matchesRef = doc(db, 'matches', inputElement.value);
        setDoc(matchesRef, { matchesData }, { merge: true });
        setMatchesData(matchesData.slice(0, parseInt(number)));
        toast.success('Caricamento completato');
      })
      .catch(error => {
        console.error('Errore:', error);
        toast.error("Non valido");
      });

    }
  };

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNumber(event.target.value);
  };

  return (
    <Grid container>
      <Grid xs={12}>
        <form onSubmit={handleSearch}>
          <TextField
            id="outlined-basic"
            label="Nome utente"
            variant="outlined"
          />
          <TextField
            id="number"
            label="Numero di partite"
            variant="outlined"
            value={number}
            onChange={handleNumberChange}
          />
          <IconButton aria-label="delete" type="submit">
            <SearchIcon/>
            <Toaster />
          </IconButton>
        </form>
      </Grid>
      {/* Renderizza le ultime partite */}
      {matchesData.map((match, index) => (
        <Grid xs={12} key={index} alignItems="left" justifyContent="left" textAlign="left">
          <h2>Partita {index + 1}</h2>
          <p>Assists: {match.assists}</p>
          <p>Morte: {match.deaths}</p>
          <p>Durata: {match.duration}</p>
          <p>Hero ID: {match.hero_id}</p>
          <p>Kills: {match.kills}</p>
        </Grid>
      ))}
    </Grid>
  );
}
