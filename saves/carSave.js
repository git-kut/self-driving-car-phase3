async function fetchCarData() {
  try {
    const response = await fetch("/saves/car_ai_advanced_and_improved.car");
    if (!response.ok) {
      throw new Error(response.status);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error fetching the car data:", error);
    throw error; // Rethrow the error to handle it in the main file
  }
}

export default fetchCarData;
