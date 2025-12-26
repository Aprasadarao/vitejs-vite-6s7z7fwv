import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://jsonplaceholder.typicode.com/posts/${id}`
        );
        const data = await res.json();
        setBlog(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) return <p className="p-6">Loading blog...</p>;
  if (!blog) return <p className="p-6">Blog not found</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to="/blog" className="text-green-600 hover:underline">
        ← Back to Blogs
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-4">{blog.title}</h1>
      <p className="text-gray-700">{blog.body}</p>
    </div>
  );
}
