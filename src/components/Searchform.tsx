import * as React from 'react';
import { useFormik } from 'formik';
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

  const formik = useFormik({
    initialValues: {
      username: '',
      numberOfMatches: '10',
    },
    onSubmit: async (values) => {
      const numberOfMatches = parseInt(values.numberOfMatches);
    
      if (numberOfMatches === 0 || numberOfMatches > 10) {
        toast.error("Il numero di partite deve essere compreso tra 1 e 10.")
        return;
      }
    
      if (!/^\d{7,10}$/.test(values.username)) {
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
    
        const matchesRef = doc(db, 'matches', values.username);
        const matchesDocSnap = await getDoc(matchesRef);
    
        if (matchesDocSnap.exists()) {
          const matchesData = matchesDocSnap.data().matchesData;
          setMatchesData(matchesData.slice(0, parseInt(values.numberOfMatches)));
          toast.success('Caricamento Firebase');
      } else {
          toast('Caricamento API...')
          fetch(`https://api.opendota.com/api/players/${values.username}/matches`)
              .then(response => response.json())
              .then(data => {
                  if (!data || data.length === 0 || data.error) {
                      toast.error("ID non valido");
                      return;
                  }
                  const last50Matches = data.slice(0, 51);
                  const matchesData = last50Matches;
                  // Controllo se i dati recuperati dalla chiamata API sono diversi da quelli già memorizzati nel Firestore
                  if (JSON.stringify(matchesData) !== JSON.stringify(matchesDocSnap.data()?.matchesData)) {
                      setDoc(matchesRef, { matchesData }, { merge: true });
                  }
                  setMatchesData(matchesData.slice(0, parseInt(values.numberOfMatches)));
                  toast.success('Caricamento API');
              })
              .catch(error => {
                  console.error('Errore:', error);
                  toast.error("Non valido");
              });
        }
      }
    },
  });

  React.useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <Grid container>
      <Grid xs={12}>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            id="username"
            name="username"
            label="Nome utente"
            variant="outlined"
            onChange={formik.handleChange}
            value={formik.values.username}
          />
          <TextField
            id="numberOfMatches"
            name="numberOfMatches"
            label="Numero di partite"
            variant="outlined"
            onChange={formik.handleChange}
            value={formik.values.numberOfMatches}
          />
          <IconButton aria-label="delete" type="submit">
            <SearchIcon />
            <Toaster />
          </IconButton>
        </form>
      </Grid>
      {/* Renderizza le ultime partite */}
      {matchesData.map((match, index) => (
        <Grid xs={12} key={index} alignItems="left" justifyContent="left" textAlign="left">
          <h2>Partita {index + 1}</h2>
          <p>🗡️ Kills: {match.kills}</p>
          <p>🙏 Assists: {match.assists}</p>
          <p>☠️ Morte: {match.deaths}</p>
          <p>⏰️ Durata: {match.duration}</p>
          <p>🆔 Hero ID: {match.hero_id}</p>
        </Grid>
      ))}
    </Grid>
  );
}

