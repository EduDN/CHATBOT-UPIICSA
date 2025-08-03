import { chatbotService } from "@/services/chatbot-service";

// Listen for messages from the main application thread
self.onmessage = async (event) => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      // This is called once to initialize the default model
      case "initialize":
        await chatbotService.initialize();
        self.postMessage({ status: "ready" });
        break;

      // This is called when the user selects a new model from the dropdown
      case "setStrategy":
        await chatbotService.setStrategy(payload.strategyKey);
        self.postMessage({
          status: "strategy-ready",
          strategy: payload.strategyKey,
        });
        break;

      // This is called every time the user asks a question
      case "findAnswer":
        const answer = await chatbotService.findAnswer(payload.question);
        self.postMessage({ status: "answer", answer: answer });
        break;
    }
  } catch (error) {
    console.error(`Error in AI Worker (type: ${type}):`, error);
    self.postMessage({ status: "error", error: (error as Error).message });
  }
};
