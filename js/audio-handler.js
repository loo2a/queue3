/**
 * Audio Handler for Clinic Queue System (Updated)
 * Correct Arabic number pronunciation
 */

class AudioHandler {
  constructor(audioBasePath = './audio/') {
    this.audioBasePath = audioBasePath;
    this.speechRate = 1.0;
    this.audioQueue = [];
    this.isPlaying = false;
    this.useTTSFallback = true;
  }

  setSpeechRate(rate) {
    this.speechRate = Math.max(0.5, Math.min(2.0, rate));
  }

  setAudioPath(path) {
    this.audioBasePath = path.endsWith('/') ? path : path + '/';
  }

  /** 
   * Correct Arabic number ordering 
   * Examples:
   * 5 → [5.mp3]
   * 65 → [5.mp3, and.mp3, 60.mp3] 
   * 456 → [400.mp3, and.mp3, 6.mp3, and.mp3, 50.mp3]
   * 15 → [15.mp3] (special case)
   */
  numberToAudioFiles(number) {
    const files = [];
    let num = parseInt(number, 10);

    if (isNaN(num)) return files;
    if (num === 0) {
      files.push("0.mp3");
      return files;
    }

    // Hundreds
    const hundredsDigit = Math.floor(num / 100);
    if (hundredsDigit > 0) {
      files.push(`${hundredsDigit * 100}.mp3`);
      num = num % 100;
      if (num > 0) files.push("and.mp3");
    }

    // Special 11-19
    if (num >= 11 && num <= 19) {
      files.push(`${num}.mp3`);
      return files;
    }

    const tensDigit = Math.floor(num / 10);
    const onesDigit = num % 10;

    // Both tens & ones → ones + and + tens
    if (tensDigit > 0 && onesDigit > 0) {
      files.push(`${onesDigit}.mp3`);
      files.push("and.mp3");
      files.push(`${tensDigit * 10}.mp3`);
      return files;
    }

    if (tensDigit > 0) {
      files.push(`${tensDigit * 10}.mp3`);
      return files;
    }

    if (onesDigit > 0) {
      files.push(`${onesDigit}.mp3`);
      return files;
    }

    return files;
  }

  buildCallSequence(ticketNumber, clinicNumber) {
    const sequence = [];
    sequence.push('ding.mp3');
    sequence.push('prefix.mp3');
    const numberFiles = this.numberToAudioFiles(ticketNumber);
    sequence.push(...numberFiles);
    sequence.push(`clinic${clinicNumber}.mp3`);
    return sequence;
  }

  playAudioFile(filename) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(this.audioBasePath + filename);
      audio.playbackRate = this.speechRate;

      audio.onended = () => resolve();
      audio.onerror = (err) => reject(err);

      audio.play().catch(reject);
    });
  }

  async playSequence(files) {
    this.isPlaying = true;

    for (const file of files) {
      try {
        await this.playAudioFile(file);
        await new Promise(r => setTimeout(r, 100));
      } catch (err) {
        console.error(`Error playing ${file}:`, err);
        if (this.useTTSFallback) {
          await this.speakWithTTS(this.getTextFromFilename(file));
        }
      }
    }

    this.isPlaying = false;
  }

  getTextFromFilename(filename) {
    const numberMap = {
      '0': 'صفر', '1': 'واحد', '2': 'اثنان', '3': 'ثلاثة', '4': 'أربعة',
      '5': 'خمسة', '6': 'ستة', '7': 'سبعة', '8': 'ثمانية', '9': 'تسعة',
      '10': 'عشرة', '11': 'أحد عشر', '12': 'اثنا عشر', '13': 'ثلاثة عشر',
      '14': 'أربعة عشر', '15': 'خمسة عشر', '16': 'ستة عشر', '17': 'سبعة عشر',
      '18': 'ثمانية عشر', '19': 'تسعة عشر',
      '20': 'عشرون', '30': 'ثلاثون', '40': 'أربعون', '50': 'خمسون',
      '60': 'ستون', '70': 'سبعون', '80': 'ثمانون', '90': 'تسعون',
      '100': 'مائة', '200': 'مئتان', '300': 'ثلاثمائة', '400': 'أربعمائة',
      '500': 'خمسمائة', '600': 'ستمائة', '700': 'سبعمائة', '800': 'ثمانمائة', '900': 'تسعمائة'
    };

    const name = filename.replace('.mp3', '');

    if (name === 'ding') return '';
    if (name === 'prefix') return 'على العميل رقم';
    if (name === 'and') return 'و';
    if (name.startsWith('clinic')) return 'عيادة رقم ' + name.replace('clinic', '');

    return numberMap[name] || name;
  }

  speakWithTTS(text) {
    return new Promise((resolve) => {
      if (!text || text.trim() === '') return resolve();
      if (!('speechSynthesis' in window)) return resolve();

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ar-SA';
      utter.rate = this.speechRate;
      utter.onend = resolve;
      utter.onerror = resolve;
      speechSynthesis.speak(utter);
    });
  }

  async callTicket(ticketNumber, clinicNumber, clinicName) {
    if (this.isPlaying) return false;

    try {
      const seq = this.buildCallSequence(ticketNumber, clinicNumber);
      console.log(`🔊 Playing sequence for ${ticketNumber}:`, seq);
      await this.playSequence(seq);
      return true;
    } catch (err) {
      console.error('Error calling ticket:', err);
      if (this.useTTSFallback) {
        const txt = `على العميل رقم ${ticketNumber} ${clinicName}`;
        await this.speakWithTTS(txt);
        return true;
      }
      return false;
    }
  }

  async playInstant(filename) {
    try {
      const path = this.audioBasePath.replace('audio/', 'instant/') + filename;
      await this.playAudioFile(path);
      return true;
    } catch (err) {
      console.error('Error playing instant file:', err);
      return false;
    }
  }

  stop() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    this.isPlaying = false;
  }

  async testAudio() {
    console.log('🧪 Testing audio system...');
    try {
      console.log('Test 1: Number 5');
      await this.callTicket(5, 1, 'عيادة طب الأسرة');
      await new Promise(r => setTimeout(r, 1000));
      
      console.log('Test 2: Number 65');
      await this.callTicket(65, 1, 'عيادة طب الأسرة');
      await new Promise(r => setTimeout(r, 1000));
      
      console.log('Test 3: Number 456');
      await this.callTicket(456, 2, 'عيادة الأسنان');
      
      console.log('✅ Audio test completed');
      return true;
    } catch (err) {
      console.error('❌ Audio test failed:', err);
      return false;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioHandler;
}

window.AudioHandler = AudioHandler;
