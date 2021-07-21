import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Study from './pages/Study';
import Layout from './components/Layout';
import SignIn from './components/SignIn';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <PrivateRoute path="/" element={<Study />} />
        </Routes>
      </Layout>
    </BrowserRouter>

  );
}

export default App;
