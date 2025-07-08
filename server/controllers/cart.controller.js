export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find(item => item.id === productId);

    if (existingItem) {
      existingItem.quatity += 1;
    } else {
      user.cartItems.push(productId)
    }
    await user.save()
    res.json(user.cartItems)
  } catch (error) {
    console.log("Error in addCart controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message })
  }
} 