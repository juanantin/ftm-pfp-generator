
import React, { useState } from "react";

function TextDialog({ onSubmit, onClose }) {
  const [text, setText] = useState("");
  const [textColor, setTextColor] = useState("#FFFFFF");
  
  const colors = [
    "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", 
    "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500",
    "#800080", "#008000", "#000080", "#FFC0CB"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(text, textColor);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-[#1EAEDB] p-5 rounded-xl border-4 border-white w-80 sm:w-96">
        <h3 className="text-white text-xl font-bold mb-4 text-center" style={{ fontFamily: "'Finger Paint', cursive" }}>ENTER TEXT TO ADD</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your text here..."
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-white font-medium mb-2">Choose Color:</label>
            <div className="grid grid-cols-6 gap-2">
              {colors.map((color) => (
                <div
                  key={color}
                  onClick={() => setTextColor(color)}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                    textColor === color ? "border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                ></div>
              ))}
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-8 h-8 cursor-pointer"
              />
            </div>
          </div>
          
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-white text-[#1EAEDB] px-4 py-2 rounded hover:bg-gray-100 transition-colors font-bold"
            >
              Add Text
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TextDialog;
