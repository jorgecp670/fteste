document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const rollDiceButton = document.getElementById('rollDiceButton');
    const diceResultSpan = document.getElementById('diceResultSpan');
    const characterForm = document.getElementById('characterForm');
    const characterSheet = document.getElementById('characterSheet');
    const characterDetails = document.getElementById('characterDetails');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const inputFile = document.querySelector("#picture__input");
    const pictureImage = document.querySelector(".picture__image");
    const requiredFields = ['name', 'characterClass', 'region', 'faith'];
    const pictureImageTxt = "Choose an image";
    pictureImage.innerHTML = pictureImageTxt;

    // Configuração do Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyAxH5o_IV9WZn72FyYUeyM4JbF4ls4cvqw",
        authDomain: "ficha-teste-ad5fa.firebaseapp.com",
        projectId: "ficha-teste-ad5fa",
        storageBucket: "ficha-teste-ad5fa.appspot.com",
        messagingSenderId: "890260354540",
        appId: "1:890260354540:web:7b64a2205de5a347fc3cc9"
    };

    // Inicialização do Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Função para rolar os dados
    function rollDice() {
        const diceQuantity = parseInt(document.getElementById('diceQuantity').value);
        const diceSides = parseInt(document.getElementById('diceSides').value);
        let totalRoll = 0;
        let individualRolls = [];

        for (let i = 0; i < diceQuantity; i++) {
            const diceRoll = Math.floor(Math.random() * diceSides) + 1;
            individualRolls.push(diceRoll);
            totalRoll += diceRoll;
        }

        diceResultSpan.textContent = `${totalRoll} (${individualRolls.join(', ')})`;
    }

    // Função para exibir a ficha do personagem
    function displayCharacterSheet(formData) {
        let characterSheetContent = `
            <div id="characterSheetContent">
                <h2>Dados do Personagem</h2>
                ${createCharacterDetails(formData)}
                <h2>Atributos</h2>
                ${createCharacterAttributes(formData)}
                <h2>Habilidades</h2>
                ${createCharacterAbilities(formData)}
                <h2>Perícias</h2>
                ${createCharacterSkills(formData)}
                <h2>Itens</h2>
                ${createCharacterItems(formData)}
            </div>`;

        characterSheet.style.display = 'block';
        characterDetails.innerHTML = characterSheetContent;
    }

    // Função auxiliar para criar detalhes do personagem
    function createCharacterDetails(formData) {
        return requiredFields.map(field => `
            <label for="${field}">${capitalize(field)}:</label>
            <input type="text" id="${field}" name="${field}" value="${formData.get(field)}"><br>
        `).join('');
    }

    // Função auxiliar para criar atributos do personagem
    function createCharacterAttributes(formData) {
        const attributes = ['strength', 'agility', 'wisdom', 'intelligence', 'luck', 'adaptability', 'charisma'];
        return attributes.map(attr => `<p><strong>${capitalize(attr)}:</strong> ${formData.get(attr)}</p>`).join('');
    }

    // Função auxiliar para criar habilidades do personagem
    function createCharacterAbilities(formData) {
        const abilities = ['ability1', 'ability2', 'ability3', 'ability4'];
        return abilities.map(ability => `<p><strong>Habilidade ${ability.slice(-1)}:</strong> ${formData.get(ability)}</p>`).join('');
    }

    // Função auxiliar para criar perícias do personagem
    function createCharacterSkills(formData) {
        const skills = Array.from({ length: 10 }, (_, i) => `skill${i + 1}`);
        return skills.map(skill => `<p><strong>Perícia ${skill.slice(-1)}:</strong> ${formData.get(skill)}</p>`).join('');
    }

    // Função auxiliar para criar itens do personagem
    function createCharacterItems(formData) {
        const consumables = ['consumable1', 'consumable2', 'consumable3'];
        const armors = ['armorName', 'armorDefense', 'armorResistance', 'armorAbility1', 'armorDurability'];
        const weapons = ['weaponName', 'weaponLevel', 'weaponAbility1', 'weaponDamage', 'weaponDurability'];

        return `
            <div class="items">
                <h3>Consumíveis:</h3>
                ${consumables.map(item => `<p><strong>${capitalize(item)}:</strong> ${formData.get(item)}</p>`).join('')}
            </div>
            <div class="items">
                <h3>Armadura:</h3>
                ${armors.map(item => `<p><strong>${capitalize(item)}:</strong> ${formData.get(item)}</p>`).join('')}
            </div>
            <div class="items">
                <h3>Arma:</h3>
                ${weapons.map(item => `<p><strong>${capitalize(item)}:</strong> ${formData.get(item)}</p>`).join('')}
            </div>`;
    }

    // Função para capitalizar a primeira letra
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Evento de clique para rolar os dados
    rollDiceButton.addEventListener('click', rollDice);

    // Evento de envio do formulário de personagem
    characterForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // Verificar se todos os campos obrigatórios estão preenchidos
        let formIsValid = true;
        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (input.value.trim() === '') {
                formIsValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        if (formIsValid) {
            const formData = new FormData(characterForm);
            displayCharacterSheet(formData);
            saveCharacterToDatabase(formData);
        } else {
            characterSheet.style.display = 'none';
            characterDetails.innerHTML = '<p class="error-message">Preencha todos os campos obrigatórios.</p>';
        }
    });

    // Função para salvar dados no Cloud Firestore
    function saveCharacterToDatabase(formData) {
        const data = Object.fromEntries(formData.entries());

        db.collection('characters').add(data)
            .then(() => {
                successMessage.style.display = 'block';
                errorMessage.style.display = 'none';
            })
            .catch(error => {
                console.error(error);
                successMessage.style.display = 'none';
                errorMessage.style.display = 'block';
            });
    }

    // Evento de alteração para o upload de imagem
    inputFile.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener("load", function (e) {
                const img = document.createElement("img");
                img.src = e.target.result;
                img.classList.add("picture__img");
                pictureImage.innerHTML = "";
                pictureImage.appendChild(img);
            });
            reader.readAsDataURL(file);
        } else {
            pictureImage.innerHTML = pictureImageTxt;
        }
    });
});
