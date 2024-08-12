document.addEventListener("DOMContentLoaded", () => {
  const filters = document.querySelector(".filters");
  let filter = "0"; // variable pour stocker le filtre sélectionné

  // Fonction pour récupérer les travaux depuis l'API
  const getWorks = async () => {
    try {
      const response = await fetch("http://localhost:5678/api/works");
      const works = await response.json();
      return works;
    } catch (error) {
      console.error("Il y a eu un problème avec la requête fetch:", error);
    }
  };

  // Fonction pour afficher les works dans la page d'accueil
  const showWorks = (works) => {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";

    works.forEach((work) => {
      // Condition pour filtrer les travaux selon la catégorie
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

  // Fonction pour mettre à jour les travaux affichés selon le filtre
  const updateWorks = async () => {
    const works = await getWorks();
    showWorks(works);
  };

  // Fonction pour récupérer les catégories depuis l'API + création des boutons filtres
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
      console.error("Il y a eu un problème avec la requête fetch:", error);
    }
  };

  // Appels fonctions
  updateWorks();
  getCategories();

  //************************************************************************* */
  // Création du lien de modifier
  const userModify = document.querySelector(".user-modify");
  const divModify = document.createElement("div");
  const iconModify = document.createElement("i");
  iconModify.classList.add("far", "fa-pen-to-square");
  const textModify = document.createTextNode(" modifier");
  divModify.appendChild(iconModify);
  divModify.appendChild(textModify);
  userModify.appendChild(divModify);
  //************************************************************************* */

  // Sélection des éléments de la modale
  const modale = document.getElementById("modale");
  const modalGallery = document.querySelector(".modal-gallery");
  const modalAddPhotoForm = document.getElementById("modal-add-photo");

  // Croix de fermeture spécifique à la deuxième modale (formulaire d'ajout de photo)
  const closeAddPhotoModale = document.querySelector(".close-add-photo-modale");

  //***************************************************************************** */
  // Fonction pour ouvrir la modale galerie photo
  async function openModal() {
    if (modale) {
      // Vider le contenu existant de la modale galerie uniquement avant de la remplir
      modalGallery.innerHTML = "";

      // modale pour galerie photo
      const modalText = document.createElement("span");
      modalText.classList.add("modal-text");
      modalText.textContent = "Galerie photo";

      const closeModalIcon = document.createElement("i");
      closeModalIcon.classList.add("fas", "fa-times", "close-modale"); // Classe de la première croix

      const imagesContainer = document.createElement("div");
      imagesContainer.classList.add("images-container");

      const addPhotoButton = document.createElement("button");
      addPhotoButton.classList.add("add-photo-button");
      addPhotoButton.textContent = "Ajouter une photo";

      modalGallery.appendChild(modalText);
      modalGallery.appendChild(closeModalIcon);
      modalGallery.appendChild(imagesContainer);
      modalGallery.appendChild(addPhotoButton);

      // Ajouter les événements aux éléments créés dynamiquement
      closeModalIcon.addEventListener("click", closeGalleryModal);
      addPhotoButton.addEventListener("click", showAddPhotoForm);

      // Récupérer les travaux et les ajouter au container
      const works = await getWorks();
      works.forEach((work) => {
        const stampImages = document.createElement("div"); // div pour l'image et l'icône de poubelle
        stampImages.classList.add("stamp-images");

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;
        stampImages.appendChild(img);

       
        const trashIcon = document.createElement("i");
        trashIcon.classList.add("fa-solid", "fa-trash-can", "trash-icon");
        trashIcon.dataset.id = work.id; // Associe l'id du work à l'icône
        trashIcon.addEventListener("click", (event) =>
          removeImage(work.id, event)
        );

        stampImages.appendChild(trashIcon);
        imagesContainer.appendChild(stampImages);
      });
      //********************************************************* */
      modale.classList.remove("hidden");
      modale.style.visibility = "visible";

      // Assurer la fermeture de la modale lorsqu'on clique en dehors
      window.addEventListener("click", closeModalOutsideClick);
    }
  }

  // Fonction pour fermer la modale de la galerie photo
  function closeGalleryModal() {
    if (modale) {
      modale.style.visibility = "hidden";
      modale.classList.add("hidden");
      modalAddPhotoForm.classList.add("hidden-none"); // cacher le formulaire d'ajout de photo
      modalGallery.classList.remove("hidden-none"); // afficher la galerie

      // Supprimer l'événement de fermeture lié au clic extérieur
      window.removeEventListener("click", closeModalOutsideClick);
    }
  }

  // Fonction pour fermer la modale d'ajout de photo
  function closeAddPhotoModal() {
    modalAddPhotoForm.classList.add("hidden"); // cacher le formulaire d'ajout de photo
    modalAddPhotoForm.classList.remove("active");
    modale.style.visibility = "hidden"; // Assure que le fond sombre disparaît
    modale.classList.add("hidden"); // Masquer toute la modale pour éviter le retour à la galerie

    // Supprimer l'événement de fermeture lié au clic extérieur
    window.removeEventListener("click", closeModalOutsideClickForAddPhoto);
  }

  // Fonction pour fermer la modale en cliquant en dehors pour la galerie photo
  function closeModalOutsideClick(event) {
    if (event.target === modale) {
      closeGalleryModal();
    }
  }

  // Fonction pour fermer la modale en cliquant en dehors pour l'ajout de photo
  function closeModalOutsideClickForAddPhoto(event) {
    if (event.target === modale) {
      closeAddPhotoModal();
    }
  }

  // Fonction pour afficher le formulaire d'ajout de photo
  function showAddPhotoForm() {
    modalGallery.classList.add("hidden-none"); // Cacher la première modale
    modalAddPhotoForm.classList.remove("hidden"); // Afficher le formulaire d'ajout de photo
    modalAddPhotoForm.classList.add("active");

    // Ajouter l'événement de fermeture pour le clic en dehors de la deuxième modale
    window.addEventListener("click", closeModalOutsideClickForAddPhoto);
  }

  // Fonction pour récupérer les catégories et les ajouter au formulaire
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
      console.error("Il y a eu un problème avec la requête fetch:", error);
    }
  }
  //************************************************************ */

  function removeImage(id, event) {
    event.preventDefault(); // Assure que l'événement par défaut est empêché
    console.log("Suppression de l'image avec l'id :", id); // Debugging

    if (confirm("Etes-vous sûr(e) de vouloir supprimer ce projet?")) {
      const token = localStorage.getItem("token");
      console.log("Token récupéré :", token);

      fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          console.log("Statut de la réponse:", response.status);
          if (response.ok) {
            const trashIcon = event.target;
            const stampImages = trashIcon.closest(".stamp-images");
            if (stampImages) {
              console.log("Élément supprimé du DOM");
              stampImages.remove();
            }
          } else {
            console.error("Erreur lors de la suppression de l'image");
          }
        })
        .catch((error) => {
          console.error("Il y a eu un problème avec la requête fetch:", error);
        });
    }
  }

  //************************************************************************* */
  // Attacher l'événement de fermeture à la croix de la deuxième modale (formulaire d'ajout de photo)
  if (closeAddPhotoModale) {
    closeAddPhotoModale.addEventListener("click", closeAddPhotoModal);
  }

  // Event pour ouvrir la modale galerie photo
  userModify.addEventListener("click", openModal);

  // Affichage de l'image sélectionnée
  const imageInput = document.getElementById("image");
  const imageUploadDiv = document.querySelector(".image-upload");

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgElement = document.createElement("img");
        imgElement.src = e.target.result;
        imgElement.style.width = "100%"; // Ajustez la taille selon vos besoins
        imageUploadDiv.innerHTML = ""; // Efface le contenu précédent
        imageUploadDiv.appendChild(imgElement);
      };
      reader.readAsDataURL(file);
    }
  });
//***************************************************************** */
  
  
  
  
  
  document.addEventListener("DOMContentLoaded", () => {
    const modalAddPhotoForm = document.getElementById("modal-add-photo");
  
    modalAddPhotoForm.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const formData = new FormData(modalAddPhotoForm);
      const token = localStorage.getItem("token");
  
      console.log("FormData à envoyer :", formData.get("image"), formData.get("title"), formData.get("category"));
  
      try {
        const response = await fetch("http://localhost:5678/api/works", {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        console.log("Statut de la réponse:", response.status);
        if (response.ok) {
          console.log("Upload réussi !");
          updateWorks(); // Actualiser la galerie après ajout
        } else {
          console.error("Erreur lors de l'ajout de la photo:", response.statusText);
        }
      } catch (error) {
        console.error("Il y a eu un problème avec la requête fetch:", error);
      }
    });
  });
  



//******************************************************************************** */
  // Gestion du bouton retour pour afficher la galerie et cacher le formulaire
  const backButton = document.querySelector(".arrow-back");
  backButton.addEventListener("click", () => {
    modalAddPhotoForm.classList.add("hidden"); // Cacher le formulaire d'ajout de photo
    modalAddPhotoForm.classList.remove("active");
    modalGallery.classList.remove("hidden-none"); // Afficher la galerie photo

    // Supprimer l'événement de fermeture lié au clic extérieur
    window.removeEventListener("click", closeModalOutsideClickForAddPhoto);
  });

  // Récupérer les catégories pour le formulaire d'ajout de photo
  getCategoriesForForm();
});


