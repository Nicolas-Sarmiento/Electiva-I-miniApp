export const uploadImageToCloudinary = async (file, cloudName, uploadPreset) => {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
        let errorMsg = `Cloudinary Error: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            console.error("Cloudinary error details:", errorData);
            errorMsg = errorData.error?.message || errorMsg;
        } catch (e) {
            // Si la respuesta no es JSON (ej. error 404 por Cloud Name incorrecto)
            console.error("Cloudinary returned non-JSON error:", response.status);
            if (response.status === 404) {
               errorMsg = "Tu Cloud Name es incorrecto o no existe. Revisa el archivo .env.local.";
            } else if (response.status === 400) {
               errorMsg = "Revisa que tu Upload Preset sea correcto y esté configurado como Unsigned en Cloudinary.";
            }
        }
        throw new Error(errorMsg);
    }

    const data = await response.json();
    return data.secure_url; // This is the direct URL to the image
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

export const uploadMultipleImages = async (files, cloudName, uploadPreset) => {
    // Run all uploads in parallel
    const uploadPromises = Array.from(files).map(file => 
      uploadImageToCloudinary(file, cloudName, uploadPreset)
    );
    
    // Wait for all to finish and return array of URLs
    return await Promise.all(uploadPromises);
};
