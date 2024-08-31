const Firm = require('../models/Firm');
const Vendor = require('../models/Vendor');
const multer = require('multer');
const Path = require('path');

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + Path.extname(file.originalname));
    }
});

// Initialize Multer with the configured storage
const upload = multer({ storage: storage });

// Controller function to add a firm
const addFirm = async (req, res) => {
    try {
        const { firmName, area, category, region, offer } = req.body;
        const file = req.file ? req.file.filename : undefined;

        // Find the vendor by ID
        const vendor = await Vendor.findById(req.vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        // Create a new firm instance
        const firm = new Firm({
            firmName,
            area,
            category,
            region,
            offer,
            image,
            vendor: vendor._id
        });

        // Save the firm to the database
        const savedFirm = await firm.save();

        // Associate the firm with the vendor
        vendor.firm.push(savedFirm);
        await vendor.save();

        // Respond with success message
        return res.status(200).json({ message: 'Firm added successfully' });
    } catch (error) {
        console.error('Error adding firm:', error); // Improved logging
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Controller function to delete a firm by its ID
const deleteFirmById = async (req, res) => {
    try {
        const firmId = req.params.firmId;

        // Find and delete the firm by its ID
        const deletedFirm = await Firm.findByIdAndDelete(firmId);

        if (!deletedFirm) {
            return res.status(404).json({ error: "Firm not found" });
        }

        return res.status(200).json({ message: 'Firm deleted successfully' });
    } catch (error) {
        console.error("Error deleting firm:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Export the functions, with `addFirm` using Multer's middleware to handle file uploads
module.exports = { addFirm: [upload.single('image'), addFirm], deleteFirmById };
