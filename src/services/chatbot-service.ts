import type { AnsweringStrategy } from "./answering-strategy";
import { TransformersJsStrategy } from "./strategies/transformers-strategy";
import { PyodideStrategy } from "./strategies/pyodide-strategy";

// The map of available strategies now lives inside the service.
const strategyMap: Record<string, () => AnsweringStrategy> = {
  transformers: () => new TransformersJsStrategy(),
  pyodide: () => new PyodideStrategy(),
};

class ChatbotService {
  private strategy: AnsweringStrategy;
  private strategyCache = new Map<string, AnsweringStrategy>();

  constructor(initialStrategyKey: string) {
    if (!strategyMap[initialStrategyKey]) {
      throw new Error(`Strategy "${initialStrategyKey}" not found.`);
    }

    const initialStrategy = strategyMap[initialStrategyKey]();
    if (!initialStrategy) {
      throw new Error(`Initial strategy "${initialStrategyKey}" not found.`);
    }
    this.strategy = initialStrategy;
  }

  public async setStrategy(strategyKey: string): Promise<void> {
    if (this.strategyCache.has(strategyKey)) {
      console.log(`Switching to cached strategy: ${strategyKey}`);
      this.strategy = this.strategyCache.get(strategyKey)!;
      return;
    }

    // 2. If not, create and initialize the new strategy
    console.log(`Creating and initializing new strategy: ${strategyKey}`);
    const strategyFactory = strategyMap[strategyKey];
    if (strategyFactory) {
      const newStrategy = strategyFactory();
      await newStrategy.initialize();

      // 3. Save the initialized strategy to the cache and set it as active
      this.strategyCache.set(strategyKey, newStrategy);
      this.strategy = newStrategy;
    } else {
      console.error(`Strategy "${strategyKey}" not found.`);
    }
  }

  public async initialize(): Promise<void> {
    // Initialize the default strategy and add it to the cache
    await this.strategy.initialize();
    this.strategyCache.set("transformers", this.strategy);
  }

  public async findAnswer(question: string): Promise<string> {
    return this.strategy.getAnswer(question);
  }
}

export const chatbotService = new ChatbotService("transformers");
