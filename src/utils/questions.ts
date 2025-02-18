export const questions = [
  {
    type: "input",
    name: "appName",
    message: "What is the name of your application?",
    validate: (input: string): boolean | string => {
      if (input.length < 1) {
        return "The application name cannot be empty";
      }
      if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
        return "The name can only contain letters, numbers, hyphens, and underscores";
      }
      return true;
    },
  },
];
