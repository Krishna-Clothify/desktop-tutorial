import api from "./api";   // IMPORTANT: not axios
export const getMyRentals = () => api.get("/rentals/my");
export const returnRental = (id) => api.put(`/rentals/return/${id}`);
export const clearHistory = () => api.delete("/rentals/clear-history");

export const rentCloth = async (clothId, startDate, endDate) => {
  return api.post("/rentals", {
    clothesId: clothId,
    startDate,
    endDate
  });
};

export const checkoutCart = (items) => {
  return api.post("/rentals/checkout", { items });
};
