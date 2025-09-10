/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          "colors-dark-100": "var(--colors-dark-100)",
          "colors-dark-1000": "var(--colors-dark-1000)",
          "colors-dark-250": "var(--colors-dark-250)",
          "colors-dark-50": "var(--colors-dark-50)",
          "colors-dark-500": "var(--colors-dark-500)",
          "colors-dark-750": "var(--colors-dark-750)",
          "colors-light-100": "var(--colors-light-100)",
          "colors-light-1000": "var(--colors-light-1000)",
          "colors-light-250": "var(--colors-light-250)",
          "colors-light-50": "var(--colors-light-50)",
          "colors-light-500": "var(--colors-light-500)",
          "colors-light-750": "var(--colors-light-750)",
          "colors-primary-100": "var(--colors-primary-100)",
          "colors-primary-1000": "var(--colors-primary-1000)",
          "colors-primary-500": "var(--colors-primary-500)",
          "colors-secondary-100": "var(--colors-secondary-100)",
          "colors-secondary-1000": "var(--colors-secondary-1000)",
          "colors-secondary-500": "var(--colors-secondary-500)",
        },
        fontFamily: {
          "body-small-reguler": "var(--body-small-reguler-font-family)",
          lg: "var(--lg-font-family)",
          md: "var(--md-font-family)",
          sm: "var(--sm-font-family)",
          xs: "var(--xs-font-family)",
        },
      },
    },
    plugins: [],
  };
  