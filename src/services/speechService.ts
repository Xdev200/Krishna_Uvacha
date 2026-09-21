import * as Speech from 'expo-speech';

class SpeechService {
  private isCurrentlySpeaking: boolean = false;
  private hindiVoice: string | undefined;
  private englishVoice: string | undefined;
  private isInitialized: boolean = false;
  private currentSessionId: number = 0;
  private interpretationTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.init();
  }

  async init() {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      
      // Look for Hindi voices
      const hiVoices = voices.filter(v => v.language.toLowerCase().startsWith('hi'));
      
      // Look for English voices with Indian accent (en-IN)
      const enIndVoices = voices.filter(v => v.language.toLowerCase().includes('en-in'));

      // Selection logic for English (Prioritize en-IN Female)
      const femaleKeywords = ['isha', 'heera', 'veena', 'sangeeta', 'vani', 'kaveri', 'lekha', 'female', 'woman', 'ahp'];
      const maleKeywords = ['rishi', 'male', 'man', 'ene'];

      let selectedEn = enIndVoices.find(v => 
        (femaleKeywords.some(k => v.name.toLowerCase().includes(k)) || v.identifier.includes('ahp')) &&
        v.quality === Speech.VoiceQuality.Enhanced
      );
      
      if (!selectedEn) {
        selectedEn = enIndVoices.find(v => 
          femaleKeywords.some(k => v.name.toLowerCase().includes(k)) || v.identifier.includes('ahp')
        );
      }

      // If no explicitly female voice found, pick the first en-IN voice that is NOT explicitly male
      if (!selectedEn) {
        selectedEn = enIndVoices.find(v => !maleKeywords.some(k => v.name.toLowerCase().includes(k)));
      }

      // Final fallback to any en-IN
      if (!selectedEn) selectedEn = enIndVoices[0];
      
      this.englishVoice = selectedEn?.identifier;
      if (selectedEn) {
        console.log('--------------------------------------------------');
        console.log(`TTS VOICE SELECTED: ${selectedEn.name}`);
        console.log(`ID: ${selectedEn.identifier}`);
        console.log('--------------------------------------------------');
      }

      // Selection logic for Hindi
      let selectedHi = hiVoices.find(v => v.quality === Speech.VoiceQuality.Enhanced);
      if (!selectedHi) selectedHi = hiVoices[0];
      
      this.hindiVoice = selectedHi?.identifier;
      if (selectedHi) console.log(`SpeechService: Selected Hindi Voice - ${selectedHi.name} (${selectedHi.identifier})`);
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('SpeechService: Failed to fetch voices', error);
    }
  }

  private sanitizeText(text: string): string {
    return text
      .replace(/।।\d+\.\d+।।/g, '') // Remove verse numbers like ।।1.1।।
      .replace(/\(टिप्पणी[^)]*\)/g, '') // Remove comments like (टिप्पणी प0 1.2)
      .replace(/।।/g, '') // Remove remaining dandas
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  async speak(text: string, language: 'en' | 'hi') {
    if (!this.isInitialized) await this.init();
    await this.stop();

    const cleanText = this.sanitizeText(text);
    const voice = language === 'hi' ? this.hindiVoice : this.englishVoice;

    const options: Speech.SpeechOptions = {
      language: language === 'hi' ? 'hi-IN' : 'en-IN',
      voice: voice,
      pitch: 1.0,
      rate: 1.0,
      volume: 1.0,
      onStart: () => { this.isCurrentlySpeaking = true; },
      onDone: () => { this.isCurrentlySpeaking = false; },
      onStopped: () => { this.isCurrentlySpeaking = false; },
      onError: () => { this.isCurrentlySpeaking = false; },
    };

    Speech.speak(cleanText, options);
  }

  async speakVerse(
    sanskrit: string,
    interpretation: string,
    language: 'en' | 'hi',
    onDone?: () => void,
    callbacks?: {
      onSanskritStart?: () => void;
      onInterpretationStart?: () => void;
    }
  ) {
    if (!this.isInitialized) await this.init();
    await this.stop();
    
    const sessionId = ++this.currentSessionId;
    const cleanSanskrit = this.sanitizeText(sanskrit);
    const cleanInterpretation = this.sanitizeText(interpretation);

    const shlokaOptions: Speech.SpeechOptions = {
      language: 'hi-IN',
      voice: this.hindiVoice,
      pitch: 1.0, 
      rate: 0.9, 
      volume: 1.0,
      onDone: () => {
        if (this.currentSessionId !== sessionId) return;
        this.interpretationTimeout = setTimeout(() => {
          if (this.currentSessionId !== sessionId) return;
          if (callbacks?.onInterpretationStart) callbacks.onInterpretationStart();
          Speech.speak(cleanInterpretation, {
            language: language === 'hi' ? 'hi-IN' : 'en-IN',
            voice: language === 'hi' ? this.hindiVoice : this.englishVoice,
            pitch: 1.05,
            rate: 1.0,
            volume: 1.0,
            onDone: () => {
              if (this.currentSessionId !== sessionId) return;
              this.isCurrentlySpeaking = false;
              if (onDone) onDone();
            },
            onError: () => {
              if (this.currentSessionId !== sessionId) return;
              this.isCurrentlySpeaking = false;
              if (onDone) onDone();
            },
            onStopped: () => {
              if (this.currentSessionId !== sessionId) return;
              this.isCurrentlySpeaking = false;
              if (onDone) onDone();
            },
          });
        }, 120);
      },
      onStart: () => {
        if (this.currentSessionId !== sessionId) return;
        this.isCurrentlySpeaking = true;
        if (callbacks?.onSanskritStart) callbacks.onSanskritStart();
      },
      onStopped: () => {
        if (this.currentSessionId === sessionId) {
          this.isCurrentlySpeaking = false;
        }
      },
      onError: () => {
        if (this.currentSessionId === sessionId) {
          this.isCurrentlySpeaking = false;
          if (onDone) onDone();
        }
      }
    };

    Speech.speak(cleanSanskrit, shlokaOptions);
  }

  async stop() {
    this.currentSessionId++;
    if (this.interpretationTimeout) {
      clearTimeout(this.interpretationTimeout);
      this.interpretationTimeout = null;
    }
    this.isCurrentlySpeaking = false;
    try {
      await Speech.stop();
    } catch {
      // ignore
    }
  }

  /**
   * Estimates the total audio duration in ms for Sanskrit + Interpretation
   */
  estimateVerseAudioDuration(sanskrit: string, interpretation: string, language: 'en' | 'hi'): number {
    const cleanSanskrit = this.sanitizeText(sanskrit);
    const cleanInterpretation = this.sanitizeText(interpretation);
    const sanskritMs = Math.max(4500, cleanSanskrit.length * 90);
    const pauseMs = 150;
    const interpRate = language === 'hi' ? 85 : 105;
    const interpMs = Math.max(6000, cleanInterpretation.length * interpRate + (language === 'en' ? 2500 : 800));
    return sanskritMs + pauseMs + interpMs;
  }

  isSpeaking() {
    return this.isCurrentlySpeaking;
  }
}

export const speechService = new SpeechService();
