import type { AnsweringStrategy } from "@/types/answering-strategy";

export class WebLLMStrategy implements AnsweringStrategy {
  private engine: any = null;
  private embeddings: any[] = [];
  private extractor: any = null; // Restored for high-quality RAG
  private isInitialized = false;
  private isLoading = false;

  // Model configuration - using Qwen2-1.5B for optimal RAG performance
  private readonly SELECTED_MODEL = "Qwen2-1.5B-Instruct-q4f32_1-MLC";

  async initialize(): Promise<void> {
    try {
      console.log("🚀 Initializing WebLLM Strategy with Qwen2-1.5B + Full RAG...");
      this.isLoading = true;

      // Clear any existing GPU resources first
      if (typeof window !== 'undefined' && (window as any).gc) {
        (window as any).gc();
      }

      // Import WebLLM dynamically (same pattern as your working code)
      const { CreateWebWorkerMLCEngine } = await import("https://esm.run/@mlc-ai/web-llm") as any;

      // Initialize embeddings extractor for premium semantic search
      console.log("🔍 Loading embeddings extractor for high-quality RAG...");
      const { pipeline } = await import("@xenova/transformers");
      this.extractor = await pipeline(
        "feature-extraction",
        "Xenova/paraphrase-multilingual-MiniLM-L12-v2",
      );

      // Load pre-computed embeddings for RAG
      console.log("📚 Loading knowledge base embeddings...");
      await this.loadEmbeddings();

      // Create WebLLM engine (adapted from your working code)
      console.log("🤖 Creating WebLLM engine...");
      
      // Create worker with proper path
      const worker = new Worker("/webllm-worker.js", { type: "module" });
      
      // Initialize engine with progress callback
      this.engine = await CreateWebWorkerMLCEngine(
        worker,
        this.SELECTED_MODEL,
        {
          initProgressCallback: (info: any) => {
            console.log("📊 WebLLM Progress:", info.text);
            
            // Use postMessage to communicate with main thread instead of document events
            if (typeof self !== 'undefined' && self.postMessage) {
              self.postMessage({
                status: "webllm-progress",
                progress: info.progress,
                text: info.text,
                phase: "loading"
              });
            }

            // Check if initialization is complete
            if (info.progress === 1) {
              this.isInitialized = true;
              this.isLoading = false;
              console.log("✅ WebLLM Strategy initialized successfully!");
              
              // Notify main thread that strategy is ready
              if (typeof self !== 'undefined' && self.postMessage) {
                self.postMessage({
                  status: "strategy-ready",
                  strategy: "qwen"
                });
              }
            }
          },
        }
      );

    } catch (error) {
      console.error("❌ Error initializing WebLLM strategy:", error);
      this.isLoading = false;
      
      // Use postMessage for error communication instead of document events
      if (typeof self !== 'undefined' && self.postMessage) {
        self.postMessage({
          status: "webllm-error",
          error: (error as any)?.message || "Unknown error",
          message: "Failed to initialize WebLLM. Your device may not support WebGPU.",
          fallbackStrategy: "transformers"
        });
      }
      
      throw error;
    }
  }

  async getAnswer(question: string): Promise<string> {
    if (!this.isInitialized || this.isLoading) {
      throw new Error("WebLLM strategy not ready. Please wait for initialization to complete.");
    }

    try {
      console.log("🔍 Processing question with WebLLM + RAG:", question);

      // Step 1: Get UPIICSA context using keyword matching (optimized)
      const relevantContext = await this.getRelevantContext(question);
      console.log("📚 Found context chunks:", relevantContext.length);

      // Step 2: Build chat messages with context
      const messages = this.buildChatMessages(question, relevantContext);

      // Step 3: Generate response with improved error handling
      const response = await this.generateStreamingResponse(messages);

      return response;
    } catch (error) {
      console.error("❌ Error in WebLLM getAnswer:", error);
      
      // Check if it's a model corruption issue (NaN errors)
      const errorMsg = (error as any)?.message || '';
      if (errorMsg.includes('nan') || errorMsg.includes('InternalError') || errorMsg.includes('FATAL')) {
        console.warn("🔧 Detected model corruption/NaN error");
        return "⚠️ El modelo WebLLM presenta errores técnicos. Recomendación: cambia a otra estrategia y regresa después para reinicializar el modelo.";
      }
      
      // Handle interruption gracefully
      if (errorMsg.toLowerCase().includes("interrupted")) {
        return "Generación interrumpida por el usuario.";
      }
      
      return "Lo siento, ocurrió un error al procesar tu pregunta con WebLLM. Por favor, intenta de nuevo o cambia a otra estrategia.";
    }
  }

  private async loadEmbeddings(): Promise<void> {
    try {
      const response = await fetch("/embeddings.json");
      if (!response.ok) {
        throw new Error(`Failed to load embeddings: ${response.status}`);
      }
      this.embeddings = await response.json();
      console.log(`📊 Loaded ${this.embeddings.length} embeddings for WebLLM`);
    } catch (error) {
      console.error("❌ Error loading embeddings:", error);
      throw error;
    }
  }

  private async getRelevantContext(question: string, topK: number = 3): Promise<string[]> {
    try {
      // Premium RAG with full semantic similarity search
      if (!this.extractor || this.embeddings.length === 0) {
        console.warn("⚠️ Embeddings not ready, falling back to keyword search");
        return await this.keywordFallbackSearch(question, topK);
      }

      console.log("🔍 Using premium semantic similarity search...");

      // Generate embedding for the user's question
      const questionEmbedding = await this.extractor(question, {
        pooling: "mean",
        normalize: true,
      });

      const questionVector = Array.from(questionEmbedding.data) as number[];

      // Calculate cosine similarity with all stored embeddings
      const similarities = this.embeddings.map((item, index) => ({
        index,
        question: item.question,
        answer: item.answer,
        similarity: this.cosineSimilarity(questionVector, item.embedding as number[]),
      }));

      // Sort by similarity and get top matches
      const topMatches = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      console.log(
        "🎯 WebLLM Premium RAG - Top matches:",
        topMatches.map((m) => ({
          similarity: m.similarity.toFixed(3),
          question: m.question?.substring(0, 50) + "...",
        }))
      );

      return topMatches
        .filter((match) => match.similarity > 0.3) // Quality threshold
        .map((match) => match.answer);

    } catch (error) {
      console.error("❌ Error in semantic search:", error);
      return await this.keywordFallbackSearch(question, topK);
    }
  }

  private async keywordFallbackSearch(question: string, topK: number = 3): Promise<string[]> {
    console.log("🔍 Using keyword fallback search...");
    
    const keywords = question.toLowerCase().split(' ').filter(word => word.length > 3);
    
    const relevantAnswers = this.embeddings.filter((item: any) => {
      const questionText = (item.question || '').toLowerCase();
      const answerText = (item.answer || '').toLowerCase();
      return keywords.some(keyword => 
        questionText.includes(keyword) || answerText.includes(keyword)
      );
    });

    const selected = relevantAnswers.slice(0, topK);
    console.log("📝 Keyword matches found:", selected.length);
    
    return selected.map((item: any) => item.answer);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * (b[i] || 0), 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private buildChatMessages(question: string, contexts: string[]): any[] {
    // Build context string for system message
    const contextText = contexts.length > 0 
      ? `INFORMACIÓN OFICIAL DE UPIICSA:\n\n${contexts.join("\n\n").substring(0, 1200)}\n\n`
      : "";

    // Create chat messages with STRICT anti-hallucination prompt
    const messages = [
      {
        role: "system",
        content: `Eres un asistente virtual de UPIICSA del IPN. 

${contextText}INSTRUCCIONES ESTRICTAS:
- Si tienes información oficial de UPIICSA arriba, úsala EXACTAMENTE como aparece
- NO inventes datos, fechas, horarios, o procedimientos 
- Si la información no está en el contexto oficial, di claramente "No tengo esa información específica"
- Sé preciso y directo
- NO agregues información de tu entrenamiento general sobre UPIICSA

Responde basándote ÚNICAMENTE en la información oficial proporcionada.`,
      },
      {
        role: "user",
        content: question,
      },
    ];

    return messages;
  }

  private async generateStreamingResponse(messages: any[]): Promise<string> {
    try {
      console.log("🔄 Starting WebLLM streaming generation...");
      
      // Qwen2-1.5B optimized parameters for premium RAG
      let fullResponse = "";
      const stream = await this.engine.chat.completions.create({
        messages,
        temperature: 0.15, // Low but not too restrictive for Qwen2
        max_tokens: 300,   // More tokens for comprehensive answers
        top_p: 0.8,        // Good balance for Qwen2
        stream: true,
      });

      console.log("📡 Processing stream chunks...");
      let chunkCount = 0;
      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) {
          fullResponse += content;
          chunkCount++;
          console.log("🧩 Stream chunk:", fullResponse);
          
          // Log progress every 10 chunks
          if (chunkCount % 10 === 0) {
            console.log(`📦 Processed ${chunkCount} chunks, length: ${fullResponse.length}`);
          }
        }
      }

      console.log("✅ WebLLM streaming completed, response length:", fullResponse.length);
      return fullResponse.trim() || "Lo siento, no pude generar una respuesta apropiada.";
      
    } catch (error) {
      console.error("❌ Error in streaming generation:", error);
      console.error("Error details:", (error as any)?.message || error);
      
      // Try fallback non-streaming generation
      return await this.generateFallbackResponse(messages);
    }
  }

  private async generateFallbackResponse(messages: any[]): Promise<string> {
    try {
      console.log("🔄 Trying non-streaming fallback...");
      
      const response = await this.engine.chat.completions.create({
        messages,
        temperature: 0.1, // Very conservative for fallback
        max_tokens: 200,  // Shorter for fallback
        stream: false,    // No streaming
      });

      const content = response.choices?.[0]?.message?.content;
      console.log("✅ Fallback response generated");
      return content || "Lo siento, hubo un problema técnico generando la respuesta.";
      
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError);
      return "Lo siento, el sistema está experimentando dificultades técnicas. Por favor intenta de nuevo o usa otra estrategia.";
    }
  }

  // Method to interrupt generation (from your working code)
  async interruptGeneration(): Promise<void> {
    try {
      if (this.engine) {
        await this.engine.interruptGenerate();
        console.log("⏹️ WebLLM generation interrupted");
      }
    } catch (error) {
      console.error("❌ Error interrupting generation:", error);
    }
  }

  async cleanup(): Promise<void> {
    console.log("🧹 Cleaning up WebLLM Strategy...");
    
    try {
      // Clean up engine and worker
      if (this.engine) {
        // Note: WebLLM engine cleanup might need specific methods
        this.engine = null;
      }
      
      // Clean up other resources
      this.extractor = null;
      this.embeddings = [];
      this.isInitialized = false;
      this.isLoading = false;
      
      console.log("✅ WebLLM cleanup completed");
    } catch (error) {
      console.error("❌ Error during WebLLM cleanup:", error);
    }
  }

  // Method to reinitialize the model in case of corruption
  async reinitialize(): Promise<void> {
    console.log("🔄 Reinitializing WebLLM due to errors...");
    await this.cleanup();
    await this.initialize();
  }

  getStrategyInfo(): {
    name: string;
    description: string;
    capabilities: string[];
  } {
    return {
      name: "Qwen2-1.5B + Premium RAG", 
      description: "Advanced AI model with high-quality semantic search (WebGPU required)",
      capabilities: [
        "Premium conversational responses",
        "Streaming real-time generation",
        "Context-aware answers",
        "UPIICSA-specific information",
        "Advanced natural language understanding",
        "Completely private processing",
      ],
    };
  }
}
