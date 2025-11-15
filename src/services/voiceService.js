// Voice Recognition Service using Web Speech API

class VoiceService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.currentLanguage = 'en-US';
        this.initRecognition();
    }

    // Initialize Speech Recognition
    initRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();

            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 1;
            this.recognition.lang = this.currentLanguage;
        } else {
            console.error('Speech Recognition not supported in this browser');
        }
    }

    // Check if browser supports speech recognition
    isSupported() {
        return this.recognition !== null;
    }

    // Set language for recognition
    setLanguage(language) {
        this.currentLanguage = language;
        if (this.recognition) {
            this.recognition.lang = language;
        }
    }

    // Start listening
    startListening(onResult, onError, onEnd) {
        if (!this.recognition) {
            onError && onError(new Error('Speech Recognition not supported'));
            return;
        }

        if (this.isListening) {
            console.log('Already listening...');
            return;
        }

        this.isListening = true;
        let finalTranscript = '';
        let interimTranscript = '';

        this.recognition.onstart = () => {
            console.log('Voice recognition started');
        };

        this.recognition.onresult = (event) => {
            interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Send interim results
            if (onResult) {
                onResult({
                    transcript: finalTranscript || interimTranscript,
                    isFinal: finalTranscript !== '',
                    interim: interimTranscript
                });
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;

            if (onError) {
                onError(event.error);
            }
        };

        this.recognition.onend = () => {
            console.log('Voice recognition ended');
            this.isListening = false;

            if (onEnd) {
                onEnd();
            }
        };

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.isListening = false;
            onError && onError(error);
        }
    }

    // Stop listening
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    // Abort listening
    abortListening() {
        if (this.recognition && this.isListening) {
            this.recognition.abort();
            this.isListening = false;
        }
    }

    // Get listening status
    getIsListening() {
        return this.isListening;
    }
}

// Create singleton instance
const voiceService = new VoiceService();

export default voiceService;