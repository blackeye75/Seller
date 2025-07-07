import cloudinary from "../lib/cloudinary.js";
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
  try {
    const { name, description, price, image, category } = req.body;
    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
    }
    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
      category
    });

    res.status(201).json(product);
  } catch (error) {
    console.log("Error creating product controller:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);              //finding product
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.image) {                                                                  // deleting image from cloudinary
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`)
        console.log("delete image from cloudinary");
      } catch (error) {
        console.log("error deleting image from clouldinary", error.message);
      }
    }
    await Product.findByIdAndDelete(req.params.id);
    return res.json({ message: "product deleted successfully" })
  } catch (error) {
    console.log("Error in delete product controller");
    res.status(500).json({ message: "enternal server error", error: error.message })
  }
}

export const getRecommendedProducts = async (req, res) => {
  try {
    const product = await Product.aggregate([
      {
        $sample: { size: 3 }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1
        }
      }
    ]);
    res.json(product);
  } catch (error) {
    console.log("error in recommendation controller", error.message);
    res.status(500).json({ message: "server error", error: message });
  }
}

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    res.json(products)
  } catch (error) {
    console.log("Error in getProductsByCategory controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Products not found" })
    }
  } catch (error) {
    console.log("Error in toggleFeauturedProduct controller", error.message)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

async function updateFeaturedProductsCache() {
	try {
		// The lean() method  is used to return plain JavaScript objects instead of full Mongoose documents. This can significantly improve performance

		const featuredProducts = await Product.find({ isFeatured: true }).lean();
		await redis.set("featured_products", JSON.stringify(featuredProducts));
	} catch (error) {
		console.log("error in update cache function");
	}
}
