/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        darkRed: "#a79e95",
        mainRed: "#80715D",
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
