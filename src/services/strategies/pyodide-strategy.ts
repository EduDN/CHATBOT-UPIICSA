import type { AnsweringStrategy } from "../answering-strategy";

declare global {
  var pyodideScriptLoaded: boolean;
  const loadPyodide: (config?: { indexURL: string }) => Promise<any>;
}

export class PyodideStrategy implements AnsweringStrategy {
  private pyodide: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log("Initializing Pyodide strategy with pre-trained models...");

    if (!self.pyodideScriptLoaded) {
      // @ts-ignore
      await import("https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.js");
      self.pyodideScriptLoaded = true;
    }

    this.pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.28.0/full/",
    });

    console.log("Pyodide loaded. Installing packages...");
    await this.pyodide.loadPackage("micropip");
    const micropip = this.pyodide.pyimport("micropip");
    // Joblib is now needed to load the model files
    await micropip.install(["scikit-learn", "joblib"]);
    console.log("Python packages installed.");

    // Fetch the pre-trained models and the python script
    const [pythonCode, vectorizerBlob, modelBlob, answersJson] =
      await Promise.all([
        fetch("/main.py").then((res) => res.text()),
        fetch("/vectorizer.joblib").then((res) => res.arrayBuffer()),
        fetch("/model.joblib").then((res) => res.arrayBuffer()),
        fetch("/answers.json").then((res) => res.json()),
      ]);

    // Write the fetched files to Pyodide's virtual filesystem
    this.pyodide.FS.writeFile(
      "vectorizer.joblib",
      new Uint8Array(vectorizerBlob),
    );
    this.pyodide.FS.writeFile("model.joblib", new Uint8Array(modelBlob));
    this.pyodide.FS.writeFile("answers.json", JSON.stringify(answersJson));

    // Run the Python script to define the functions
    this.pyodide.runPython(pythonCode);

    // Call the initialization function in Python (which now loads from the virtual files)
    const initializeModelPy = this.pyodide.globals.get("initialize_model");
    initializeModelPy();
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
