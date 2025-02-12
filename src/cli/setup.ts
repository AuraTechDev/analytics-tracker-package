import inquirer from "inquirer";
import { MongoClient } from "mongodb";
import { generateApiKey } from "../utils/strings"
import { questions } from "../utils/questions";

async function registerApp(appName: string, apiKey: string): Promise<void> {
  // Usamos una variable de entorno para la URI de MongoDB o un valor por defecto
  const mongoUri = process.env.MONGO_URI as string;
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db("analytics");
    const apps = db.collection("applications");

    // Verificar si la app ya existe
    const existingApp = await apps.findOne({ appName });
    if (existingApp) {
      throw new Error(`La aplicación "${appName}" ya está registrada`);
    }

    // Registrar nueva app
    await apps.insertOne({
      appName,
      apiKey,
      createdAt: new Date(),
      active: true,
    });

    console.log("\n✅ Aplicación registrada exitosamente en la base de datos");
  } catch (error) {
    console.error("Error al registrar la aplicación:", error);
    throw error;
  } finally {
    await client.close();
  }
}

export async function setupCLI(): Promise<void> {
  try {
    console.log("\n🔧 Configuración de Track Analytics\n");

    // Preguntar solo el nombre de la aplicación
    const answers = await inquirer.prompt([
      ...questions
    ]);

    // Generar API key
    const apiKey = generateApiKey();

    // Registrar en la base de datos
    await registerApp(answers.appName, apiKey);

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
    console.error("\n❌ Error durante la configuración:", error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupCLI().catch(console.error);
}

export default setupCLI;
