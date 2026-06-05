const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/sweetcake', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Successfully connected to MongoDB Compass');
}).catch((err) => {
    console.error('❌ MongoDB connection error:', err);
});

// ==========================================
// Mongoose Schemas & Models
// ==========================================

// 1. Payment Schema
const paymentSchema = new mongoose.Schema({
    paymentId: { type: String, required: true },
    method: { type: String, default: 'Razorpay' },
    amount: { type: Number, required: true },
    status: { type: String, default: 'Success' },
    date: { type: Date, default: Date.now }
});
const Payment = mongoose.model('Payment', paymentSchema);

// 2. Order Schema
const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    flavor: { type: String, required: true },
    weight: { type: String, required: true },
    price: { type: Number, required: true },
    totalPaid: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Razorpay' },
    paymentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }, // Link to Payment
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Completed' }
});
const Order = mongoose.model('Order', orderSchema);

// 3. Review Schema
const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    rating: { type: Number, required: true },
    message: { type: String, required: true },
    date: { type: String, default: () => new Date().toLocaleDateString() }
});
const Review = mongoose.model('Review', reviewSchema);

// ==========================================
// API Routes
// ==========================================

// --- ORDERS ---
// Create a new order (and payment record)
app.post('/api/orders', async (req, res) => {
    try {
        const { orderId, firstName, lastName, email, phone, address, flavor, weight, price, totalPaid, paymentMethod, paymentId } = req.body;

        // 1. Create Payment Record
        const newPayment = new Payment({
            paymentId: paymentId || `SIMULATED_${Date.now()}`,
            method: paymentMethod || 'Razorpay',
            amount: totalPaid,
            status: 'Success'
        });
        const savedPayment = await newPayment.save();

        // 2. Create Order Record
        const newOrder = new Order({
            orderId: orderId || `#CC-${Math.floor(1000 + Math.random() * 9000)}`,
            firstName, lastName, email, phone, address, flavor, weight, price, totalPaid, paymentMethod,
            paymentRef: savedPayment._id // Link payment
        });
        const savedOrder = await newOrder.save();

        res.status(201).json({ success: true, order: savedOrder, payment: savedPayment });
    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all orders (for admin panel)
app.get('/api/orders', async (req, res) => {
    try {
        // Find all orders, populate payment data, sort by newest first
        const orders = await Order.find().populate('paymentRef').sort({ date: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// --- REVIEWS ---
// Create a new review
app.post('/api/reviews', async (req, res) => {
    try {
        const newReview = new Review(req.body);
        const savedReview = await newReview.save();
        res.status(201).json({ success: true, review: savedReview });
    } catch (error) {
        console.error("Error saving review:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ _id: -1 }); // Newest first
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
