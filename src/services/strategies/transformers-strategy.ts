// src/services/strategies/transformers.strategy.ts
// import {
//   pipeline,
//   cos_sim,
// } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

import { pipeline, cos_sim } from "@xenova/transformers";
import type { AnsweringStrategy } from "../answering-strategy";

// You can move your knowledge base here or import it from another file
const knowledge_base = [
  {
    question: "What are the library hours?",
    answer:
      "The main library is open from 8:00 AM to 10:00 PM on weekdays, and 10:00 AM to 6:00 PM on weekends.",
  },
];

export class TransformersJsStrategy implements AnsweringStrategy {
  private extractor: any = null; // To hold the pipeline instance
  private corpus_embeddings: number[][] = [];

  async initialize(): Promise<void> {
    console.log("Initializing Transformers.js model...");
    const modelName = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
    this.extractor = await pipeline("feature-extraction", modelName);

    const corpus = knowledge_base.map((item) => item.question);
    const result = await this.extractor(corpus, {
      pooling: "mean",
      normalize: true,
    });

    const flat_embeddings = Array.from(result.data);
    const embeddingDim = result.dims[1];
    for (let i = 0; i < result.dims[0]; i++) {
      this.corpus_embeddings.push(
        flat_embeddings.slice(i * embeddingDim, (i + 1) * embeddingDim),
      );
    }
    console.log("Transformers.js model ready.");
  }

  async getAnswer(question: string): Promise<string> {
    if (!this.extractor) {
      throw new Error("Strategy not initialized. Call initialize() first.");
    }

    const question_embedding_result = await this.extractor(question, {
      pooling: "mean",
      normalize: true,
    });
    const question_embedding = Array.from(question_embedding_result.data);

    let best_match = { index: -1, score: -1 };
    for (let i = 0; i < this.corpus_embeddings.length; i++) {
      const score = cos_sim(question_embedding, this.corpus_embeddings[i]);
      if (score > best_match.score) {
        best_match = { index: i, score: score };
      }
    }

    if (best_match.score < 0.5) {
      return "I'm sorry, I don't have information about that.";
    }

    return knowledge_base[best_match.index].answer;
  }
}
