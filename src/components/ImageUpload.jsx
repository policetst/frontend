import React, { useRef, useState } from 'react';

function ImageUpload({ onImagesChange }) {
  const fileInputRef = useRef(null); //* Ref for the file input element
  const [images, setImages] = useState([]);

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);

    // * Call the onImagesChange callback with the new files
    if (onImagesChange) {
      onImagesChange(updatedImages.map(img => img.file));
    }

    e.target.value = null;
  };

  const handleRemove = (idx) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[idx].url);
      updated.splice(idx, 1);

      // 
      if (onImagesChange) {
        onImagesChange(updated.map(img => img.file));
      }

      return updated;
    });
  };

  return (
    <div>
      {/* Campo para subir la imagen */}
      <input
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFilesChange}
      />
      <div
        className="cursor-pointer p-5 text-center text-gray-500 bg-white border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition mb-4"
        onClick={handleBrowseClick}
      >
        <p className="text-sm">Haz clic aquí para subir una imagen</p>
        <p className="text-xs text-gray-400">Formatos permitidos: JPG, PNG. Tamaño máximo: 2MB</p>
      </div>
      
      {/* Muestra las imagenes */}
      <div className="flex flex-wrap gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-20 h-20">
            <img
              src={img.url}
              alt={`preview-${idx}`}
              className="object-cover w-full h-full rounded"
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center shadow"
              title="Eliminar"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <hr className="border-t border-gray-300 my-4" />
    </div>
  );
}

export default ImageUpload;


// import React, { useRef, useState } from 'react';

// function ImageUpload({ onImagesChange }) {
//   const fileInputRef = useRef(null); //* Ref for the file input element
//   const [images, setImages] = useState([]);

//   const handleBrowseClick = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.click();
//     }
//   };

//   const handleFilesChange = (e) => {
//     const files = Array.from(e.target.files);
//     const newImages = files.map(file => ({
//       file,
//       url: URL.createObjectURL(file)
//     }));

//     const updatedImages = [...images, ...newImages];
//     setImages(updatedImages);

//     // * Call the onImagesChange callback with the new files
//     if (onImagesChange) {
//       onImagesChange(updatedImages.map(img => img.file));
//     }

//     e.target.value = null;
//   };

//   const handleRemove = (idx) => {
//     setImages(prev => {
//       const updated = [...prev];
//       URL.revokeObjectURL(updated[idx].url);
//       updated.splice(idx, 1);

//       // 
//       if (onImagesChange) {
//         onImagesChange(updated.map(img => img.file));
//       }

//       return updated;
//     });
//   };

//   return (
//     <div>
//       <input
//         type="file"
//         accept="image/*"
//         multiple
//         style={{ display: 'none' }}
//         ref={fileInputRef}
//         onChange={handleFilesChange}
//       />
//       <div
//         className="cursor-pointer p-12 flex justify-center bg-white border border-dashed border-default-300 rounded-xl mb-4"
//         onClick={handleBrowseClick}
//       >
//         <div className="text-center">
//           <span className="inline-flex justify-center items-center size-16 bg-default-100 text-default-800 rounded-full">
//             <i className="i-tabler-upload size-6 shrink-0"></i>
//           </span>
//           <div className="mt-4 flex flex-wrap justify-center text-sm leading-6 text-default-600">
//             <span className="pe-1 font-medium text-default-800">Drop your files here or</span>
//             <span
//               className="bg-white font-semibold text-primary hover:text-primary-700 rounded-lg decoration-2 hover:underline"
//               style={{ cursor: 'pointer', marginLeft: 4 }}
//               onClick={e => { e.stopPropagation(); handleBrowseClick(); }}
//             >
//               browse
//             </span>
//           </div>
//           <p className="mt-1 text-xs text-default-400">Pick images up to 2MB each.</p>
//         </div>
//       </div>
//       <div className="flex flex-wrap gap-4">
//         {images.map((img, idx) => (
//           <div key={idx} className="relative w-32 h-32">
//             <img
//               src={img.url}
//               alt={`preview-${idx}`}
//               className="object-cover w-full h-full rounded"
//             />
//             <button
//               type="button"
//               onClick={() => handleRemove(idx)}
//               className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow"
//               title="Eliminar"
//             >
//               &times;
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default ImageUpload;