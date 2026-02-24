import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AnalysisResult {
  score: number; // 0-100
  status: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS';
  threats: string[];
  recommendations: string[];
  explanation: string;
}

export async function analyzeUrlWithAI(url: string): Promise<AnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following URL for security risks: ${url}. 
    
    In your analysis, specifically evaluate these heuristic signals and be strict with classifications:
    1. IP-based URLs: URLs using raw IP addresses (e.g., 192.168.1.1, 103.x.x.x) instead of domain names are extremely high risk for phishing and should be classified as MALICIOUS if they contain sensitive keywords like 'login' or 'verify'.
    2. Entropy: Is the domain name random-looking (high entropy)? High entropy (e.g., x7k2p9.com) often indicates malware.
    3. Homographs: Is it a typosquatted version of a brand (e.g., g00gle.com, paypa1.com, arnazon.com)?
    4. Punycode: Does it use 'xn--' (IDN) to deceive users with international characters?
    5. Redirects: Does it contain multiple 'http' strings (URL inside a URL), indicating an open redirect?
    6. Digit Density: Does the domain have more than 3 digits or a high digit-to-character ratio (>20%)?
    7. Keywords: Are sensitive words like 'login', 'verify', 'bank', 'secure' in the domain or path?
    8. Hyphens: Are there consecutive hyphens ('--') in the domain?
    
    Classification Rules:
    - MALICIOUS: Clear evidence of phishing, malware, or deceptive intent (e.g., IP-based login pages, typosquatting).
    - SUSPICIOUS: Unusual patterns that aren't definitively malicious but pose risk.
    - SAFE: Well-known, trusted domains with standard structures.

    Provide a safety score (0-100, where 100 is perfectly safe), a status classification, a list of potential threats found, recommendations for the user, and a brief explanation.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          status: { type: Type.STRING, enum: ["SAFE", "SUSPICIOUS", "MALICIOUS"] },
          threats: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          explanation: { type: Type.STRING }
        },
        required: ["score", "status", "threats", "recommendations", "explanation"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {
      score: 50,
      status: 'SUSPICIOUS',
      threats: ["Analysis failed to complete"],
      recommendations: ["Proceed with extreme caution", "Do not enter sensitive information"],
      explanation: "The automated analysis encountered an error while evaluating this link."
    };
  }
}
