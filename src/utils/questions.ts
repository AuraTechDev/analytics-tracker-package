export const questions = [
  {
    type: "input",
    name: "appName",
    message: "¿Cuál es el nombre de tu aplicación?",
    validate: (input: string) => {
      if (input.length < 1) {
        return "El nombre de la aplicación no puede estar vacío";
      }
      if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
        return "El nombre solo puede contener letras, números, guiones y guiones bajos";
      }
      return true;
    },
  },
];
