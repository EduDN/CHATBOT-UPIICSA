import type { AnsweringStrategy } from "./answering-strategy";
import { TransformersJsStrategy } from "./strategies/transformers-strategy";

class ChatbotService {
  private strategy: AnsweringStrategy;

  constructor(initialStrategy: AnsweringStrategy) {
    this.strategy = initialStrategy;
  }

  // Make this method async to await the initialization
  public async setStrategy(strategy: AnsweringStrategy): Promise<void> {
    this.strategy = strategy;
    console.log("Strategy changed to:", this.strategy.constructor.name);

    // Await the initialization of the new strategy
    await this.strategy.initialize();
  }

  public async initialize(): Promise<void> {
    await this.strategy.initialize();
  }

  public async findAnswer(question: string): Promise<string> {
    return this.strategy.getAnswer(question);
  }
}

export const chatbotService = new ChatbotService(new TransformersJsStrategy());
