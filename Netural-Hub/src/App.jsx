import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Patients from "./Patients";
import MedicalAI from "./MedicalAI";
import Therapy from "./Therapy";
import Upload from "./Upload";
import Layout from "./Layout";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="patients" element={<Patients />} />
          <Route path="medical-ai" element={<MedicalAI />} />
          <Route path="therapy" element={<Therapy />} />
          <Route path="upload" element={<Upload />} />
        </Route>
      </Routes>
    </Router>
  );
}
