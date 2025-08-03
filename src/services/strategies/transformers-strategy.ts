import { pipeline, cos_sim } from "@xenova/transformers";
import type { AnsweringStrategy } from "../answering-strategy";
import { env } from "@xenova/transformers";

export class TransformersJsStrategy implements AnsweringStrategy {
  private extractor: any = null; // To hold the pipeline instance
  private corpus_embeddings: number[][] = [];
  private knowledge_base: { question: string; answer: string }[] = [];
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Tell the library to NOT look for models locally.
    env.allowLocalModels = false;
    env.useBrowserCache = false;

    console.log("Initializing Transformers.js model...");
    const modelName = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
    this.extractor = await pipeline("feature-extraction", modelName);

    const dataset = await fetch("/dataset.json");
    this.knowledge_base = await dataset.json();

    const corpus = this.knowledge_base.map((item) => item.question);
    const result = await this.extractor(corpus, {
      pooling: "mean",
      normalize: true,
    });

    const flat_embeddings: number[] = Array.from(result.data);
    const embeddingDim = result.dims[1];
    for (let i = 0; i < result.dims[0]; i++) {
      this.corpus_embeddings.push(
        flat_embeddings.slice(i * embeddingDim, (i + 1) * embeddingDim),
      );
    }
    this.isInitialized = true;
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
    const question_embedding: number[] = Array.from(
      question_embedding_result.data,
    );

    let best_match = { index: -1, score: -1 };
    for (let i = 0; i < this.corpus_embeddings.length; i++) {
      const corpus_embeddings = this.corpus_embeddings[i];
      if (!corpus_embeddings) {
        continue;
      }
      const score = cos_sim(question_embedding, corpus_embeddings);
      if (score > best_match.score) {
        best_match = { index: i, score: score };
      }
    }

    if (best_match.score < 0.55) {
      return "Disculpa, No tengo información sobre eso.";
      // return "I'm sorry, I don't have information about that.";
    }

    const answer = this.knowledge_base[best_match?.index]?.answer;
    if (!answer) {
      return "Disculpa, No tengo información sobre eso.";
      // return "I'm sorry, I don't have an answer for that.";
    }

    return answer;
  }
}
