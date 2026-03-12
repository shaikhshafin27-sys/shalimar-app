const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const admin = require('firebase-admin');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// --- FIREBASE ADMIN SETUP ---
// Yaad rahe: serviceAccountKey.json file folder mein honi chahiye
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://shalimar-3188d-default-rtdb.firebaseio.com"
});

const db = admin.database();

// --- ROUTES ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/driver', (req, res) => res.sendFile(path.join(__dirname, 'driver.html')));

// --- MULTIPLE ADMIN NOTIFICATION LOGIC ---
db.ref('orders').on('child_added', (snapshot) => {
    const order = snapshot.val();
    
    // Jab naya order 'Placed' ho
    if(order.status === 'Placed') {
        console.log("🚨 New Order Detected! Broadcasting to all admins...");
        
        // Sabhi Admin Tokens uthayein
        db.ref('adminTokens').once('value', (tokensSnap) => {
            if(!tokensSnap.exists()) {
                return console.log("⚠️ No admin tokens found in database!");
            }

            tokensSnap.forEach((childSnap) => {
                const adminToken = childSnap.val();
                
                const message = {
                    notification: {
                        title: '🚨 Naya Order! (Shalimar)',
                        body: `Amount: ₹${order.total} | User: ${order.email}`
                    },
                    token: adminToken
                };

                // Har admin ko alag-alag notification bhejna
                admin.messaging().send(message)
                    .then((response) => console.log('✅ Notification sent to an admin'))
                    .catch((error) => console.log('❌ Error sending to one admin:', error));
            });
        });
    }
});

// --- OTP EMAIL LOGIC ---
app.post('/send-otp', async (req, res) => {
    const { email, otp } = req.body;
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'shaikhshafin27@gmail.com',
            pass: 'ccmuqkdpneykozuv' // Aapka App Password
        }
    });

    const emailTemplate = `
    <div style="font-family: sans-serif; max-width: 400px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
        <div style="background: #009432; padding: 20px; text-align: center; color: white;">
            <h1>SHALIMAR</h1>
        </div>
        <div style="padding: 30px; text-align: center;">
            <h2>OTP: ${otp}</h2>
            <p>Verification ke liye is code ka istemal karein.</p>
        </div>
    </div>`;

    try {
        await transporter.sendMail({
            from: '"Shalimar" <shaikhshafin27@gmail.com>',
            to: email,
            subject: `Verification Code: ${otp}`,
            html: emailTemplate
        });
        res.json({ status: "success" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log("-----------------------------------------");
    console.log("🍃 SHALIMAR SYSTEM FULLY ACTIVE");
    console.log(`Main App: http://localhost:${PORT}`);
    console.log(`Admin: http://localhost:${PORT}/admin`);
    console.log(`Driver: http://localhost:${PORT}/driver`);
    console.log("-----------------------------------------");
});