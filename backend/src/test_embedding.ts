import Groq from 'groq-sdk';
import { env } from './config/env';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

async function main() {
  try {
    console.log("Listing Groq models...");
    const models = await groq.models.list();
    console.log("Models:", models.data.map(m => m.id));
  } catch (error) {
    console.error("Listing Groq models failed:", error);
  }
}

main();
