StegoShield 🛡️
StegoShield is an advanced Image Steganography tool that hides secret messages inside images. It is specifically designed with a focus on cybersecurity and data privacy.

🚀 Features
LSB Encoding: Uses the Least Significant Bit algorithm for high-quality encoding.

AES-256 Encryption: Option to encrypt the payload before hiding it.

Real-time Capacity Check: Calculates how large a message can be hidden based on the image size.

Fraud Detection Logic: Helps differentiate between AI-generated images and modified images.

🛠️ Tech Stack
Frontend: React.js, Tailwind CSS, Lucide Icons

Backend: Node.js, Express.js

Database: PostgreSQL (Neon.tech)

ORM: Drizzle ORM

Installation & Setup
Clone the repository:
git clone https://github.com/itsmedebug/StegoShield.git

Install dependencies:
npm install

Set up the .env file with DATABASE_URL.

Push the database schema:
npm run db:push

Start the development server:
npm run dev
