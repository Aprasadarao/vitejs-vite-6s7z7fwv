import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "./PaginationNumbers";


export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const limit = 6;
  const skip = (page - 1) * limit;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);

        // jsonplaceholder lo total param direct ga ledu
        // so first all posts fetch chesi paginate chestham
        const res = await fetch(
          `https://jsonplaceholder.typicode.com/posts`
        );
        const data = await res.json();

        setTotal(data.length);
        setBlogs(data.slice(skip, skip + limit));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [page, skip]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Blogs</h1>

      {/* Loading */}
      {loading && (
        <p className="text-center text-gray-500">Loading blogs...</p>
      )}

      {/* No Blogs */}
      {!loading && blogs.length === 0 && (
        <p className="text-center text-red-500">No blogs found</p>
      )}

      {/* Blog Cards */}
      {!loading && blogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <h3 className="font-semibold text-lg mb-2">
                {blog.title}
              </h3>

              <p className="text-sm text-gray-600 mb-3">
                {blog.body.substring(0, 100)}...
              </p>

              <Link
                to={`/blog/${blog.id}`}
                className="text-green-600 hover:underline text-sm"
              >
                Read More →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination (SAME AS CARS) */}
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
