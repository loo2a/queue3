/**
 * Audio Handler for Clinic Queue System
 * Handles number pronunciation and audio playback
 */

class AudioHandler {
  constructor(audioBasePath = './audio/') {
    this.audioBasePath = audioBasePath;
    this.speechRate = 1.0;
    this.audioQueue = [];
    this.isPlaying = false;
    this.useTTSFallback = true;
  }

  /**
   * Set speech rate
   */
  setSpeechRate(rate) {
    this.speechRate = Math.max(0.5, Math.min(2.0, rate));
  }

  /**
   * Set audio base path
   */
  setAudioPath(path) {
    this.audioBasePath = path.endsWith('/') ? path : path + '/';
  }

  /**
   * Convert number to audio file sequence
   * Example: 468 -> [400.mp3, and.mp3, 60.mp3, and.mp3, 8.mp3]
   */
  numberToAudioFiles(number) {
    const files = [];
    const num = parseInt(number);

    if (num === 0) {
      files.push('0.mp3');
      return files;
    }

    // Hundreds
    const hundreds = Math.floor(num / 100) * 100;
    if (hundreds > 0) {
      files.push(`${hundreds}.mp3`);
      if (num % 100 !== 0) {
        files.push('and.mp3');
      }
    }

    // Tens
    const remainder = num % 100;
    const tens = Math.floor(remainder / 10) * 10;
    if (tens > 0) {
      files.push(`${tens}.mp3`);
      if (remainder % 10 !== 0) {
        files.push('and.mp3');
      }
    }

    // Ones
    const ones = remainder % 10;
    if (ones > 0 && tens !== 0) {
      files.push(`${ones}.mp3`);
    } else if (ones > 0 && tens === 0 && hundreds > 0) {
      files.push(`${ones}.mp3`);
    } else if (num < 10) {
      files.push(`${num}.mp3`);
    }

    return files;
  }

  /**
   * Build complete call sequence
   */
  buildCallSequence(ticketNumber, clinicNumber) {
    const sequence = [];
    
    // Ding sound
    sequence.push('ding.mp3');
    
    // Prefix: "على العميل رقم"
    sequence.push('prefix.mp3');
    
    // Ticket number
    const numberFiles = this.numberToAudioFiles(ticketNumber);
    sequence.push(...numberFiles);
    
    // Clinic
    sequence.push(`clinic${clinicNumber}.mp3`);
    
    return sequence;
  }

  /**
   * Play single audio file
   */
  playAudioFile(filename) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(this.audioBasePath + filename);
      audio.playbackRate = this.speechRate;
      
      audio.onended = () => resolve();
      audio.onerror = (error) => reject(error);
      
      audio.play().catch(reject);
    });
  }

  /**
   * Play sequence of audio files
   */
  async playSequence(files) {
    this.isPlaying = true;
    
    for (const file of files) {
      try {
        await this.playAudioFile(file);
        // Small pause between files
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error playing ${file}:`, error);
        
        // Use TTS fallback if enabled
        if (this.useTTSFallback) {
          await this.speakWithTTS(this.getTextFromFilename(file));
        }
      }
    }
    
    this.isPlaying = false;
  }

  /**
   * Get text from filename for TTS fallback
   */
  getTextFromFilename(filename) {
    const numberMap = {
      '0': 'صفر', '1': 'واحد', '2': 'اثنان', '3': 'ثلاثة',
      '4': 'أربعة', '5': 'خمسة', '6': 'ستة', '7': 'سبعة',
      '8': 'ثمانية', '9': 'تسعة', '10': 'عشرة',
      '20': 'عشرون', '30': 'ثلاثون', '40': 'أربعون',
      '50': 'خمسون', '60': 'ستون', '70': 'سبعون',
      '80': 'ثمانون', '90': 'تسعون',
      '100': 'مائة', '200': 'مئتان', '300': 'ثلاثمائة',
      '400': 'أربعمائة', '500': 'خمسمائة', '600': 'ستمائة',
      '700': 'سبعمائة', '800': 'ثمانمائة', '900': 'تسعمائة'
    };

    const name = filename.replace('.mp3', '');
    
    if (name === 'ding') return '';
    if (name === 'prefix') return 'على العميل رقم';
    if (name === 'and') return 'و';
    if (name.startsWith('clinic')) return 'عيادة رقم ' + name.replace('clinic', '');
    
    return numberMap[name] || name;
  }

  /**
   * Text-to-Speech fallback
   */
  speakWithTTS(text) {
    return new Promise((resolve, reject) => {
      if (!text || text.trim() === '') {
        resolve();
        return;
      }

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = this.speechRate;
        
        utterance.onend = () => resolve();
        utterance.onerror = (error) => {
          console.error('TTS Error:', error);
          reject(error);
        };
        
        speechSynthesis.speak(utterance);
      } else {
        console.error('Speech Synthesis not supported');
        reject(new Error('Speech Synthesis not supported'));
      }
    });
  }

  /**
   * Call ticket number
   */
  async callTicket(ticketNumber, clinicNumber, clinicName) {
    if (this.isPlaying) {
      console.log('Already playing, please wait...');
      return false;
    }

    try {
      const sequence = this.buildCallSequence(ticketNumber, clinicNumber);
      console.log('Playing sequence:', sequence);
      await this.playSequence(sequence);
      return true;
    } catch (error) {
      console.error('Error calling ticket:', error);
      
      // Full TTS fallback
      if (this.useTTSFallback) {
        const fullText = `على العميل رقم ${ticketNumber} ${clinicName}`;
        await this.speakWithTTS(fullText);
        return true;
      }
      
      return false;
    }
  }

  /**
   * Play instant audio file
   */
  async playInstant(filename) {
    try {
      // Build full path
      const fullPath = this.audioBasePath.replace('audio/', 'instant/') + filename;
      await this.playAudioFile(fullPath);
      return true;
    } catch (error) {
      console.error('Error playing instant audio:', error);
      return false;
    }
  }

  /**
   * Stop current playback
   */
  stop() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    this.isPlaying = false;
  }

  /**
   * Test audio system
   */
  async testAudio() {
    console.log('Testing audio system...');
    
    try {
      // Test simple number
      console.log('Test 1: Number 5');
      await this.callTicket(5, 1, 'عيادة طب الأسرة');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test complex number
      console.log('Test 2: Number 468');
      await this.callTicket(468, 2, 'عيادة الأسنان');
      
      console.log('Audio test completed!');
      return true;
    } catch (error) {
      console.error('Audio test failed:', error);
      return false;
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioHandler;
}

// Make available globally
window.AudioHandler = AudioHandler;
