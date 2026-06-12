const { Op, Sequelize } = require("sequelize");
const { Product } = require("../../models");

const toProductJson = (product) => {
  const json = product.toJSON ? product.toJSON() : product;
  return { ...json, _id: json._id || json.id };
};

const getOrder = (sort) => {
  switch (sort) {
    case "price-asc":
      return [["price", "ASC"]];
    case "price-desc":
      return [["price", "DESC"]];
    case "bestselling":
    case "trending":
      return [["soldCount", "DESC"], ["rating", "DESC"]];
    case "rating":
      return [["rating", "DESC"], ["reviewCount", "DESC"]];
    case "discount":
      return [[Sequelize.literal("(compare_at_price - price) / NULLIF(compare_at_price, 0)"), "DESC"]];
    case "newest":
      return [["createdAt", "DESC"]];
    case "featured":
    default:
      return [["soldCount", "DESC"], ["rating", "DESC"], ["createdAt", "DESC"]];
  }
};

const getProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
    const offset = (page - 1) * limit;
    const where = {};
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const minRating = Number(req.query.minRating || 0);
    const quick = String(req.query.quick || "").trim();

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (category && category !== "all") where.category = category;
    if (minRating > 0) where.rating = { [Op.gte]: minRating };
    if (quick === "trending") where.soldCount = { [Op.gte]: 15 };
    if (quick === "topRated") where.rating = { [Op.gte]: Math.max(minRating, 4.5) };
    if (quick === "bigDeals") {
      where[Op.and] = [
        ...(where[Op.and] || []),
        Sequelize.literal("compare_at_price >= price * 1.15"),
      ];
    }

    const { count: totalItems, rows: items } = await Product.findAndCountAll({
      where,
      offset,
      limit,
      order: getOrder(req.query.sort),
    });
    const categoryRows = await Product.findAll({
      attributes: ["category"],
      group: ["category"],
      raw: true,
    });
    const categories = categoryRows
      .map((row) => String(row.category || "").trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    const totalPages = Math.ceil(totalItems / limit) || 1;

    res.json({
      items: items.map(toProductJson),
      page,
      limit,
      totalItems,
      totalPages,
      categories,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) res.json(toProductJson(product));
    else res.status(404).json({ message: "Product not found" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const created = await Product.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await product.update(req.body);
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await product.destroy();
    res.json({ message: "Product removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
