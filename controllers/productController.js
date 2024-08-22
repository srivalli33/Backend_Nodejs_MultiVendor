const Path = require("path"); // Correctly imported the Path module
const Product = require("../models/Product");
const multer = require("multer");
const Firm = require("../models/Firm");

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Directory where files will be saved
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + Path.extname(file.originalname)); // Unique file name with original extension
    }
});

const upload = multer({ storage: storage });

// Add a new product associated with a firm
const addProduct = async (req, res) => {
    try {
        const { productName, price, category, bestseller, description } = req.body;
        const image = req.file ? req.file.filename : undefined;

        const firmId = req.params.firmId;
        const firm = await Firm.findById(firmId);

        if (!firm) {
            return res.status(404).json({ error: "No firm found" });
        }

        const product = new Product({
            productName,
            price,
            category,
            bestseller,
            description,
            image,
            firm: firm._id
        });

        const savedProduct = await product.save();

        // Ensure that firm.products is an array before pushing
        if (!Array.isArray(firm.products)) {
            firm.products = [];
        }

        firm.products.push(savedProduct._id); // Corrected 'firm.product' to 'firm.products'

        await firm.save();

        res.status(200).json(savedProduct);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get all products associated with a firm
const getProductByFirm = async (req, res) => {
    try {
        const firmId = req.params.firmId;
        const firm = await Firm.findById(firmId);

        if (!firm) {
            return res.status(404).json({ error: "No firm found" });
        }
        const firmName = firm.firmName; // Updated the variable name to 'firmName'
        const products = await Product.find({ firm: firmId });
        res.status(200).json({ firmName, products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Delete a product by its ID
const deleteProductById = async (req, res) => {
    try {
        const productId = req.params.productId;

        const deletedProduct = await Product.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ error: "No product found" });
        }

        res.status(200).json({ message: "Product successfully deleted" }); // Added a success response

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    addProduct: [upload.single('image'), addProduct],
    getProductByFirm,
    deleteProductById
};
