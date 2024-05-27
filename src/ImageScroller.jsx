import React, { useRef } from "react";

const ImageScroller = ({
  canvas,
  categorizedImages,
  handleAddImage,
  changeBackgroundImage,
  hats,
  kimonos,
  weapons,
  setHats,
  setKimonos,
  setWeapons,
}) => {
  const refs = useRef({});

  const scrollLeft = (category) => {
    if (refs.current[category]) {
      refs.current[category].scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = (category) => {
    if (refs.current[category]) {
      refs.current[category].scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full mt-10">
      {Object.keys(categorizedImages).map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl text-center text-white mb-4 capitalize">
            {category}
          </h2>
          <div className="relative flex items-center">
            <button
              className="absolute left-0 z-10 p-2 bg-gray-300 rounded-full hover:bg-gray-400"
              onClick={() => scrollLeft(category)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#000"
                  d="m6.523 12.5l3.735 3.735q.146.146.153.344q.006.198-.153.363q-.166.166-.357.168t-.357-.162l-4.382-4.383q-.243-.242-.243-.565t.243-.566l4.382-4.382q.147-.146.347-.153q.201-.007.367.159q.16.165.162.353q.003.189-.162.354L6.523 11.5h12.38q.214 0 .358.143t.143.357t-.143.357t-.357.143z"
                />
              </svg>
            </button>
            <div
              className="flex overflow-x-auto no-scrollbar scroll-smooth px-4" // Add padding to the container
              ref={(scrollRef) => (refs.current[category] = scrollRef)}
            >
              <div className="flex-shrink-0 w-10"></div>{" "}
              <div
                className="flex items-center justify-center border border-black rounded-md m-2 cursor-pointer transition-transform duration-0 ease-in-out transform hover:scale-125"
                onClick={() => {
                  if (canvas != null) {
                    if (category === "headwear") {
                      canvas.remove(hats);
                    } else if (category === "kimono") {
                      canvas.remove(kimonos);
                    } else if (category === "accessory") {
                      canvas.remove(weapons);
                    }
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[80px] h-[80px] p-5"
                  viewBox="0 0 256 256"
                >
                  <path
                    fill="#000"
                    d="M195.51 62.66L212.44 44a6 6 0 1 0-8.88-8l-16.93 18.58A94 94 0 0 0 60.49 193.34L43.56 212a6 6 0 0 0 8.88 8l16.93-18.62A94 94 0 0 0 195.51 62.66M46 128a81.93 81.93 0 0 1 132.53-64.51L68.59 184.43A81.69 81.69 0 0 1 46 128m82 82a81.57 81.57 0 0 1-50.53-17.49L187.41 71.57A81.94 81.94 0 0 1 128 210"
                  />
                </svg>
              </div>
              {categorizedImages[category].map((img, i) => (
                <img
                  src={img}
                  key={i}
                  onClick={() => {
                    if (category === "headwear") {
                      handleAddImage(hats, setHats, img);
                    } else if (category === "kimono") {
                      handleAddImage(kimonos, setKimonos, img);
                    } else if (category === "accessory") {
                      handleAddImage(weapons, setWeapons, img);
                    } else if (category === "background") {
                      changeBackgroundImage(img, canvas);
                    }
                  }}
                  className="w-[80px] h-[80px] border border-black rounded-md m-2 cursor-pointer transition-transform duration-0 ease-in-out transform hover:scale-125"
                  alt={`img-${i}`}
                />
              ))}
              <div className="flex-shrink-0 w-10"></div>{" "}
              {/* Spacer at the end */}
            </div>
            <button
              className="absolute right-0 z-10 p-2 bg-gray-300 rounded-full hover:bg-gray-400"
              onClick={() => scrollRight(category)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#000"
                  d="M17.073 12.5H5.5q-.213 0-.357-.143T5 12t.143-.357t.357-.143h11.573l-3.735-3.734q-.146-.147-.152-.345t.152-.363q.166-.166.357-.168t.357.162l4.383 4.383q.13.13.183.267t.053.298t-.053.298t-.183.268l-4.383 4.382q-.146.146-.347.153t-.367-.159q-.16-.165-.162-.354t.162-.354z"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageScroller;
