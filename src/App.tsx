import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadProfilePicture from "./pages/UploadProfilePicture"; // Import the new page
import Layout from "./components/Layout";
import VideoScreen from "./pages/VideoScreen";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:key" element={<VideoScreen />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/upload-profile-picture" element={<UploadProfilePicture />} /> 
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
