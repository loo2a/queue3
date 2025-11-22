#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audio File Generator for Clinic Queue System
Generates Arabic audio files for number pronunciation

Requirements:
pip install gtts

Usage:
python generate_audio.py
"""

from gtts import gTTS
import os

# Create audio directory if it doesn't exist
AUDIO_DIR = 'audio'
if not os.path.exists(AUDIO_DIR):
    os.makedirs(AUDIO_DIR)

print("🎵 مولد ملفات الصوت لنظام نداء المرضى")
print("=" * 50)

# Numbers dictionary
numbers = {
    # Units (0-9)
    0: 'صفر',
    1: 'واحد',
    2: 'اثنان',
    3: 'ثلاثة',
    4: 'أربعة',
    5: 'خمسة',
    6: 'ستة',
    7: 'سبعة',
    8: 'ثمانية',
    9: 'تسعة',
    
    # Special 10-19
    10: 'عشرة',
    11: 'أحد عشر',
    12: 'اثنا عشر',
    13: 'ثلاثة عشر',
    14: 'أربعة عشر',
    15: 'خمسة عشر',
    16: 'ستة عشر',
    17: 'سبعة عشر',
    18: 'ثمانية عشر',
    19: 'تسعة عشر',
    
    # Tens (20-90)
    20: 'عشرون',
    30: 'ثلاثون',
    40: 'أربعون',
    50: 'خمسون',
    60: 'ستون',
    70: 'سبعون',
    80: 'ثمانون',
    90: 'تسعون',
    
    # Hundreds (100-900)
    100: 'مائة',
    200: 'مئتان',
    300: 'ثلاثمائة',
    400: 'أربعمائة',
    500: 'خمسمائة',
    600: 'ستمائة',
    700: 'سبعمائة',
    800: 'ثمانمائة',
    900: 'تسعمائة'
}

# Special phrases
special_phrases = {
    'prefix': 'على العميل رقم',
    'and': 'و',
    'ding': ''  # This will be a notification sound
}

# Clinic names (customize as needed)
clinic_names = {
    1: 'عيادة طب الأسرة',
    2: 'عيادة الأسنان',
    3: 'عيادة الجلدية',
    4: 'عيادة العيون',
    5: 'عيادة الأنف والأذن والحنجرة',
    6: 'عيادة القلب',
    7: 'عيادة الباطنة',
    8: 'عيادة الجراحة',
    9: 'عيادة النساء والولادة',
    10: 'عيادة الأطفال'
}

def generate_audio_file(text, filename, lang='ar'):
    """Generate audio file using Google TTS"""
    try:
        filepath = os.path.join(AUDIO_DIR, filename)
        
        if text:  # Only generate if there's text
            tts = gTTS(text=text, lang=lang, slow=False)
            tts.save(filepath)
            print(f"✅ تم إنشاء: {filename}")
        else:
            print(f"⚠️  تخطي: {filename} (بدون نص)")
        
        return True
    except Exception as e:
        print(f"❌ خطأ في إنشاء {filename}: {str(e)}")
        return False

def generate_all_numbers():
    """Generate all number audio files"""
    print("\n📢 إنشاء ملفات الأرقام...")
    count = 0
    
    for number, text in numbers.items():
        filename = f"{number}.mp3"
        if generate_audio_file(text, filename):
            count += 1
    
    print(f"✨ تم إنشاء {count} ملف رقم")

def generate_special_phrases():
    """Generate special phrase audio files"""
    print("\n📢 إنشاء الملفات الخاصة...")
    count = 0
    
    for name, text in special_phrases.items():
        filename = f"{name}.mp3"
        if generate_audio_file(text, filename):
            count += 1
    
    print(f"✨ تم إنشاء {count} ملف خاص")

def generate_clinic_names():
    """Generate clinic name audio files"""
    print("\n📢 إنشاء ملفات أسماء العيادات...")
    count = 0
    
    for number, name in clinic_names.items():
        filename = f"clinic{number}.mp3"
        if generate_audio_file(name, filename):
            count += 1
    
    print(f"✨ تم إنشاء {count} ملف عيادة")

def generate_instant_audio():
    """Generate instant audio files"""
    print("\n📢 إنشاء الملفات الصوتية الجاهزة...")
    
    instant_dir = 'instant'
    if not os.path.exists(instant_dir):
        os.makedirs(instant_dir)
    
    instant_messages = {
        'announcement1.mp3': 'يرجى الالتزام بالدور',
        'announcement2.mp3': 'شكراً لزيارتكم مركزنا الطبي',
        'emergency.mp3': 'حالة طوارئ، يرجى الانتباه',
        'welcome.mp3': 'أهلاً وسهلاً بكم في مركزنا الطبي',
        'closing.mp3': 'سيتم إغلاق المركز خلال نصف ساعة',
        'prayer.mp3': 'حان وقت الصلاة، سيتم التوقف لمدة نصف ساعة',
    }
    
    count = 0
    for filename, text in instant_messages.items():
        filepath = os.path.join(instant_dir, filename)
        try:
            tts = gTTS(text=text, lang='ar', slow=False)
            tts.save(filepath)
            print(f"✅ تم إنشاء: {filename}")
            count += 1
        except Exception as e:
            print(f"❌ خطأ في إنشاء {filename}: {str(e)}")
    
    print(f"✨ تم إنشاء {count} ملف صوتي جاهز")

def create_ding_sound():
    """Create a notification ding sound"""
    print("\n📢 ملاحظة: ملف ding.mp3 يجب إنشاؤه يدوياً")
    print("يمكنك استخدام أي صوت تنبيه قصير (0.5-1 ثانية)")
    print("أو تحميله من مواقع الأصوات المجانية مثل:")
    print("- https://freesound.org")
    print("- https://mixkit.co/free-sound-effects/")

def test_audio(filename='prefix.mp3'):
    """Test playing an audio file"""
    try:
        import pygame
        pygame.mixer.init()
        filepath = os.path.join(AUDIO_DIR, filename)
        
        if os.path.exists(filepath):
            print(f"\n🔊 تشغيل اختبار: {filename}")
            pygame.mixer.music.load(filepath)
            pygame.mixer.music.play()
            
            # Wait for the audio to finish
            while pygame.mixer.music.get_busy():
                pygame.time.Clock().tick(10)
            
            print("✅ تم تشغيل الملف بنجاح")
        else:
            print(f"❌ الملف غير موجود: {filepath}")
    except ImportError:
        print("⚠️  pygame غير مثبت، لا يمكن تشغيل الملف")
        print("لتثبيته: pip install pygame")
    except Exception as e:
        print(f"❌ خطأ في التشغيل: {str(e)}")

def create_readme():
    """Create README for audio files"""
    readme_content = """# ملفات الصوت - Audio Files

## هيكل الملفات

### الأرقام (Numbers)
- **0.mp3 - 9.mp3**: الأحاد (0-9)
- **10.mp3 - 90.mp3**: العشرات (10, 20, 30, ... 90)
- **100.mp3 - 900.mp3**: المئات (100, 200, 300, ... 900)

### الملفات الخاصة (Special Files)
- **prefix.mp3**: "على العميل رقم"
- **and.mp3**: "و"
- **ding.mp3**: صوت التنبيه (يجب إضافته يدوياً)

### العيادات (Clinics)
- **clinic1.mp3 - clinic10.mp3**: أسماء العيادات

## مثال على التركيب

لنداء رقم 468 في عيادة طب الأسرة:
```
ding.mp3 → prefix.mp3 → 400.mp3 → and.mp3 → 60.mp3 → and.mp3 → 8.mp3 → clinic1.mp3
```

النتيجة: "صوت تنبيه + على العميل رقم + أربعمائة + و + ستون + و + ثمانية + عيادة طب الأسرة"

## تخصيص الملفات

يمكنك تعديل أسماء العيادات في ملف `generate_audio.py` ثم إعادة التشغيل.

## جودة الصوت

الملفات المولدة باستخدام Google TTS بجودة جيدة. لجودة أعلى:
- استخدم Microsoft Azure TTS
- استخدم Amazon Polly
- سجل بصوت احترافي
"""
    
    readme_path = os.path.join(AUDIO_DIR, 'README.md')
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(readme_content)
    
    print(f"\n📝 تم إنشاء ملف README في: {readme_path}")

def main():
    """Main function"""
    print("\n🚀 بدء عملية إنشاء الملفات الصوتية...\n")
    
    # Generate all audio files
    generate_all_numbers()
    generate_special_phrases()
    generate_clinic_names()
    generate_instant_audio()
    create_ding_sound()
    create_readme()
    
    print("\n" + "=" * 50)
    print("✅ تمت العملية بنجاح!")
    print(f"📁 تم حفظ الملفات في المجلدات:")
    print(f"   - {AUDIO_DIR}/")
    print(f"   - instant/")
    print("\n💡 نصيحة: تأكد من رفع الملفات إلى GitHub في المسارات الصحيحة")
    print("=" * 50)

if __name__ == '__main__':
    main()
