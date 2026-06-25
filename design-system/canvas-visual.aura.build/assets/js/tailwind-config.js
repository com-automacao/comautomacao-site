/*
 * Configuração custom do Tailwind: utilidades de transform 3D
 * (rotate-x/y/z, perspective-* e transform-style-*).
 */
tailwind.config = {
  theme: { extend: {} },
  plugins: [
    function ({ addUtilities }) {
      const rotateXUtilities = {};
      const rotateYUtilities = {};
      const rotateZUtilities = {};
      const rotateValues = [0, 5, 10, 15, 20, 30, 45, 75];
      const transformValue = `
        translate3d(var(--tw-translate-x, 0), var(--tw-translate-y, 0), var(--tw-translate-z, 0))
        rotateX(var(--tw-rotate-x, 0))
        rotateY(var(--tw-rotate-y, 0))
        rotateZ(var(--tw-rotate-z, 0))
        skewX(var(--tw-skew-x, 0))
        skewY(var(--tw-skew-y, 0))
        scaleX(var(--tw-scale-x, 1))
        scaleY(var(--tw-scale-y, 1))
      `.replace(/\s+/g, ' ').trim();

      rotateValues.forEach((value) => {
        rotateXUtilities[`.rotate-x-${value}`] = { '--tw-rotate-x': `${value}deg`, transform: transformValue };
        if (value !== 0) {
          rotateXUtilities[`.-rotate-x-${value}`] = { '--tw-rotate-x': `-${value}deg`, transform: transformValue };
        }
        rotateYUtilities[`.rotate-y-${value}`] = { '--tw-rotate-y': `${value}deg`, transform: transformValue };
        if (value !== 0) {
          rotateYUtilities[`.-rotate-y-${value}`] = { '--tw-rotate-y': `-${value}deg`, transform: transformValue };
        }
        rotateZUtilities[`.rotate-z-${value}`] = { '--tw-rotate-z': `${value}deg`, transform: transformValue };
        if (value !== 0) {
          rotateZUtilities[`.-rotate-z-${value}`] = { '--tw-rotate-z': `-${value}deg`, transform: transformValue };
        }
      });

      const perspectiveUtilities = {
        ".perspective-none": { perspective: "none" },
        ".perspective-dramatic": { perspective: "100px" },
        ".perspective-near": { perspective: "300px" },
        ".perspective-normal": { perspective: "500px" },
        ".perspective-midrange": { perspective: "800px" },
        ".perspective-distant": { perspective: "1200px" },
      };
      const transformStyleUtilities = {
        ".transform-style-preserve-3d": { "transform-style": "preserve-3d" },
        ".transform-style-flat": { "transform-style": "flat" },
      };

      addUtilities({
        ...rotateXUtilities,
        ...rotateYUtilities,
        ...rotateZUtilities,
        ...perspectiveUtilities,
        ...transformStyleUtilities,
      });
    }
  ]
};
