import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CheckIn from './pages/CheckIn';
import History from './pages/History';
import Chat from './pages/Chat';
import Resources from './pages/Resources';
import Counsellor from './pages/Counsellor';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="checkin" element={<CheckIn />} />
        <Route path="history" element={<History />} />
        <Route path="chat" element={<Chat />} />
        <Route path="resources" element={<Resources />} />
        <Route path="counsellor" element={<Counsellor />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
