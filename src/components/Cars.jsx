import { useEffect, useState } from "react";
import CarCard from "./CarCard";
import Pagination from "./Pagination";

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);


  const limit = 6;
  const skip = (page - 1) * limit;

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://dummyjson.com/products?limit=${limit}&skip=${skip}`
        );
        const data = await res.json();
  
        console.log("API DATA:", data);
  
        setCars(data.products || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCars();
  }, [page]);
  

  return (
    <div className="p-6">
  <h1 className="text-2xl font-bold mb-4">All Products</h1>

  {/* Loading */}
  {loading && (
    <p className="text-center text-gray-500">Loading products...</p>
  )}

  {/* No Products */}
  {!loading && cars.length === 0 && (
    <p className="text-center text-red-500">No Products found</p>
  )}

  {/* Products */}
  {!loading && cars.length > 0 && (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  )}

  {/* Pagination */}
  {!loading && total > limit && (
    <Pagination
      total={total}
      limit={limit}
      page={page}
      setPage={setPage}
    />
  )}
</div>

  );
}
