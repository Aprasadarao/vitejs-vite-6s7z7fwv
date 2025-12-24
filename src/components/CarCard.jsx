import { Link } from "react-router-dom";

export default function CarCard({ car }) {
  return (
    <div className="border rounded-lg shadow p-3">
      <img
        src={car.thumbnail}
        className="h-40 w-full object-cover rounded"
      />

      <h2 className="font-semibold mt-2">{car.title}</h2>
      <p className="text-sm text-gray-600">₹ {car.price}</p>

      <Link
        to={`/cars/${car.id}`}
        className="block mt-2 text-center bg-blue-600 text-white py-1 rounded"
      >
        View Details
      </Link>
    </div>
  );
}
