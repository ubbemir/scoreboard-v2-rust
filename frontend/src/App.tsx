import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import ScoreboardWrapper from './Scoreboard/ScoreboardWrapper';
import View from './View/View';
import './index.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ScoreboardWrapper />} />
        <Route path="/view" element={<View />} />
      </Routes>
    </Router>
  )
}

export default App;
