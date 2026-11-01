import * as cateRepo from "../repositories/categories.repository.js";

export const getAllCategories = async() => {
  return await cateRepo.findAll()
}