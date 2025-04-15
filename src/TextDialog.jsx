
import React, { useState } from 'react';

const TextDialog = ({ onSubmit, onClose }) => {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#ffffff');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(text, color);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0A1F3F] p-6 rounded-lg shadow-xl w-96 border-2 border-white">
        <h2 className="text-xl mb-4 text-white font-[Finger Paint] text-center">TYPE TEXT TO ADD</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-[#1A2F4F] text-white font-[Finger Paint]"
            placeholder="Enter your text"
          />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mb-4 w-full h-10 rounded cursor-pointer"
            style={{ appearance: 'none', padding: '0', border: 'none' }}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-600 text-white font-[Finger Paint] hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-white text-black font-[Finger Paint] hover:bg-gray-200 transition-colors border-2 border-white"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TextDialog;
