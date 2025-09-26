export async function getAllCategories() {
  const response = await fetch("http://localhost:5000/categories");
  const data = await response.json();
  return data;
}

export async function getCategoryBySlug(id) {
  const response = await fetch(`http://localhost:5000/categories/${id}`);
  const data = await response.json();
  return data;
}


// POST a new category
export async function postCategory({ name, description }) {
  const response = await fetch("http://localhost:5000/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit category");
  }

  return response.json();
}

// export async function getAllCategories() {
//   try {
//     const response = await fetch("http://localhost:5000/categories");
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }
//     const data = await response.json();
//     console.log("Raw API response:", data); // debug here
//     return data;
//   } catch (err) {
//     console.log("Error fetching categories:", err);
//     return { categories: [] };
//   }
// }
