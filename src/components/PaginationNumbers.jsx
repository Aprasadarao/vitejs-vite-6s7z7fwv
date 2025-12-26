export default function Pagination({ total, limit, page, setPage }) {
    const totalPages = Math.ceil(total / limit);
  
    if (totalPages <= 1) return null;
  
    const getPages = () => {
      const pages = [];
      const maxVisible = 5; // how many numbers to show
  
      let start = Math.max(1, page - Math.floor(maxVisible / 2));
      let end = start + maxVisible - 1;
  
      if (end > totalPages) {
        end = totalPages;
        start = Math.max(1, end - maxVisible + 1);
      }
  
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
  
      return pages;
    };
  
    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        {/* Prev */}
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
  
        {/* Page Numbers */}
        {getPages().map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 border rounded
              ${p === page
                ? "bg-green-600 text-white border-green-600"
                : "hover:bg-gray-100"}`}
          >
            {p}
          </button>
        ))}
  
        {/* Next */}
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  }
  