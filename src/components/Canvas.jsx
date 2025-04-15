
import React from 'react';

const Canvas = ({ canvasRef, selectedObject, handleDelete }) => {
  return (
    <div className="mx-auto mb-7 bg-transparent rounded-xl relative w-[400px]">
      <canvas ref={canvasRef} />
      {selectedObject && (
        <img
          onClick={handleDelete}
          id="selected-img"
          style={{
            position: "absolute",
            top: selectedObject.top - 30,
            left: selectedObject.left,
            cursor: "pointer",
          }}
          src="https://cdn-icons-png.flaticon.com/512/5610/5610967.png"
          width={20}
          height={20}
          alt=""
        />
      )}
    </div>
  );
};

export default Canvas;
