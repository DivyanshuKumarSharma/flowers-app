import React, { useState, useEffect } from 'react';
import {
  Container, TextField, List, ListItem, Typography, Card, CardContent, Avatar, Box, IconButton, CssBaseline, createTheme, ThemeProvider, Button
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function App() {
  const [strains, setStrains] = useState([]);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites')) || []);
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode')) ?? true);
  const [logs, setLogs] = useState(() => JSON.parse(localStorage.getItem('logs')) || {});
  const [tBreakLimit, setTBreakLimit] = useState(() => JSON.parse(localStorage.getItem('tBreakLimit')) || 300);

  useEffect(() => {
    fetch('/strains.json')
      .then((res) => res.json())
      .then((data) => setStrains(data));
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('tBreakLimit', JSON.stringify(tBreakLimit));
  }, [tBreakLimit]);

  const toggleFavorite = (name) => {
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleLogUpdate = (name, grams, times, note) => {
    setLogs((prev) => ({
      ...prev,
      [name]: {
        grams: grams === '' ? '' : Number(grams),
        times: times === '' ? '' : Number(times),
        note: note ?? '',
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const handleTBreakReset = () => {
    setTBreakLimit((prev) => prev + 300);
  };

  const filtered = strains.filter((strain) =>
    strain.name?.toLowerCase().includes(search.trim().toLowerCase())
  );

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const stats = strains.reduce(
    (acc, strain) => {
      const log = logs[strain.name];
      if (!log || isNaN(log.grams)) return acc;

      acc.total += log.grams;
      if (strain.type?.toLowerCase().includes('sativa')) acc.sativa += log.grams;
      else if (strain.type?.toLowerCase().includes('indica')) acc.indica += log.grams;
      else if (strain.type?.toLowerCase().includes('hybrid')) acc.hybrid += log.grams;
      return acc;
    },
    { total: 0, sativa: 0, indica: 0, hybrid: 0 }
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="lg"
        sx={{
          mt: 5,
          pb: 5,
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 4
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" gutterBottom>
              GANJEDI 
            </Typography>
            <IconButton onClick={() => setDarkMode((prev) => !prev)}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>

          <TextField
            fullWidth
            label="Search strain"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 4 }}
            variant="outlined"
          />

          <List sx={{ width: '100%' }}>
            {filtered.slice(0, 10).map((strain, index) => {
              const log = logs[strain.name] || { grams: '', times: '', note: '', updatedAt: null };
              return (
                <ListItem key={index} disablePadding>
                  <Card sx={{ width: '100%', mb: 3 }}>
                    <CardContent>
                      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ xs: 'center', sm: 'flex-start' }}>
                        <Avatar
                          variant="rounded"
                          src={strain.img_url}
                          alt={strain.name}
                          sx={{ width: 80, height: 80 }}
                        />
                        <Box flexGrow={1}>
                          <Typography variant="h6">{strain.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Type: {strain.type} | THC: {strain.thc_level} | Terpene: {strain.most_common_terpene}
                          </Typography>
                        </Box>
                        <IconButton onClick={() => toggleFavorite(strain.name)}>
                          {favorites.includes(strain.name) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                        </IconButton>
                      </Box>

                      <Typography sx={{ mt: 2 }}>{strain.description}</Typography>

                      {strain.effects && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2">Effects:</Typography>
                          <ul>
                            {Object.entries(strain.effects)
                              .slice(0, 5)
                              .map(([effect, value], idx) => (
                                <li key={idx}>{effect.replace(/_/g, ' ')} – {value}</li>
                              ))}
                          </ul>
                        </Box>
                      )}

                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1">Track Usage</Typography>
                        <TextField
                          fullWidth
                          label="Grams Smoked"
                          type="number"
                          value={log.grams}
                          onChange={(e) => handleLogUpdate(strain.name, e.target.value, log.times, log.note)}
                          sx={{ mt: 1 }}
                        />
                        <TextField
                          fullWidth
                          label="Times Used"
                          type="number"
                          value={log.times}
                          onChange={(e) => handleLogUpdate(strain.name, log.grams, e.target.value, log.note)}
                          sx={{ mt: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="Your Effects / Notes"
                          multiline
                          rows={2}
                          value={log.note}
                          onChange={(e) => handleLogUpdate(strain.name, log.grams, log.times, e.target.value)}
                          sx={{ mt: 2 }}
                        />
                        {log.updatedAt && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Last updated: {new Date(log.updatedAt).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </ListItem>
              );
            })}
          </List>

          {filtered.length === 0 && (
            <Typography variant="body2" sx={{ mt: 4 }} textAlign="center">
              No matching strains found.
            </Typography>
          )}
        </Box>

        <Box sx={{ minWidth: 280, backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f4f4f4', p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Usage Stats</Typography>
          <Typography variant="body1">Total Grams: {stats.total}g</Typography>
          <Typography variant="body2">- Sativa: {stats.sativa}g</Typography>
          <Typography variant="body2">- Indica: {stats.indica}g</Typography>
          <Typography variant="body2">- Hybrid: {stats.hybrid}g</Typography>

          {stats.total >= tBreakLimit && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'error.main', color: 'white', borderRadius: 1 }}>
              <Typography variant="subtitle2">⚠️ Time for a Tolerance Break!</Typography>
              <Typography variant="caption">You've smoked over {tBreakLimit}g. Consider taking a week off.</Typography>
              <Button variant="contained" color="secondary" size="small" sx={{ mt: 1 }} onClick={handleTBreakReset}>
                T-Break Done
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
