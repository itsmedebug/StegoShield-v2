# StegoShield 🛡️ | FraudLock Hackathon Project

**StegoShield** ek advanced Image Steganography tool hai jo secret messages ko images ke andar hide karta hai. Ise specifically cybersecurity aur data privacy ko dhyan mein rakh kar banaya gaya hai.



## 🚀 Features
- **LSB Encoding**: Least Significant Bit algorithm ka use karke high-quality encoding.
- **AES-256 Encryption**: Payload ko hide karne se pehle encrypt karne ka option.
- **Real-time Capacity Check**: Image size ke hisab se bata deta hai ki kitna bada message hide ho sakta hai.
- **Fraud Detection Logic**: AI-generated images aur modified images ke beech farq samajhne mein madad karta hai.

## 🛠️ Tech Stack
- **Frontend**: React.js, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Neon.tech)
- **ORM**: Drizzle ORM
npm run dev
Installation & Setup
1. Clone the repo: `git clone https://github.com/yourusername/StegoShield.git`
2. Install dependencies: `npm install`
3. Set up `.env` file with `DATABASE_URL`.
4. Push database schema: `npm run db:push`
5. Start dev server: `npm run dev`