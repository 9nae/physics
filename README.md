# Physics Lab Educational Website

![Physics Lab Hero](assets/hero_bg.png)

Physics Lab เป็นเว็บไซต์สื่อการเรียนการสอนวิชาฟิสิกส์ระดับมัธยมศึกษาตอนปลาย ครอบคลุมเนื้อหาสำคัญ 6 บทเรียน ได้แก่ จลนศาสตร์ กฎกลศาสตร์ของนิวตัน งานและพลังงาน การเคลื่อนที่แบบวงกลม การแกว่งและคลื่น และอุณหพลศาสตร์ ออกแบบมาเพื่อให้ผู้ใช้งาน (นักเรียน) สามารถทำความเข้าใจเนื้อหาที่ซับซ้อนได้อย่างเห็นภาพผ่าน **Interactive Systems** และ **Mini-Simulations**

## Features (คุณสมบัติเด่น)
- 📚 **Comprehensive Content:** เนื้อหาทฤษฎีสรุปกระชับ พร้อมตัวอย่างการคำนวณที่เข้าใจง่าย
- 🎮 **Interactive Simulations:** สถานการณ์จำลองแบบ Interactive ให้นักเรียนปรับตั้งตัวแปรต่างๆ เช่น คันเร่งมวลน้ำหนัก ความถี่คลื่น ฯลฯ ลทำงานได้ทันทีบนเบราว์เซอร์
- 📝 **Dynamic Quizzes:** ระบบข้อสอบสุ่มแบบไดนามิกพร้อมเฉลยและบอกข้อที่ผิด พร้อมสรุปคะแนนอัตโนมัติ
- 📱 **Responsive & SEO Friendly:** รอบรับการแสดงผลทุกหน้าจอและออกแบบมาเพื่อการดึงข้อมูล Share (Open Graph) ไปยังโซเชียลได้อย่างสวยงาม

## Folder Structure
\`\`\`
physics-lab/
├── index.html       # ไฟล์หลักของเว็บไซต์
├── css/
│   └── style.css    # Stylesheet หลัก
├── js/
│   ├── main.js      # ระบบ Navigation และ Scroll Animation
│   ├── sim.js       # ระบบ Physics Simulation Engine (Canvas & Mini-Sims)
│   └── quiz.js      # ระบบสุ่มข้อสอบและการตรวจคำตอบ
├── assets/          # รูปภาพและไอคอนประกอบ
└── README.md        # Document นี้
\`\`\`

## Deployment Instructions

โปรเจคนี้คือ **Static Website** วางด้วยเทคโนโลยีพื้นฐานอย่าง HTML / CSS / Vanilla JavaScript ดังนั้นจึงสามารถนำไปโฮสต์ (Deploy) ได้ฟรีบนแพลตฟอร์มต่างๆ ทันทีโดยไม่ต้องตั้งค่า Server

### Option 1: Vercel (Recommended)
1. กดที่ไอคอน `+ New Project` ในหน้าแดชบอร์ด Vercel
2. Import repository โค้ดนี้
3. กด `Deploy` วินาทีเดียวเว็บไซต์จะออนไลน์ทันที

### Option 2: GitHub Pages
1. นำโค้ดทั้งหมด (โฟลเดอร์ css, js, assets และ index.html) อัปโหลดขึ้น Repository ใน GitHub
2. ไปที่หน้าแท็บ `Settings` > `Pages`
3. ในส่วน Source ให้เลือกเป็น branch `main` หรือ `master` ในที่จัดเก็บ (/) แล้วกด Save
4. GitHub จะใช้เวลา 1-2 นาที และคุณจะได้ URL สำหรับเข้าใช้งาน (Ex: `https://username.github.io/physics-lab`)

### กำลังดำเนินการติดตั้ง Locally (ทดสอบบนเครื่องส่วนตัว)
- ดาวน์โหลดหรือ Clone โฟลเดอร์มาไว้ในเครื่อง
- คลิกขวาที่ปลั๊กอิน "Live Server" ใน VS Code หรือดับเบิ้ลคลิกไฟล์ `index.html` เพื่อเปิดทดสอบบนเบราว์เซอร์ปกติได้เลย

---
*จัดทำโดย: นายชัยเลิศ ตุ้มคำ* รหัสนักศึกษา 604147004 สาขาฟิสิกส์ศึกษา มหาวิทยาลัยราชภัฏนครปฐม
