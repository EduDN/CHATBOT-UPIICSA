import { pipeline, env } from "@xenova/transformers";
import fs from "fs";
import path from "path";

// This ensures the script can find the model files when run with Node.js
env.allowLocalModels = false;
env.useBrowserCache = false;

async function generateAndSaveEmbeddings() {
  console.log("Reading dataset...");
  const filePath = path.join(process.cwd(), "public/dataset.json");
  const fileContent = fs.readFileSync(filePath, "utf8");
  const knowledge_base = JSON.parse(fileContent);

  const modelName = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
  console.log(`Loading feature-extraction pipeline with model: ${modelName}`);
  const extractor = await pipeline("feature-extraction", modelName);

  const questions = knowledge_base.map((item) => item.question); // Use "question"

  console.log(`Generating embeddings for ${questions.length} questions...`);
  const result = await extractor(questions, {
    pooling: "mean",
    normalize: true,
  });

  // Combine the original answers with their new embeddings
  const output = knowledge_base.map((item, index) => ({
    answer: item.answer, // Use "answer"
    embedding: Array.from(
      result.data.slice(index * result.dims[1], (index + 1) * result.dims[1]),
    ),
  }));

  const outputPath = path.join(process.cwd(), "public/embeddings.json");
  console.log(`Saving pre-calculated embeddings to ${outputPath}...`);
  fs.writeFileSync(outputPath, JSON.stringify(output));

  console.log("Done! ✨");
}

generateAndSaveEmbeddings();
