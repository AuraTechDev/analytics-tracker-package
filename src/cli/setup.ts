import inquirer from "inquirer";
import { AppResponse } from "../types/api";
import { questions } from "../utils/questions";
import { initializeAnalytics } from "../service/api";
import { AxiosError } from "axios";

async function registerApp(appName: string): Promise<string> {
  try {
    const analyticsService = initializeAnalytics();

    const { data } = await analyticsService
      .getAxiosInstance()
      .post<AppResponse>("/apps/register", {
        name: appName,
      });

    console.log("\n✅ Aplicación registrada exitosamente en la base de datos");
    return data.id;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(
          "\n❌ Error del servidor:",
          error.response.data.message || "Error desconocido"
        );
        console.error("Status:", error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error(
          "\n❌ No se pudo conectar con el servidor. Verifica tu conexión a internet."
        );
      } else {
        // Something happened in setting up the request
        console.error("\n❌ Error al configurar la petición:", error.message);
      }
    } else {
      console.error("\n❌ Error inesperado:", error);
    }
    throw error;
  }
}

export async function setupCLI(): Promise<void> {
  try {
    console.log("\n🔧 Configuración de Track Analytics\n");
    const answers = await inquirer.prompt([...questions]);
    const apiKey = await registerApp(answers.appName);

    if (!apiKey) {
      throw new Error("No se pudo obtener el API Key");
    }

    // Mostrar información de configuración
    console.log("\n📝 Información de tu aplicación:");
    console.log("--------------------------------");
    console.log(`Nombre: ${answers.appName}`);
    console.log(`API Key: ${apiKey}`);

    console.log("\n📚 Para comenzar a usar el tracking en tu aplicación:");
    console.log("\n```javascript");
    console.log("import { Tracker } from 'track-analytics';");
    console.log("const tracker = new Tracker({");
    console.log(`  apiKey: '${apiKey}',`);
    console.log(`  appName: '${answers.appName}'`);
    console.log("});");
    console.log("await tracker.initialize();");
    console.log("```\n");
  } catch (error) {
    console.error("\n❌ Error durante la configuración");
    if (error instanceof Error) {
      console.error("Detalles:", error.message);
    }
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupCLI().catch(console.error);
}

export default setupCLI;
