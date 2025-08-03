import type { AnsweringStrategy } from "../answering-strategy";

// Make the global 'loadPyodide' function and our flag available to TypeScript
declare global {
  var pyodideScriptLoaded: boolean;
  const loadPyodide: (config?: { indexURL: string }) => Promise<any>;
}

export class PyodideStrategy implements AnsweringStrategy {
  private pyodide: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log("Pyodide strategy already initialized.");
      return;
    }

    console.log("Initializing Pyodide strategy...");

    // 1. Load the Pyodide script using modern dynamic import()
    if (!self.pyodideScriptLoaded) {
      // @ts-ignore: This dynamically loads the script into the worker's global scope
      await import("https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.js");
      self.pyodideScriptLoaded = true;
    }

    // 2. Initialize the Pyodide environment
    this.pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.28.0/full/",
    });

    console.log("Pyodide loaded. Installing packages...");
    await this.pyodide.loadPackage("micropip");
    const micropip = this.pyodide.pyimport("micropip");
    await micropip.install(["pandas", "scikit-learn"]);
    console.log("Python packages installed.");

    const [pythonCode, jsonData] = await Promise.all([
      fetch("/main.py").then((res) => res.text()),
      fetch("/dataset.json").then((res) => res.json()),
    ]);

    this.pyodide.runPython(pythonCode);

    const initializeModelPy = this.pyodide.globals.get("initialize_model");
    initializeModelPy(JSON.stringify(jsonData));
    initializeModelPy.destroy();

    this.isInitialized = true;
    console.log("Pyodide strategy is ready.");
  }

  async getAnswer(question: string): Promise<string> {
    if (!this.pyodide) {
      throw new Error("Pyodide strategy has not been initialized.");
    }

    const getAnswerPy = this.pyodide.globals.get("get_answer");
    const answer = getAnswerPy(question);
    getAnswerPy.destroy();

    return answer;
  }
}
