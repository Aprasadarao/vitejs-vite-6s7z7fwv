import { Routes, Route } from "react-router-dom";
import SignIn from "./components/SignIn";
import Title from "./components/Title";
import AddCarForm from "./components/AddCarForm";
import CarsManager  from "./components/CarsManager";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
    <Navbar />
    <Routes>
    <Route path="/" element={<SignIn />} />
    <Route path="/signin" element={<SignIn />} />
    {/* <Route path="/title" element={<Title />} /> */}
    <Route path="/addcarform" element={<AddCarForm />} />
    <Route path="/carsmanager" element={<CarsManager />} />
  </Routes>
  </>
  );
}

export default App;
