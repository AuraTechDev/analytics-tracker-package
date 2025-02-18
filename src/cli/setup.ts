import inquirer from "inquirer";
import { MongoClient } from "mongodb";
import { generateApiKey } from "../utils/strings";
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
      throw new Error(`The application "${appName}" is already registered`);
    }

    // Registrar nueva app
    await apps.insertOne({
      appName,
      apiKey,
      createdAt: new Date(),
      active: true,
    });

    console.log("\n✅ Application successfully registered in the database");
  } catch (error) {
    console.error("❌ Error registering the application:", error);
    throw error;
  } finally {
    await client.close();
  }
}

export async function setupCLI(): Promise<void> {
  try {
    console.log("\n🔧 Track Analytics Setup\n");

    // Preguntar solo el nombre de la aplicación
    const answers = await inquirer.prompt([...questions]);

    // Generar API key
    const apiKey = generateApiKey();

    // Registrar en la base de datos
    await registerApp(answers.appName, apiKey);

    // Mostrar información de configuración
    console.log("\n📝 Your application information:");
    console.log("--------------------------------");
    console.log(`Name: ${answers.appName}`);
    console.log(`API Key: ${apiKey}`);

    console.log("\n📚 To start using tracking in your application:");
    console.log("\n```javascript");
    console.log("import { Tracker } from 'track-analytics';");
    console.log("const tracker = new Tracker({");
    console.log(`  apiKey: '${apiKey}',`);
    console.log(`  appName: '${answers.appName}'`);
    console.log("});");
    console.log("await tracker.initialize();");
    console.log("```\n");
  } catch (error) {
    console.error("\n❌ Error during setup:", error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupCLI().catch(console.error);
}

export default setupCLI;
