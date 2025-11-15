import { useState, useEffect } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import voiceService from "../services/voiceService";
import nlpService from "../services/nlpService";
import { SUPPORTED_LANGUAGES } from "../utils/constants";
import {
  getSelectedLanguage,
  saveSelectedLanguage,
} from "../utils/localStorage";

const VoiceInput = ({ onCommandReceived }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(
    getSelectedLanguage()
  );
  const [error, setError] = useState("");

  useEffect(() => {
    // Set language on mount
    voiceService.setLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    saveSelectedLanguage(newLang);
    voiceService.setLanguage(newLang);
  };

  const startListening = () => {
    if (!voiceService.isSupported()) {
      setError(
        "Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari."
      );
      return;
    }

    setError("");
    setTranscript("");
    setInterimTranscript("");

    voiceService.startListening(
      // onResult
      (result) => {
        if (result.isFinal) {
          setTranscript(result.transcript);
          setInterimTranscript("");

          // Process the command
          const parsedCommand = nlpService.parseCommand(result.transcript);
          onCommandReceived(parsedCommand);

          // Reset after processing
          setTimeout(() => {
            setTranscript("");
          }, 2000);
        } else {
          setInterimTranscript(result.interim);
        }
      },
      // onError
      (error) => {
        console.error("Voice error:", error);
        setError(`Error: ${error}`);
        setIsListening(false);
      },
      // onEnd
      () => {
        setIsListening(false);
      }
    );

    setIsListening(true);
  };

  const stopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-6 mb-6">
      {/* Language Selector */}
      <div className="mb-4">
        <label className="block text-white text-sm font-semibold mb-2">
          <Volume2 className="inline w-4 h-4 mr-2" />
          Select Language
        </label>
        <select
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className="w-full px-4 py-2 rounded-lg border-2 border-white border-opacity-30 bg-white bg-opacity-20 text-white focus:outline-none focus:border-opacity-50 transition-all"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="text-gray-800">
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Voice Button */}
      <div className="flex flex-col items-center justify-center">
        <div className="relative">
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full bg-red-400 opacity-75 animate-ping"></div>
              <div className="absolute inset-0 rounded-full bg-red-300 opacity-50 animate-pulse"></div>
            </>
          )}
          <button
            onClick={toggleListening}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 ${
              isListening
                ? "bg-gradient-to-br from-red-500 to-red-600 shadow-2xl shadow-red-500/50"
                : "bg-gradient-to-br from-primary-500 to-primary-600 shadow-2xl shadow-primary-500/50"
            }`}
            disabled={error && !isListening}
          >
            {isListening ? (
              <MicOff className="w-12 h-12 text-white animate-pulse" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </button>
        </div>

        {/* Status Text */}
        <p className="mt-4 text-white text-center font-semibold">
          {isListening ? "🎤 Listening..." : "Tap to speak"}
        </p>

        {/* Transcript Display */}
        {(transcript || interimTranscript) && (
          <div className="mt-4 w-full bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur">
            <p className="text-white text-center">
              {transcript && (
                <span className="font-semibold">{transcript}</span>
              )}
              {interimTranscript && (
                <span className="text-gray-200 italic">
                  {" "}
                  {interimTranscript}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 w-full bg-red-500 bg-opacity-80 rounded-lg p-4">
            <p className="text-white text-center text-sm">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 w-full bg-white bg-opacity-10 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2 text-center">
            Voice Commands:
          </h3>
          <ul className="text-white text-sm space-y-1">
            <li>• "Add milk" - Add item to list</li>
            <li>• "Add 2 bottles of water" - Add with quantity</li>
            <li>• "Remove bread" - Remove item</li>
            <li>• "Search for apples" - Search products</li>
            <li>• "Clear list" - Clear all items</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;
