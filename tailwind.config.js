/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        darkRed: "#f55353",
        mainRed: "#FFADAD",
        mainCyan: "#88F2F1",
      },
      fontFamily: {
        main: ["KapsalonPrint"],
        regular: ["Gordita"],
      },
    },
  },
  plugins: [],
};
