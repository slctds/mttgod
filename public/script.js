let currentUser = null;
let correctAnswers = 0;
let incorrectAnswers = 0;
const protocol = window.location.protocol;
const host = window.location.hostname;
const port = window.location.port;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    document.getElementById('main-menu').style.display = 'block';

    disableButtons();

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

function navigateTo(page) {
    if (!isAuthenticated && page !== 'main') return;

    console.log(`Navigating to ${page}`);
    document.querySelectorAll('.container').forEach(container => {
        container.style.display = 'none';
    });

    if (page === 'ranges') {
        currentImageType = 'ranges';
        document.getElementById('ranges-menu').style.display = 'block';
        loadDiapButtons('ranges-grid', 'all');
    } else if (page === 'main') {
        document.getElementById('main-menu').style.display = 'block';
        if (isAuthenticated) {
            document.getElementById('stats-button').style.display = 'block';
        }
    } else if (page === 'stats') {
        document.getElementById('stats-menu').style.display = 'block';
        loadStats();
    } else if (page === 'study') {
        document.getElementById('study-menu').style.display = 'block';
    } else if (page === 'basic') {
        currentImageType = 'ranges';
        document.getElementById('basic-menu').style.display = 'block';
        loadDiapButtons('basic-grid', 'basic');
    } else if (page === 'boundaries') {
        currentImageType = 'ranges';
        document.getElementById('boundaries-menu').style.display = 'block';
        loadDiapButtons('boundaries-grid', 'boundaries');
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
        currentImageType = 'equity';
        document.getElementById('equity-menu').style.display = 'block';
        loadEquityButtons('equity-grid');
    } else if (page === 'equity-study') {
        currentImageType = 'equity';
        document.getElementById('equity-study-menu').style.display = 'block';
        loadEquityButtons('equity-grid');
    }
}

function loadDiapButtons(gridId, type) {
    console.log(`Loading diap buttons for ${type}`);
    fetch(`${protocol}//${host}:${port}/api/images`)
        .then(response => response.json())
        .then(files => {
            console.log('Files received from server for diap:', files);
            if (!Array.isArray(files)) {
                console.error('Expected an array of files');
                return;
            }

            let filteredFiles;
            if (type === 'basic') {
                filteredFiles = files.filter(file => file.split('.')[0].length === 2);
            } else if (type === 'boundaries') {
                filteredFiles = files.filter(file => file.split('.')[0].length > 2);
            } else {
                filteredFiles = files;
            }

            currentImageList = filteredFiles;
            const buttonGrid = document.getElementById(gridId);
            buttonGrid.innerHTML = '';

            filteredFiles.forEach((file, index) => {
                const button = document.createElement('button');
                button.className = 'range-button';
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

function loadEquityButtons(gridId) {
    console.log('Loading equity buttons');
    fetch(`${protocol}//${host}:${port}/api/eq-images`)
        .then(response => response.json())
        .then(files => {
            console.log('Equity files received from server:', files);
            if (!Array.isArray(files)) {
                console.error('Expected an array of files');
                return;
            }

            currentImageList = files;
            const buttonGrid = document.getElementById(gridId);
            buttonGrid.innerHTML = '';

            files.forEach((file, index) => {
                const button = document.createElement('button');
                button.className = 'equity-button';
                button.textContent = file.split('.')[0];
                button.addEventListener('click', () => {
                    console.log(`Button clicked: ${button.textContent}`);
                    displayImage(index);
                });
                buttonGrid.appendChild(button);
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
    const imageNameWithoutExtension = imageFileName.split('.')[0];
    const folder = currentImageType === 'ranges' ? '50bb' : 'eq';
    console.log(`Displaying image from folder ${folder}: ${imageFileName}`);
    displayedImage.src = `${folder}/${imageFileName}`;
    imageName.textContent = imageNameWithoutExtension;
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
            isAuthenticated = true;
            currentUser = username; // Сохраняем имя пользователя после успешного входа
            enableButtons();
            document.getElementById('stats-button').style.display = 'block';
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
            isAuthenticated = true;
            currentUser = username; // Сохраняем имя пользователя после успешной регистрации
            enableButtons();
            document.getElementById('stats-button').style.display = 'block';
            closeLoginModal();
        } else {
            alert('Registration failed: ' + data.message);
        }
    });
}

function loadStats() {
    if (!currentUser) {
        console.error('User is not logged in');
        return;
    }

    fetch(`${protocol}//${host}:${port}/api/stats?username=${currentUser}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let tableContent = `
                    <table class="stats-table">
                        <tr>
                            <th>Дата</th>
                            <th>Всего</th>
                            <th>Верно</th>
                            <th>Процент</th>
                        </tr>`;
                
                data.stats.forEach(row => {
                    tableContent += `
                        <tr>
                            <td>${row.date}</td>
                            <td>${row.totalAnswers}</td>
                            <td>${row.correctAnswers}</td>
                            <td>${row.percentage.toFixed(2)}%</td>
                        </tr>`;
                });

                tableContent += '</table>';
                document.getElementById('stats-content').innerHTML = tableContent;
            } else {
                document.getElementById('stats-content').innerHTML = '<p>Ошибка при загрузке статистики</p>';
            }
        })
        .catch(error => {
            console.error('Error loading stats:', error);
            document.getElementById('stats-content').innerHTML = '<p>Ошибка при загрузке статистики</p>';
        });
}

function startTest() {
    fetch(`${protocol}//${host}:${port}/api/images`)
        .then(response => response.json())
        .then(files => {
            console.log('Files received from server for test:', files);
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
    const username = currentUser; // Используем текущего пользователя

    fetch(`${protocol}//${host}:${port}/api/record-test`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            correctAnswers: correctAnswers,
            incorrectAnswers: incorrectAnswers
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`Тест завершен. Правильных: ${correctAnswers}, Неправильных: ${incorrectAnswers}`);
            navigateTo('main');
            correctAnswers = 0;
            incorrectAnswers = 0;
            document.getElementById('score').textContent = `Правильных: 0 | Неправильных: 0`;
        } else {
            alert('Ошибка при записи результатов теста');
        }
    })
    .catch(error => {
        console.error('Error recording test results:', error);
        alert('Ошибка при записи результатов теста');
    });
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
