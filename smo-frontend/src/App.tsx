import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp"; 
import AskQuestion from "./pages/AskQuestion";
import QuestionDetail from "./pages/QuestionDetail"; // <-- Importă noua pagină

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/questions/new" element={<AskQuestion />} />
        <Route path="/questions/:id" element={<QuestionDetail />} /> {/* <-- Rută dinamică */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;