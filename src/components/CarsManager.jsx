import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
// Inside CarsManager.jsx (top-right button)
import { Link } from "react-router-dom";

// ...

<div className="flex justify-end mb-4">
  <Link
    to="add"   // ← relative → goes to /carsManager/add
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
  >
    Add New Car
  </Link>
</div>
const currentYear = new Date().getFullYear();

const carSchema = yup.object().shape({
  make: yup.string().required("Make is required").min(2, "Enter at least 2 characters"),
  model: yup.string().required("Model is required"),
  year: yup
    .number()
    .typeError("Year must be a number")
    .integer("Year must be an integer")
    .required("Year is required")
    .min(1900, "Year must be >= 1900")
    .max(currentYear, `Year cannot be > ${currentYear}`),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required")
    .positive("Price must be positive"),
});

export default function CarsManager() {
  const queryClient = useQueryClient();
  const [editingCar, setEditingCar] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const { data: cars = [], isLoading, isError } = useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const res = await axios.get(
        "https://private-anon-e83be4a1fd-carsapi1.apiary-mock.com/cars"
      );
      return res.data.slice(0, 500);
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newCar) => {
      await new Promise((r) => setTimeout(r, 400));
      return newCar;
    },
    onSuccess: (newCar) => {
      queryClient.setQueryData(["cars"], (old) => [newCar, ...old]);
      setShowAddForm(false);
      reset();
    },
  });

  const editMutation = useMutation({
    mutationFn: async (updatedCar) => {
      await new Promise((r) => setTimeout(r, 400));
      return updatedCar;
    },
    onSuccess: (updatedCar) => {
      queryClient.setQueryData(["cars"], (old) =>
        old.map((c) => (c.id === updatedCar.id ? updatedCar : c))
      );
      setEditingCar(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await new Promise((r) => setTimeout(r, 300));
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(["cars"], (old) => old.filter((c) => c.id !== id));
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(carSchema) });

  const {
    register: regEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({ resolver: yupResolver(carSchema) });

  const onAddSubmit = (data) => {
    const newId = Math.max(...cars.map((c) => c.id), 0) + 1;
    addMutation.mutate({ id: newId, ...data });
  };

  const startEdit = (car) => {
    setEditingCar(car);
    resetEdit(car);
  };

  const onEditSubmit = (data) => {
    editMutation.mutate({ ...editingCar, ...data });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this car?")) deleteMutation.mutate(id);
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentCars = cars.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(cars.length / itemsPerPage);

  if (isLoading) return <p className="p-6">Loading cars...</p>;
  if (isError) return <p className="p-6 text-red-500">Error loading cars!</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">🚗 Cars Manager</h1>

      {/* Add New Car Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setShowAddForm((s) => !s);
            reset();
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          {showAddForm ? "Close Form" : "Add New Car"}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit(onAddSubmit)}
          className="bg-white p-4 rounded mb-6 shadow transition-all"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <input {...register("make")} placeholder="Make" className="w-full p-2 border rounded" />
              {errors.make && <p className="text-red-500 text-sm mt-1">{errors.make.message}</p>}
            </div>
            <div>
              <input {...register("model")} placeholder="Model" className="w-full p-2 border rounded" />
              {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>}
            </div>
            <div>
              <input {...register("year")} placeholder="Year" className="w-full p-2 border rounded" />
              {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>}
            </div>
            <div>
              <input {...register("price")} placeholder="Price" className="w-full p-2 border rounded" />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
          </div>
          <div className="mt-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Add Car
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Make</th>
              <th className="p-2 border">Model</th>
              <th className="p-2 border">Year</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCars.map((car, idx) => (
              <tr key={car.id} className="hover:bg-gray-50 h-14 align-middle">
                <td className="p-2 border text-center">{indexOfFirst + idx + 1}</td>

                {/* Make */}
                <td className="p-2 border">
                  {editingCar?.id === car.id ? (
                    <input {...regEdit("make")} className="p-1 border rounded w-full h-9" />
                  ) : (
                    <span className="block h-9 leading-9">{car.make}</span>
                  )}
                </td>

                {/* Model */}
                <td className="p-2 border">
                  {editingCar?.id === car.id ? (
                    <input {...regEdit("model")} className="p-1 border rounded w-full h-9" />
                  ) : (
                    <span className="block h-9 leading-9">{car.model}</span>
                  )}
                </td>

                {/* Year */}
                <td className="p-2 border text-center">
                  {editingCar?.id === car.id ? (
                    <input {...regEdit("year")} className="p-1 border rounded w-full h-9 text-center" />
                  ) : (
                    <span className="block h-9 leading-9">{car.year}</span>
                  )}
                </td>

                {/* Price */}
                <td className="p-2 border text-right pr-3">
                  {editingCar?.id === car.id ? (
                    <input {...regEdit("price")} className="p-1 border rounded w-full h-9 text-right" />
                  ) : (
                    <span className="block h-9 leading-9">${car.price}</span>
                  )}
                </td>

                {/* Actions */}
                <td className="p-2 border text-center">
                  {editingCar?.id === car.id ? (
                    <form onSubmit={handleSubmitEdit(onEditSubmit)} className="inline-flex gap-2">
                      <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
                      <button type="button" onClick={() => setEditingCar(null)} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
                    </form>
                  ) : (
                    <div className="flex justify-center gap-2">
                      <button onClick={() => startEdit(car)} className="bg-blue-600 text-white px-3 py-1 rounded">Edit</button>
                      <button onClick={() => handleDelete(car.id)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
