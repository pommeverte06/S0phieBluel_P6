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
  //*********************************************************************** */
  // fonction pour mettre à jour les travaux affichés
  const updateWorks = async () => {
    const works = await getWorks();
    showWorks(works);
  };
  //*************************************************************************** */

  // fonction pour récupérer les catégories et afficher les boutons
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

  //************************************************************************** */

  // ajout du lien modifier après login
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

  //************************************************************************* */
  //modale gallery pour supprimer photo et modale ajout photo
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
  //*********************************************************************** */
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

  //************************************************************************** */

  // fonction pour afficher la modale d'ajout de photo
  function showAddPhotoForm() {
    // Réinitialiser le formulaire d'ajout de photo
    resetAddPhotoForm();

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
    imagePreview.style.display = "none";
    iconImage.classList.remove("has-preview");

    categorySelect.selectedIndex = 0; // réinitialise la sélection de la catégorie
    limitUploadText.style.display = "block";

    // gestion du changement de fichier pour la prévisualisation
    imageInput.addEventListener("change", () => {
      const file = imageInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imagePreview.src = e.target.result;
          imagePreview.style.display = "block";
          iconImage.classList.add("has-preview");
          limitUploadText.style.display = "none";
        };
        reader.readAsDataURL(file);
      } else {
        imagePreview.src = "";
        imagePreview.style.display = "none";
        iconImage.classList.remove("has-preview");
        limitUploadText.style.display = "block";
      }
    });
  }
  //************************************************************************** */
  // fonction pour afficher la galerie de photos dans la modale
  function showPhotoGallery() {
    modalGallery.classList.remove("hidden-none");
    modalAddPhotoForm.classList.add("hidden");
    modalAddPhotoForm.classList.remove("active");
  }

  // événement de clic sur la flèche pour revenir à la galerie
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

      // ajout de l'option vide dans la liste catégories
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "";
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

  //******************************************************************** */

  // fonction pour envoyer les données d'un nouveau travail
  async function postDatas() {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("token non trouvé");
        reject("token non trouvé");
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

      if (!file || !title || !category) {
        console.log("formulaire pas correctement rempli");
        reject("formulaire pas correctement rempli");
      }

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
            resolve("l'image a été ajoutée avec succès!");
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

  //******************************************************************** */
  //fonction pour empecher lajout des photos si les champs non remplis
  function checkFormValidity() {
    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const imageInput = document.getElementById("image-upload").files.length > 0;
    const submitButton = document.querySelector(".submit-button");

    //vérifie si tous les champs sont remplis
    if (title && category && imageInput) {
      submitButton.disabled = false; // Active le bouton
      submitButton.style.backgroundColor = "#1d6154"; // Vert foncé
    } else {
      submitButton.disabled = true; // Désactive le bouton
      submitButton.style.backgroundColor = "#a7a7a7"; // Gris par défaut
    }
  }

  //écouteurs d'événements pour chaque champ du formulaire
  document.getElementById("title").addEventListener("input", checkFormValidity);
  document.getElementById("category").addEventListener("change", checkFormValidity);
  document.getElementById("image-upload").addEventListener("change", checkFormValidity);

  //réinitialise le bouton "valider"
  function resetAddPhotoForm() {
    const title = document.getElementById("title");
    const category = document.getElementById("category");
    const imageInput = document.getElementById("image-upload");
    const submitButton = document.querySelector(".submit-button");

    // réinitialise valeur des champs
    title.value = "";
    category.selectedIndex = 0;
    imageInput.value = "";

    // réinitialise couleur du bouton
    submitButton.disabled = true;
    submitButton.style.backgroundColor = "#a7a7a7"; 
  }

  //**************************************************************************** */
  // fonction pour supprimer une image de la galerie
  function removeImage(id, event) {
    event.preventDefault();

    if (confirm("Êtes-vous sûr(e) de vouloir supprimer ce projet?")) {
      const token = localStorage.getItem("token");

      fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            // supprimer l'image de la modale
            const trashIcon = event.target;
            const stampImages = trashIcon.closest(".stamp-images");
            if (stampImages) {
              stampImages.remove();
            }

            // supprime en plus l'image de la galerie principale
            updateWorks(); // fonction actualisation de la galerie
          } else {
            console.error("erreur lors de la suppression de l'image");
          }
        })
        .catch((error) => {
          console.error("il y a eu un problème avec la requête fetch:", error);
        });
    }
  }

  // fermer la modale d'ajout de photo
  if (closeAddPhotoModale) {
    closeAddPhotoModale.addEventListener("click", closeAddPhotoModal);
  }

  //  ouvrir la modale de galerie de photos
  if (userModify) {
    userModify.addEventListener("click", openModal);
  }

  // récupération des catégories pour le formulaire d'ajout de photo
  getCategoriesForForm();
});
