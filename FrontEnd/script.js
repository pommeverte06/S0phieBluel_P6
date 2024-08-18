document.addEventListener("DOMContentLoaded", () => {
  const filters = document.querySelector(".filters");
  let filter = "0"; // initialisation du filtre par défaut

  // fonction pour récupérer les travaux depuis l'API
  const getWorks = async () => {
    try {
      const response = await fetch("http://localhost:5678/api/works");
      const works = await response.json();
      return works;
    } catch (error) {
      console.error("il y a eu un problème avec la requête fetch:", error);
    }
  };

  // fonction pour afficher les travaux dans la galerie
  const showWorks = (works) => {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = ""; // réinitialisation de la galerie

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

  // fonction pour mettre à jour les travaux affichés
  const updateWorks = async () => {
    const works = await getWorks();
    showWorks(works);
  };

  // fonction pour récupérer et afficher les catégories sous forme de boutons
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

  // initialisation des travaux et des catégories
  updateWorks();
  getCategories();

  // ajout du bouton de modification pour l'utilisateur
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

  // fonction pour ouvrir la modale de galerie de photos
  async function openModal() {
    if (modale) {
      modalGallery.innerHTML = ""; // réinitialise la galerie de la modale

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

      // chargement des travaux dans la galerie de la modale
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

  // fonction pour fermer la modale de galerie de photos
  function closeGalleryModal() {
    if (modale) {
      modale.style.visibility = "hidden";
      modale.classList.add("hidden");
      modalAddPhotoForm.classList.add("hidden-none");
      modalGallery.classList.remove("hidden-none");
      window.removeEventListener("click", closeModalOutsideClick);
    }
  }

  // fonction pour fermer la modale d'ajout de photo
  function closeAddPhotoModal() {
    modalAddPhotoForm.classList.add("hidden");
    modalAddPhotoForm.classList.remove("active");
    modale.style.visibility = "hidden";
    modale.classList.add("hidden");
    window.removeEventListener("click", closeModalOutsideClickForAddPhoto);
  }

  // fonction pour gérer la fermeture de la modale lors d'un clic en dehors
  function closeModalOutsideClick(event) {
    if (event.target === modale) {
      closeGalleryModal();
    }
  }

  // fonction pour gérer la fermeture de la modale d'ajout de photo lors d'un clic en dehors
  function closeModalOutsideClickForAddPhoto(event) {
    if (event.target === modale) {
      closeAddPhotoModal();
    }
  }

  // // fonction pour afficher la modale d'ajout de photo
  // function showAddPhotoForm() {
  //   modalGallery.classList.add("hidden-none");
  //   modalAddPhotoForm.classList.remove("hidden");
  //   modalAddPhotoForm.classList.add("active");

  //   window.addEventListener("click", closeModalOutsideClickForAddPhoto);

  //   const imageInput = document.getElementById("image-upload");
  //   const imagePreview = document.getElementById("image-preview");
  //   const iconImage = document.querySelector(".icon-image");
  //   const categorySelect = document.getElementById("category");

  //   imageInput.value = ""; // réinitialise l'input file
  //   imagePreview.style.display = "none"; // masque l'aperçu de l'image précédente
  //   iconImage.classList.remove("has-preview"); // réinitialise l'état du label

  //   categorySelect.selectedIndex = 0; // réinitialise la sélection de la catégorie

  //   // gestion du changement de fichier pour la prévisualisation
  //   imageInput.addEventListener("change", () => {
  //     const file = imageInput.files[0];
  //     if (file) {
  //       const reader = new FileReader();
  //       reader.onload = function (e) {
  //         imagePreview.src = e.target.result;
  //         imagePreview.style.display = "block";
  //         iconImage.classList.add("has-preview");
  //       };
  //       reader.readAsDataURL(file);
  //     } else {
  //       imagePreview.src = "";
  //       imagePreview.style.display = "none";
  //       iconImage.classList.remove("has-preview");
  //     }
  //   });
  // }


// fonction pour afficher la modale d'ajout de photo
function showAddPhotoForm() {
  modalGallery.classList.add("hidden-none");
  modalAddPhotoForm.classList.remove("hidden");
  modalAddPhotoForm.classList.add("active");

  window.addEventListener("click", closeModalOutsideClickForAddPhoto);

  const imageInput = document.getElementById("image-upload");
  const imagePreview = document.getElementById("image-preview");
  const iconImage = document.querySelector(".icon-image");
  const categorySelect = document.getElementById("category");
  const limitUploadText = document.querySelector(".limit-upload");

  imageInput.value = ""; // réinitialise l'input file
  imagePreview.style.display = "none"; // masque l'aperçu de l'image précédente
  iconImage.classList.remove("has-preview"); // réinitialise l'état du label

  categorySelect.selectedIndex = 0; // réinitialise la sélection de la catégorie
  limitUploadText.style.display = "block"; // assure que le texte est visible lorsque l'image n'est pas sélectionnée

  // gestion du changement de fichier pour la prévisualisation
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
        iconImage.classList.add("has-preview");
        limitUploadText.style.display = "none"; // masque le texte lorsqu'une image est sélectionnée
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.src = "";
      imagePreview.style.display = "none";
      iconImage.classList.remove("has-preview");
      limitUploadText.style.display = "block"; // assure que le texte est visible lorsque l'image n'est pas sélectionnée
    }
  });
}








  // fonction pour afficher la galerie de photos dans la modale
  function showPhotoGallery() {
    modalGallery.classList.remove("hidden-none");
    modalAddPhotoForm.classList.add("hidden");
    modalAddPhotoForm.classList.remove("active");
  }

  // attache l'événement de clic sur la flèche pour revenir à la galerie
  const arrowBack = document.querySelector(".arrow-back");
  if (arrowBack) {
    arrowBack.addEventListener("click", showPhotoGallery);
  }

  // fonction pour récupérer les catégories et les ajouter au formulaire
  async function getCategoriesForForm() {
    try {
      const response = await fetch("http://localhost:5678/api/categories");
      const categories = await response.json();
      const categorySelect = document.getElementById("category");

      // ajout d'une option par défaut pour sélectionner une catégorie
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Sélectionnez une catégorie";
      defaultOption.disabled = true;
      defaultOption.selected = true;
      categorySelect.appendChild(defaultOption);

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

  // fonction pour envoyer les données d'un nouveau travail
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

  // gestion de l'envoi du formulaire d'ajout de photo
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

  

// fonction pour supprimer une image existante
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
          // Supprimer l'image de la modale
          const trashIcon = event.target;
          const stampImages = trashIcon.closest(".stamp-images");
          if (stampImages) {
            stampImages.remove();
          }

          // Supprimer l'image de la galerie principale
          updateWorks(); // Cette fonction va actualiser la galerie principale pour refléter les changements

        } else {
          console.error("erreur lors de la suppression de l'image");
        }
      })
      .catch((error) => {
        console.error("il y a eu un problème avec la requête fetch:", error);
      });
  }
}











  
  // attache les événements pour fermer la modale d'ajout de photo
  if (closeAddPhotoModale) {
    closeAddPhotoModale.addEventListener("click", closeAddPhotoModal);
  }

  // attache l'événement pour ouvrir la modale de galerie de photos
  if (userModify) {
    userModify.addEventListener("click", openModal);
  }

  // récupération des catégories pour le formulaire d'ajout de photo
  getCategoriesForForm();
});
