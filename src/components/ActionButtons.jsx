
import React from 'react';

const ActionButtons = ({ 
  onStickerUpload,
  onTextAdd,
  onCanvasClear,
  onRandomGenerate,
  onSaveImage,
  stickerInputRef 
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center mt-8">
      <button
        onClick={() => stickerInputRef.current.click()}
        className="border-2 content-font cursor-pointer border-white bg-transparent text-white px-4 py-2 rounded-lg text-base hover:bg-white hover:text-black transition-all duration-300"
      >
        UPLOAD STICKER
      </button>
      <button
        onClick={onTextAdd}
        className="border-2 content-font cursor-pointer border-white bg-transparent text-white px-4 py-2 rounded-lg text-base hover:bg-white hover:text-black transition-all duration-300"
      >
        ADD TEXT
      </button>
      <button
        onClick={onCanvasClear}
        className="border-2 content-font cursor-pointer border-white bg-transparent text-white px-4 py-2 rounded-lg text-base hover:bg-white hover:text-black transition-all duration-300"
      >
        RESET
      </button>
      <button
        onClick={onRandomGenerate}
        className="border-2 content-font cursor-pointer border-white bg-transparent text-white px-4 py-2 rounded-lg text-base hover:bg-white hover:text-black transition-all duration-300"
      >
        RANDOMIZER
      </button>
      <button
        onClick={onSaveImage}
        className="border-2 content-font cursor-pointer border-white bg-transparent text-white px-4 py-2 rounded-lg text-base hover:bg-white hover:text-black transition-all duration-300"
      >
        DOWNLOAD
      </button>
    </div>
  );
};

export default ActionButtons;
