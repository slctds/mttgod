let currentImageIndex = 0;
let currentImageList = [];
let correctAnswers = 0;
let incorrectAnswers = 0;
let isAuthenticated = false; // Флаг для отслеживания состояния авторизации

// Определяем текущий протокол и домен
const protocol = window.location.protocol;
const host = window.location.hostname;
const port = protocol === 'https:' ? 3443 : 3001; // Если HTTPS, используем порт 3443, иначе 3000

function navigateTo(page) {
    if (!isAuthenticated && page !== 'main') return; // Блокировать навигацию, если пользователь не авторизован

    console.log(`Navigating to ${page}`);
    // Скрываем все контейнеры
    document.querySelectorAll('.container').forEach(container => {
        container.style.display = 'none';
    });

    // Показываем выбранный контейнер
    if (page === 'ranges') {
        document.getElementById('ranges-menu').style.display = 'block';
        loadButtons('ranges-grid', 'ranges');
    } else if (page === 'main') {
        document.getElementById('main-menu').style.display = 'block';
    } else if (page === 'study') {
        document.getElementById('study-menu').style.display = 'block';
    } else if (page === 'basic') {
        document.getElementById('basic-menu').style.display = 'block';
        loadButtons('basic-grid', 'basic');
    } else if (page === 'boundaries') {
        document.getElementById('boundaries-menu').style.display = 'block';
        loadButtons('boundaries-grid', 'boundaries');
    } else if (page === 'test') {
        document.getElementById('test-menu').style.display = 'block';
    } else if (page === 'testByImage') {
        document.getElementById('test-by-image-menu').style.display = 'block';
    } else if (page === 'testByNumber') {
        console.log('Test by Number');
    } else if (page === 'testByHands') {
        console.log('Test by Hands');
    } else if (page === 'imageTest') {
        document.getElementById('image-test-menu').style.display = 'block';
    } else if (page === 'equity') {
        document.getElementById('equity-menu').style.display = 'block';
    } else if (page === 'equity-study') {
        document.getElementById('equity-study-menu').style.display = 'block';
        loadEquityButtons();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    document.getElementById('main-menu').style.display = 'block';

    disableButtons(); // Деактивировать кнопки при загрузке страницы

    const imageViewer = document.getElementById('image-viewer');
    let startX = 0;

    imageViewer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    imageViewer.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        if (endX < startX - 50) {
            showNextImage();
        } else if (endX > startX + 50) {
            showPreviousImage();
        } else {
            closeImage();
        }
    });
});

function loadButtons(gridId, type) {
    console.log(`Loading buttons for ${type}`);
    fetch(`${protocol}//${host}:${port}/api/images`)
        .then(response => response.json())
        .then(files => {
            if (!Array.isArray(files)) {
                console.error('Expected an array of files');
                return;
            }

            let filteredFiles;
            if (type === 'basic') {
                filteredFiles = files.filter(file => file.split('.')[0].length === 2);
            } else if (type === 'boundaries') {
                filteredFiles = files.filter(file => file.split('.')[0].length > 2);
            } else if (type === 'ranges') {
                filteredFiles = files;
            }

            currentImageList = filteredFiles;
            const buttonGrid = document.getElementById(gridId);
            buttonGrid.innerHTML = '';

            filteredFiles.forEach((file, index) => {
                const button = document.createElement('button');
                button.className = type === 'ranges' ? 'range-button' : 'study-button';
                button.textContent = file.split('.')[0];
                button.addEventListener('click', () => {
                    console.log(`Button clicked: ${button.textContent}`);
                    displayImage(index);
                });
                buttonGrid.appendChild(button);
            });
        })
        .catch(error => console.error('Error loading images:', error));
}

function loadEquityButtons() {
    fetch(`${protocol}//${host}:${port}/api/eq-images`)
        .then(response => response.json())
        .then(files => {
            const equityGrid = document.getElementById('equity-grid');
            equityGrid.innerHTML = '';

            files.forEach(file => {
                const button = document.createElement('button');
                button.className = 'equity-button';
                const fileName = file.split('.')[0];
                if (fileName.includes('-')) {
                    const [X, Y] = fileName.split('-');
                    button.textContent = `vs ${X} & ${Y}`;
                } else {
                    button.textContent = `vs ${fileName}`;
                }
                button.addEventListener('click', () => {
                    console.log(`Button clicked: ${button.textContent}`);
                    displayEquityImage(fileName);
                });
                equityGrid.appendChild(button);
            });
        })
        .catch(error => console.error('Error loading equity images:', error));
}

function displayImage(index) {
    console.log(`Displaying image at index ${index}`);
    currentImageIndex = index;
    const imageViewer = document.getElementById('image-viewer');
    const overlay = document.getElementById('overlay');
    const displayedImage = document.getElementById('displayed-image');
    const imageName = document.getElementById('image-name');
    const imageFileName = currentImageList[index];
    if (!imageFileName) {
        console.error('No image file found at the given index');
        return;
    }
    const imageNameWithoutExtension = imageFileName.split('.')[0];
    displayedImage.src = `50bb/${imageFileName}`;
    imageName.textContent = imageNameWithoutExtension;
    imageViewer.style.display = 'flex';
    overlay.style.display = 'block';
    disableButtons();
}

function displayEquityImage(fileName) {
    console.log(`Displaying equity image: ${fileName}`);
    const imageViewer = document.getElementById('image-viewer');
    const overlay = document.getElementById('overlay');
    const displayedImage = document.getElementById('displayed-image');
    const imageName = document.getElementById('image-name');
    displayedImage.src = `eq/${fileName}.png`;
    imageName.textContent = fileName;
    imageViewer.style.display = 'flex';
    overlay.style.display = 'block';
    disableButtons();
}

function closeImage() {
    console.log('Closing image');
    const imageViewer = document.getElementById('image-viewer');
    const overlay = document.getElementById('overlay');
    imageViewer.style.display = 'none';
    const displayedImage = document.getElementById('displayed-image');
    displayedImage.src = '';
    overlay.style.display = 'none';

    setTimeout(() => {
        enableButtons();
    }, 500);
}

function showNextImage() {
    console.log('Showing next image');
    currentImageIndex = (currentImageIndex + 1) % currentImageList.length;
    displayImage(currentImageIndex);
}

function showPreviousImage() {
    console.log('Showing previous image');
    currentImageIndex = (currentImageIndex - 1 + currentImageList.length) % currentImageList.length;
    displayImage(currentImageIndex);
}

function disableButtons() {
    console.log('Disabling buttons');
    const buttons = document.querySelectorAll('.app-button');
    buttons.forEach(button => {
        if (button.id !== 'login-button' && !button.classList.contains('no-function-button')) {
            button.classList.add('disabled');
            button.disabled = true;
        }
    });
}

function enableButtons() {
    console.log('Enabling buttons');
    const buttons = document.querySelectorAll('.app-button');
    buttons.forEach(button => {
        if (!button.classList.contains('no-function-button')) {
            button.classList.remove('disabled');
            button.disabled = false;
        }
    });
}

function startTest() {
    fetch(`${protocol}//${host}:${port}/api/images`)
        .then(response => response.json())
        .then(files => {
            if (!Array.isArray(files)) {
                console.error('Expected an array of files');
                return;
            }

            currentImageList = files;
            const basicSwitch = document.getElementById('basic-switch').checked;
            const boundariesSwitch = document.getElementById('boundaries-switch').checked;
            let imagesToUse = [];

            console.log('Files:', files);

            if (basicSwitch && boundariesSwitch) {
                imagesToUse = currentImageList;
            } else if (basicSwitch) {
                imagesToUse = currentImageList.filter(file => file.split('.')[0].length === 2);
            } else if (boundariesSwitch) {
                imagesToUse = currentImageList.filter(file => file.split('.')[0].length > 2);
            }

            console.log('Images to use:', imagesToUse);

            if (imagesToUse.length === 0) {
                alert('Нет доступных изображений для выбранных настроек.');
                return;
            }

            navigateTo('imageTest');
            loadNextTestImage(imagesToUse);
        })
        .catch(error => console.error('Error loading images:', error));
}

function loadNextTestImage(imagesToUse) {
    if (!imagesToUse.length) {
        console.error('No images to use for the test');
        return;
    }
    const randomIndex = Math.floor(Math.random() * imagesToUse.length);
    const selectedImage = imagesToUse[randomIndex];
    if (!selectedImage) {
        console.error('No image selected for the test');
        return;
    }
    const imageNameWithoutExtension = selectedImage.split('.')[0];
    const imageElement = document.getElementById('test-image');
    imageElement.src = `50bb/${selectedImage}`;

    const answerButtonsContainer = document.getElementById('answer-buttons');
    answerButtonsContainer.innerHTML = '';

    const possibleAnswers = generatePossibleAnswers(imageNameWithoutExtension, imagesToUse);

    possibleAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.onclick = () => checkAnswer(button, answer, imageNameWithoutExtension, imagesToUse);
        answerButtonsContainer.appendChild(button);
    });
}

function generatePossibleAnswers(correctAnswer, imagesToUse) {
    const answers = [correctAnswer];
    const filteredImages = imagesToUse.map(file => file.split('.')[0]);
    while (answers.length < 6) {
        const randomIndex = Math.floor(Math.random() * filteredImages.length);
        const randomAnswer = filteredImages[randomIndex];
        if (!answers.includes(randomAnswer)) {
            answers.push(randomAnswer);
        }
    }
    return shuffleArray(answers);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function checkAnswer(button, selectedAnswer, correctAnswer, imagesToUse) {
    if (selectedAnswer === correctAnswer) {
        button.classList.add('correct');
        correctAnswers++;
    } else {
        button.classList.add('incorrect');
        incorrectAnswers++;
    }

    document.getElementById('score').textContent = `Правильных: ${correctAnswers} | Неправильных: ${incorrectAnswers}`;

    setTimeout(() => {
        loadNextTestImage(imagesToUse);
    }, 1000);
}

function endTest() {
    alert(`Тест завершен. Правильных: ${correctAnswers}, Неправильных: ${incorrectAnswers}`);
    navigateTo('main');
    correctAnswers = 0;
    incorrectAnswers = 0;
    document.getElementById('score').textContent = `Правильных: 0 | Неправильных: 0`;
}

// Функции для работы с модальным окном авторизации/регистрации
function openLoginModal() {
    document.getElementById('modal-title').textContent = 'Login';
    document.getElementById('confirm-password-label').style.display = 'none';
    document.getElementById('confirm-password').style.display = 'none';
    document.getElementById('login-button').style.display = 'inline-block';
    document.getElementById('register-button').style.display = 'inline-block';
    document.getElementById('submit-register-button').style.display = 'none';
    document.getElementById('login-modal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('modal-title').textContent = 'Register';
    document.getElementById('confirm-password-label').style.display = 'block';
    document.getElementById('confirm-password').style.display = 'block';
    document.getElementById('login-button').style.display = 'none';
    document.getElementById('register-button').style.display = 'none';
    document.getElementById('submit-register-button').style.display = 'inline-block';
}

function submitLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch(`${protocol}//${host}:${port}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Login successful');
            isAuthenticated = true; // Пользователь авторизован
            enableButtons(); // Активировать кнопки
            closeLoginModal();
        } else {
            alert('Login failed: ' + data.message);
        }
    });
}

function submitRegister() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    fetch(`${protocol}//${host}:${port}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Registration successful');
            isAuthenticated = true; // Пользователь авторизован после регистрации
            enableButtons(); // Активировать кнопки
            closeLoginModal();
        } else {
            alert('Registration failed: ' + data.message);
        }
    });
}
