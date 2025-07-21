// src/services/chatbot.service.ts
import type { AnsweringStrategy } from "./answering-strategy";
import { TransformersJsStrategy } from "./strategies/transformers-strategy";

class ChatbotService {
  private strategy: AnsweringStrategy;

  constructor(initialStrategy: AnsweringStrategy) {
    this.strategy = initialStrategy;
  }

  public setStrategy(strategy: AnsweringStrategy) {
    this.strategy = strategy;
    // You might want to re-initialize when the strategy changes
    // this.strategy.initialize();
  }

  public async initialize(): Promise<void> {
    await this.strategy.initialize();
  }

  public async findAnswer(question: string): Promise<string> {
    return this.strategy.getAnswer(question);
  }
}

export const chatbotService = new ChatbotService(new TransformersJsStrategy());
