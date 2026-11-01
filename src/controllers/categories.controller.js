import * as categoriesService from "../services/categories.service.js";

export const getCategories = async(req, res) => {
  const categories = await categoriesService.getAllCategories();

  res.status(200).json({data: categories})
}