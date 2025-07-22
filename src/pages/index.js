import {
  enableValidation,
  validationConfig,
  resetValidation,
  disableButton,
} from "./validation.js";
import "./index.css";
import { setButtonText } from "../utils/helpers.js";
import Api from "../utils/Api.js";

const initialCards = [
  {
    name: "Val Thorens",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
  },
  {
    name: "Restaurant terrace",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
  },
  {
    name: "An outdoor cafe",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
  },
  {
    name: "A very long bridge, over the forest and through the trees",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
  },
  {
    name: "Tunnel with morning light",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
  },
  {
    name: "Mountain house",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
  },
];

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "e7df0a52-4546-4c45-9dd5-539f7b8ca14b",
    "Content-Type": "application/json",
  },
});

let currentUserId;

api
  .getAppInfo()
  .then(([cards, userInfo]) => {
    currentUserId = userInfo._id;
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.append(cardElement);
    });
    profileName.textContent = userInfo.name;
    profileDescription.textContent = userInfo.about;
    profileAvatar.src = userInfo.avatar;
  })
  .catch((err) => {
    console.error(err);
  });

const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector("#edit-avatar-form");
const cardSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");
const profileAvatar = document.querySelector(".profile__avatar");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector("#delete-form");
const confirmDeleteBtn = deleteModal.querySelector(
  ".modal__submit-btn[type='submit']"
);
const cancelDeleteBtn = deleteModal.querySelector(
  ".modal__submit-btn[type='button']"
);
const deleteModalCloseBtn = deleteModal.querySelector(".modal__close-btn");

const profileEditButton = document.querySelector(".profile__edit-btn");
const cardModalBtn = document.querySelector(".profile__add-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const profileForm = document.querySelector("#profile-form");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);
const cardModal = document.querySelector("#add-card-modal");
const cardForm = cardModal.querySelector(".modal__form");
const cardSubmitButton = cardModal.querySelector(".modal__submit-btn");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");

const previewModal = document.querySelector("#preview-modal");
const previewModalImageElement = previewModal.querySelector(".modal__image");
const previewModalCaptionElement =
  previewModal.querySelector(".modal__caption");
const previewModalCloseBtn = previewModal.querySelector(
  ".modal__close-btn_type_preview"
);

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

let selectedCard, selectedCardId;

function renderLoading(
  isLoading,
  button,
  buttonText = "Save",
  loadingText = "Saving..."
) {
  button.textContent = isLoading ? loadingText : buttonText;
}

function handleSubmit(request, evt, loadingText = "Saving...") {
  evt.preventDefault();

  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;

  renderLoading(true, submitButton, initialText, loadingText);

  request()
    .then(() => {
      evt.target.reset();
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(false, submitButton, initialText);
    });
}

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  cardNameEl.textContent = data.name;

  const cardImageElement = cardElement.querySelector(".card__image");
  cardImageElement.src = data.link;
  cardImageElement.alt = data.name;
  const likeButton = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  likeButton.addEventListener("click", (evt) => {
    console.log("Se hizo click en el botón de like");
    handleLike(evt, data._id);
  });

  const isLiked =
    Array.isArray(data.likes) &&
    data.likes.some((user) =>
      typeof user === "string"
        ? user === currentUserId
        : user._id === currentUserId
    );

  if (data.isLiked) {
    likeButton.classList.add("card__like-btn_liked");
  }
  function handleLike(evt, id) {
    evt.preventDefault();
    const likeButton = evt.target;

    const isLiked = likeButton.classList.contains("card__like-btn_liked");

    api
      .changeLikeStatus(id, isLiked)
      .then(() => {
        likeButton.classList.toggle("card__like-btn_liked");
      })
      .catch((err) => {
        console.error(err);
      });
  }

  cardDeleteBtn.addEventListener("click", () => {
    handleDeleteCard(cardElement, data._id);
  });

  cardImageElement.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageElement.src = data.link;
    previewModalImageElement.alt = data.name;
    previewModalCaptionElement.textContent = data.name;
  });

  return cardElement;
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", closeModalEsc);
}

const modals = document.querySelectorAll(".modal");
modals.forEach((modal) => {
  modal.addEventListener("click", closeModalOverlay);
});

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", closeModalEsc);
}

function handleEditFormSubmit(evt) {
  function makeRequest() {
    return api
      .editUserInfo({
        name: editModalNameInput.value,
        about: editModalDescriptionInput.value,
      })
      .then((data) => {
        profileName.textContent = data.name;
        profileDescription.textContent = data.about;
        closeModal(editModal);
      });
  }

  handleSubmit(makeRequest, evt);
}

//todo implement loading ttext for all other form  submisiions

function handleAddCardSubmit(evt) {
  function makeRequest() {
    const inputValues = {
      name: cardNameInput.value,
      link: cardLinkInput.value,
    };

    return api.addNewCard(inputValues).then((data) => {
      const cardElement = getCardElement(data);
      cardsList.prepend(cardElement);
      closeModal(cardModal);
      cardForm.reset();
      disableButton(cardSubmitButton, validationConfig);
    });
  }

  handleSubmit(makeRequest, evt, "Creating...");
}

function handleAvatarSubmit(evt) {
  function makeRequest() {
    const newAvatar = { avatar: avatarInput.value };

    return api.editAvatarInfo(newAvatar).then((data) => {
      profileAvatar.src = data.avatar;
      closeModal(avatarModal);
    });
  }

  handleSubmit(makeRequest, evt);
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleDeleteSubmit(evt) {
  function makeRequest() {
    return api.deleteCard(selectedCardId).then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    });
  }

  handleSubmit(makeRequest, evt, "Deleting...");
}

function handleCancelDelete() {
  closeModal(deleteModal);
}

deleteForm.addEventListener("submit", handleDeleteSubmit);
cancelDeleteBtn.addEventListener("click", handleCancelDelete);
deleteModalCloseBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(
    editFormElement,
    [editModalNameInput, editModalDescriptionInput],
    validationConfig
  );
  openModal(editModal);
});

editModalCloseBtn.addEventListener("click", () => {
  closeModal(editModal);
});

previewModalCloseBtn.addEventListener("click", () => {
  closeModal(previewModal);
});

cardModalBtn.addEventListener("click", () => {
  cardForm.reset();
  resetValidation(cardForm, [cardNameInput, cardLinkInput], validationConfig);
  openModal(cardModal);
});
cardModalCloseBtn.addEventListener("click", () => {
  closeModal(cardModal);
});

avatarModalBtn.addEventListener("click", () => {
  avatarForm.reset();
  avatarInput.value = "";
  resetValidation(avatarForm, [avatarInput], validationConfig);
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

avatarForm.addEventListener("submit", handleAvatarSubmit);
editFormElement.addEventListener("submit", handleEditFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);

function closeModalEsc(evt) {
  if (evt.key === "Escape") {
    const modalOpened = document.querySelector(".modal_opened");

    closeModal(modalOpened);
  }
}

function closeModalOverlay(evt) {
  if (evt.target === evt.currentTarget) {
    closeModal(evt.currentTarget);
  }
}

enableValidation(validationConfig);
