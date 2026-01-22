import { Routes, Route } from "react-router-dom";
import SignIn from "./components/SignIn";
import Signup from "./components/Signup";
import Title from "./components/Title";
import AddCarForm from "./components/AddCarForm";
import CarsManager  from "./components/CarsManager";
import Navbar from "./components/Navbar";
import Cars from "./components/Cars";
import CarDetails from "./components/CarDetails";
import Contact from "./components/Contact";
import BlogList from "./components/BlogList";
import BlogDetails from "./components/BlogDetails";
import Gallery from "./components/Gallery";
import Dashboard from "./components/Dashboard";


function App() {
  return (
    <>
    <Navbar />
    <Routes>
    <Route path="/" element={<SignIn />} />
    <Route path="/signin" element={<SignIn />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/dashboard" element={<Dashboard />} />
    {/* <Route path="/title" element={<Title />} /> */}
    <Route path="/addcarform" element={<AddCarForm />} />
    <Route path="/carsmanager" element={<CarsManager />} />
    <Route path="/cars" element={<Cars />} />
    <Route path="/blog" element={<BlogList />} />
    <Route path="/blog/:id" element={<BlogDetails />} />
    <Route path="/cars/:id" element={<CarDetails />} />
    <Route path="/gallery" element={<Gallery />} />
    <Route path="/contact" element={<Contact />} />

  </Routes>
  </>
  );
}

export default App;
