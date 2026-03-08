/* eslint-disable @typescript-eslint/no-explicit-any */
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (event: any) => void;
  onend: (event: any) => void;
  onerror: (event: any) => void;
  onresult: (event: any) => void;
}

interface Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}
