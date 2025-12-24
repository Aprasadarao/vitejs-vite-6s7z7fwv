import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`https://dummyjson.com/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Car not found");
        return res.json();
      })
      .then((data) => {
        setCar(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Car not found");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="p-6">Loading car details...</p>;

  if (error)
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
        <button onClick={() => navigate("/cars")} className="mt-3 underline">
          Back to Cars
        </button>
      </div>
    );

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="underline">
        ⬅ Back
      </button>

      {/* Image Gallery */}
      <div className="flex gap-3 mt-4 overflow-x-auto">
        {car.images?.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={car.title}
            className="w-40 h-32 object-cover rounded"
          />
        ))}
      </div>

      <h1 className="text-2xl font-bold mt-4">{car.title}</h1>
      <p className="text-lg mt-1">₹ {car.price}</p>
      <p className="mt-2 text-gray-700">{car.description}</p>

      <div className="flex gap-3 mt-4">
        <button className="bg-green-600 text-white px-4 py-1 rounded">
          Edit
        </button>
        <button className="bg-red-600 text-white px-4 py-1 rounded">
          Delete
        </button>
      </div>
    </div>
  );
}
