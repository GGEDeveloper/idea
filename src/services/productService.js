/**
 * @file Product service for fetching product data from the API.
 */

/**
 * Fetches a single product by its EAN from the backend API.
 * This function calls the GET /api/products/:ean endpoint, which returns a rich
 * object containing the product's details, images, attributes, and prices.
 * 
 * @param {string} ean - The EAN of the product to fetch.
 * @returns {Promise<Object>} A promise that resolves to the product object.
 * @throws {Error} Throws an error if the network response is not ok.
 */
export const getProductByEan = async (ean) => {
  const response = await fetch(`/api/products/${ean}`);

  if (!response.ok) {
    // Try to get a more specific error message from the response body
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error || `Produto com EAN ${ean} não encontrado.`;
    throw new Error(errorMessage);
  }

  return response.json();
};

/**
 * Fetches a single product by its ID from the backend API.
 * This function calls the GET /api/products/:id endpoint.
 * 
 * @param {string|number} id - The ID of the product to fetch.
 * @returns {Promise<Object>} A promise that resolves to the product object.
 * @throws {Error} Throws an error if the network response is not ok.
 */
export const getProductById = async (id) => {
  const response = await fetch(`/api/products/${id}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error || `Produto com ID ${id} não encontrado.`;
    throw new Error(errorMessage);
  }

  return response.json();
};
