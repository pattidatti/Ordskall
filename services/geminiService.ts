import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WordData } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API Key is missing. Ensure process.env.API_KEY is set.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

// Schema for the word data
const wordSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING, description: "Det norske ordet." },
    wordClass: { type: Type.STRING, description: "Ordklasse (f.eks. Substantiv, Verb)." },
    definition: { type: Type.STRING, description: "En tydelig definisjon av ordet." },
    etymology: { 
      type: Type.STRING, 
      description: "Detaljert beskrivelse av ordets opprinnelse. Bruk ' - ' (bindestrek) for punktlister ved opplisting av røtter/språk, og bruk avsnitt for å dele opp teksten." 
    },
    usageExample: { type: Type.STRING, description: "En setning som bruker ordet i kontekst." },
    inflections: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Liste over bøyninger (f.eks. entall, flertall, bestemt form)." 
    },
    funFact: { type: Type.STRING, description: "En kort, morsom funfact om ordet, hvis relevant." }
  },
  required: ["word", "wordClass", "definition", "etymology", "usageExample", "inflections"],
};

export const generateSpecificWord = async (searchWord: string): Promise<WordData> => {
  try {
    const prompt = `
      Gi meg detaljert informasjon om det norske ordet "${searchWord}".
      
      Kriterier:
      1. Definer ordet nøyaktig.
      2. Forklar etymologien grundig. Det er VIKTIG å bruke punktlister (start linjen med -) for å liste opp røtter, beslektede språk eller historiske stadier for å gjøre det lettlest. Bruk avsnitt for flyttekst.
      3. Hvis ordet har flere betydninger, velg den mest vanlige eller interessante.
      4. List opp bøyninger korrekt.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: wordSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    
    return JSON.parse(text) as WordData;
  } catch (error) {
    console.error("Error generating specific word:", error);
    throw error;
  }
};

export const generateRandomWord = async (): Promise<WordData> => {
  try {
    const prompt = `
      Generer et tilfeldig, interessant norsk ord.
      
      Kriterier:
      1. Det bør være et ord med en interessant etymologi eller historie.
      2. Det kan være et gammelt ord som fortsatt brukes, eller et poetisk ord.
      3. Unngå helt trivielle ord som "hei" eller "hus", med mindre de har en sjokkerende historie.
      4. Sørg for at etymologien er grundig forklart og strukturert. Bruk gjerne punktlister (start med -) for å gjøre teksten luftig og oversiktlig.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: wordSchema,
        temperature: 1.2, // High temperature for variety
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    
    return JSON.parse(text) as WordData;
  } catch (error) {
    console.error("Error generating word:", error);
    throw error;
  }
};

export const generateWordImage = async (word: string, definition: string, etymology: string): Promise<string | null> => {
  try {
    const prompt = `
      Lag en kunstnerisk, høykvalitets illustrasjon for det norske ordet "${word}".
      
      Betydning: ${definition}
      Etymologisk bakgrunn: ${etymology}
      
      Stil:
      - En blanding av klassisk bokillustrasjon og moderne minimalisme.
      - Farger: Dype, nordiske farger (blåtoner, skoggrønn, hvitt, varmt treverk).
      - Bildet skal visualisere ordets betydning ELLER dets historiske opprinnelse (etymologien).
      - Ingen tekst i selve bildet.
      - Aspekt: 4:3.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
      config: {
        // No responseMimeType for image generation models in this context usually
      }
    });

    // Extract image data
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64String = part.inlineData.data;
          return `data:image/png;base64,${base64String}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};