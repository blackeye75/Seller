import Product from "../model/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({})
    res.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true });
    res.json({ products });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function createProduct(req, res) {

}
