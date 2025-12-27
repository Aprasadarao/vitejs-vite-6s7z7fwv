import { useEffect, useState } from "react";
import { Fancybox } from "@fancyapps/ui";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://picsum.photos/v2/list?page=1&limit=15")
      .then((res) => res.json())
      .then((data) => {
        setImages(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    Fancybox.bind("[data-fancybox='gallery']", {
      Thumbs: false,
      Toolbar: {
        display: ["zoom", "close"],
      },
    });

    return () => Fancybox.destroy();
  }, [images]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading gallery...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold mb-6 text-start">
        Image Gallery
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {images.map((img) => (
          <a
            key={img.id}
            href={img.download_url}
            data-fancybox="gallery"
            data-caption={img.author}
            className="group overflow-hidden rounded-xl shadow"
          >
            <img
              src={`https://picsum.photos/id/${img.id}/500/400`}
              alt={img.author}
              className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
