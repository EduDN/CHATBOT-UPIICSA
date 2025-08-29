export interface AnsweringStrategy {
  /**
   * Initializes any async resources needed for the strategy (e.g., loading models).
   */
  initialize(): Promise<void>;

  /**
   * Takes a user's question and returns a promise that resolves with the answer.
   * @param question The user's input text.
   */
  getAnswer(question: string): Promise<string>;
}
