



document.addEventListener("DOMContentLoaded", () => {
  const filters = document.querySelector(".filters");
  let filter = "0";

  const getWorks = async () => {
    try {
      const response = await fetch("http://localhost:5678/api/works");
      const works = await response.json();
      return works;
    } catch (error) {
      console.error("il y a eu un problème avec la requête fetch:", error);
    }
  };

  const showWorks = (works) => {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";

    works.forEach((work) => {
      if (filter === "0" || work.categoryId.toString() === filter) {
        const figure = document.createElement("figure");

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const figcaption = document.createElement("figcaption");
        figcaption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
      }
    });
  };

  const updateWorks = async () => {
    const works = await getWorks();
    showWorks(works);
  };

  const getCategories = async () => {
    try {
      const response = await fetch("http://localhost:5678/api/categories");
      const categories = await response.json();

      const tous = document.getElementById("0");
      tous.addEventListener("click", () => {
        filter = "0";
        updateWorks();
      });

      categories.forEach((category) => {
        const button = document.createElement("button");
        button.id = category.id;
        button.textContent = category.name;
        filters.appendChild(button);
        button.addEventListener("click", () => {
          filter = category.id.toString();
          updateWorks();
        });
      });
    } catch (error) {
      console.error("il y a eu un problème avec la requête fetch:", error);
    }
  };

  updateWorks();
  getCategories();

  const userModify = document.querySelector(".user-modify");
  if (userModify) {
    const divModify = document.createElement("div");
    const iconModify = document.createElement("i");
    iconModify.classList.add("far", "fa-pen-to-square");
    const textModify = document.createTextNode(" modifier");
    divModify.appendChild(iconModify);
    divModify.appendChild(textModify);
    userModify.appendChild(divModify);
  }

  const modale = document.getElementById("modale");
  const modalGallery = document.querySelector(".modal-gallery");
  const modalAddPhotoForm = document.getElementById("modal-add-photo");

  const closeAddPhotoModale = document.querySelector(".close-add-photo-modale");

  async function openModal() {
    if (modale) {
      modalGallery.innerHTML = "";

      const modalText = document.createElement("span");
      modalText.classList.add("modal-text");
      modalText.textContent = "Galerie photo";

      const closeModalIcon = document.createElement("i");
      closeModalIcon.classList.add("fas", "fa-times", "close-modale");

      const imagesContainer = document.createElement("div");
      imagesContainer.classList.add("images-container");

      const addPhotoButton = document.createElement("button");
      addPhotoButton.classList.add("add-photo-button");
      addPhotoButton.textContent = "Ajouter une photo";

      modalGallery.appendChild(modalText);
      modalGallery.appendChild(closeModalIcon);
      modalGallery.appendChild(imagesContainer);
      modalGallery.appendChild(addPhotoButton);

      closeModalIcon.addEventListener("click", closeGalleryModal);
      addPhotoButton.addEventListener("click", showAddPhotoForm);

      const works = await getWorks();
      works.forEach((work) => {
        const stampImages = document.createElement("div");
        stampImages.classList.add("stamp-images");

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;
        stampImages.appendChild(img);

        const trashIcon = document.createElement("i");
        trashIcon.classList.add("fa-solid", "fa-trash-can", "trash-icon");
        trashIcon.dataset.id = work.id;
        trashIcon.addEventListener("click", (event) =>
          removeImage(work.id, event)
        );

        stampImages.appendChild(trashIcon);
        imagesContainer.appendChild(stampImages);
      });

      modale.classList.remove("hidden");
      modale.style.visibility = "visible";

      window.addEventListener("click", closeModalOutsideClick);
    }
  }

  function closeGalleryModal() {
    if (modale) {
      modale.style.visibility = "hidden";
      modale.classList.add("hidden");
      modalAddPhotoForm.classList.add("hidden-none");
      modalGallery.classList.remove("hidden-none");

      window.removeEventListener("click", closeModalOutsideClick);
    }
  }

  function closeAddPhotoModal() {
    modalAddPhotoForm.classList.add("hidden");
    modalAddPhotoForm.classList.remove("active");
    modale.style.visibility = "hidden";
    modale.classList.add("hidden");

    window.removeEventListener("click", closeModalOutsideClickForAddPhoto);
  }

  function closeModalOutsideClick(event) {
    if (event.target === modale) {
      closeGalleryModal();
    }
  }

  function closeModalOutsideClickForAddPhoto(event) {
    if (event.target === modale) {
      closeAddPhotoModal();
    }
  }

  
  function showAddPhotoForm() {
    modalGallery.classList.add("hidden-none");
    modalAddPhotoForm.classList.remove("hidden");
    modalAddPhotoForm.classList.add("active");
  
    window.addEventListener("click", closeModalOutsideClickForAddPhoto);
  
    const imageInput = document.getElementById("image-upload");
    const imagePreview = document.getElementById("image-preview");
    const iconImage = document.querySelector(".icon-image");
  
    imageInput.value = ""; // réinitialise l'input file
    imagePreview.style.display = "none"; // masque l'aperçu de l'image précédente
    iconImage.classList.remove("has-preview"); // réinitialise l'état du label
  
    imageInput.addEventListener("change", () => {
      const file = imageInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imagePreview.src = e.target.result;
          imagePreview.style.display = "block";
          iconImage.classList.add("has-preview");
        };
        reader.readAsDataURL(file);
      } else {
        imagePreview.src = "";
        imagePreview.style.display = "none";
        iconImage.classList.remove("has-preview");
      }
    });
  }
  


  async function getCategoriesForForm() {
    try {
      const response = await fetch("http://localhost:5678/api/categories");
      const categories = await response.json();
      const categorySelect = document.getElementById("category");

      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    } catch (error) {
      console.error("il y a eu un problème avec la requête fetch:", error);
    }
  }

  async function postDatas() {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("token non trouvé. veuillez vous connecter.");
        reject("token non trouvé. veuillez vous connecter.");
        return;
      }

      const imageInput = document.getElementById("image-upload");
      console.log("champ image-upload détecté :", imageInput);

      if (!imageInput) {
        console.error("le champ de fichier n'a pas été trouvé.");
        return;
      }

      const file = imageInput.files[0];
      if (!file) {
        console.error("aucun fichier sélectionné.");
        reject("aucun fichier sélectionné.");
        return;
      }

      const title = modalAddPhotoForm.elements["title"].value;
      const category = modalAddPhotoForm.elements["category"].value;

      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", title);
      formData.append("category", category);

      console.log("fichier sélectionné:", file);

      fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
        .then((response) => {
          if (response.status === 201) {
            resolve("l'image a été ajoutée avec succès !");
          } else {
            response.json().then((data) => {
              reject(
                `erreur lors de l'ajout de l'image: ${
                  data.message || response.statusText
                }`
              );
            });
          }
        })
        .catch((error) => {
          console.error("erreur de réseau ou autre:", error.message);
          reject(`erreur de réseau ou autre: ${error.message}`);
        });
    });
  }

  if (modalAddPhotoForm) {
    modalAddPhotoForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      try {
        const message = await postDatas();
        console.log(message);
        modalAddPhotoForm.reset();
        updateWorks();
        closeAddPhotoModal();
      } catch (error) {
        console.error(error);
        alert(error);
      }
    });
  }

  function removeImage(id, event) {
    event.preventDefault();

    if (confirm("êtes-vous sûr(e) de vouloir supprimer ce projet?")) {
      const token = localStorage.getItem("token");

      fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            const trashIcon = event.target;
            const stampImages = trashIcon.closest(".stamp-images");
            if (stampImages) {
              stampImages.remove();
            }
          } else {
            console.error("erreur lors de la suppression de l'image");
          }
        })
        .catch((error) => {
          console.error("il y a eu un problème avec la requête fetch:", error);
        });
    }
  }

  if (closeAddPhotoModale) {
    closeAddPhotoModale.addEventListener("click", closeAddPhotoModal);
  }

  if (userModify) {
    userModify.addEventListener("click", openModal);
  }

  getCategoriesForForm();
});
