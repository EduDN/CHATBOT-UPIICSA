import type { AnsweringStrategy } from "../answering-strategy";

// Make the global 'loadPyodide' function and our new flag available to TypeScript
declare global {
  interface Window {
    pyodideScriptLoaded: boolean;
  }
}
declare const loadPyodide: (config?: { indexURL: string }) => Promise<any>;

export class PyodideStrategy implements AnsweringStrategy {
  private pyodide: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    console.log("Initializing Pyodide strategy...");

    // If we've already set up this strategy, don't do it again.
    if (this.isInitialized) {
      console.log("Pyodide strategy already initialized.");
      return;
    }
    // 1. Dynamically load the main Pyodide script from the CDN
    await this.loadScript(
      "https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.js",
    );

    // 2. Initialize the Pyodide environment
    this.pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.28.0/full/",
    });

    console.log("Pyodide loaded. Installing packages...");

    // 3. Load micropip to install Python packages
    await this.pyodide.loadPackage("micropip");
    const micropip = this.pyodide.pyimport("micropip");

    // 4. Install the required libraries (pandas and scikit-learn)
    await micropip.install(["pandas", "scikit-learn"]);
    console.log("Python packages installed.");

    // 5. Load our Python script and dataset concurrently
    const [pythonCode, jsonData] = await Promise.all([
      fetch("/main.py").then((res) => res.text()),
      fetch("/dataset.json").then((res) => res.json()),
    ]);

    // 6. Run the Python script to define the functions
    this.pyodide.runPython(pythonCode);

    // 7. Call the initialization function in Python, passing it the dataset
    const initializeModelPy = this.pyodide.globals.get("initialize_model");
    initializeModelPy(JSON.stringify(jsonData));
    initializeModelPy.destroy(); // Free up memory

    // Mark this instance as initialized
    this.isInitialized = true;
    console.log("Pyodide strategy is ready.");
  }

  async getAnswer(question: string): Promise<string> {
    if (!this.pyodide) {
      throw new Error("Pyodide strategy has not been initialized.");
    }

    // Get a reference to the Python function
    const getAnswerPy = this.pyodide.globals.get("get_answer");

    // Call the Python function with the user's question
    const answer = getAnswerPy(question);

    // Free up the memory used by the function proxy
    getAnswerPy.destroy();

    return answer;
  }

  /**
   * Helper to dynamically load a script.
   */
  private loadScript(src: string): Promise<void> {
    // 1. Check our global flag first.
    if (window.pyodideScriptLoaded) {
      console.log("Pyodide script already loaded.");
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        // 2. Set the flag to true once the script loads successfully.
        window.pyodideScriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }
}
