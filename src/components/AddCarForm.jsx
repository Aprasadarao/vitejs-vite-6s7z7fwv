// src/components/Post.jsx
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export default function Post() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // Mutation function
  const createPost = async (newPost) => {
    const response = await axios.post(
      "https://jsonplaceholder.typicode.com/posts",
      newPost
    );
    return response.data;
  };

  // useMutation hook
  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      alert("✅ Post created successfully!");
      console.log("Response:", data);
    },
    onError: (error) => {
      alert("❌ Error creating post!");
      console.error(error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      title,
      body,
      userId: 1,
    });
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create New Post</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Enter Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <textarea
          placeholder="Enter Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Creating..." : "Create Post"}
        </button>
      </form>

      {mutation.isError && (
        <p className="text-red-500 mt-3">❌ Error creating post!</p>
      )}
      {mutation.isSuccess && (
        <pre className="bg-gray-100 p-3 mt-3 rounded">
          {JSON.stringify(mutation.data, null, 2)}
        </pre>
      )}
    </div>
  );
}
