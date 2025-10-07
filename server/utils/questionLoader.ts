import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const load = (p:string) => JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "data", p), "utf8"));

export const freeJson = load("ai_readiness_free_25.json");
export const fullJson = load("ai_readiness_full_90.json");

export const FREE_COUNT = Object.values(freeJson).flat().length;
export const FULL_COUNT = Object.values(fullJson).flat().length;

console.log(`[Question Loader] Loaded ${FREE_COUNT} free questions and ${FULL_COUNT} full questions`);
