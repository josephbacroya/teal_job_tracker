"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { matchJobs } from "@/lib/actions/ai-match";
import { MatchResults } from "@/components/matchmaker/MatchResults";

export default function MatchmakerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setText(""); // clear text if file uploaded
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setText("");
    }
  };

  const handleSubmit = async () => {
    if (!file && !text.trim()) {
      setError("Please upload a resume or paste your resume text.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    if (file) {
      formData.append("resume", file);
    } else {
      formData.append("resumeText", text);
    }

    try {
      const response = await matchJobs(formData);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setResults(response.data);
      }
    } catch (err) {
      setError("Something went wrong processing your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Job Matchmaker
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Upload your resume and let our AI analyze your profile to recommend the perfect roles.
        </p>
      </div>

      {!results && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Upload Section */}
          <div className="bg-card border rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Upload Resume</h2>
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
                ${file ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf,.txt,.doc,.docx"
              />
              <Upload className={`h-10 w-10 mx-auto mb-4 ${file ? "text-primary" : "text-muted-foreground"}`} />
              <p className="font-medium text-foreground mb-1">
                {file ? file.name : "Click or drag file to upload"}
              </p>
              <p className="text-sm text-muted-foreground">
                PDF, TXT, DOCX up to 5MB
              </p>
            </div>
            {file && (
              <button 
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-sm text-destructive mt-4 hover:underline"
              >
                Remove file
              </button>
            )}
          </div>

          {/* Text Section */}
          <div className="bg-card border rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Or Paste Text</h2>
            <textarea
              disabled={!!file}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="w-full h-48 p-4 rounded-xl border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-3 border border-destructive/20"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      {!results && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading || (!file && !text.trim())}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing Profile...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Find Matches
              </>
            )}
          </button>
        </div>
      )}

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setResults(null)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Start Over
              </button>
            </div>
            <MatchResults data={results} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
