export default function Pagination({ total, limit, page, setPage }) {
    const totalPages = Math.ceil(total / limit);
  
    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border"
        >
          Prev
        </button>
  
        <span>{page} / {totalPages}</span>
  
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border"
        >
          Next
        </button>
      </div>
    );
  }
  