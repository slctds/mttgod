let currentImageIndex = 0;
let currentImageList = [];
let correctAnswers = 0;
let incorrectAnswers = 0;

// Определяем текущий протокол и домен
const protocol = window.location.protocol;
const host = window.location.hostname;
const port = protocol === 'https:' ? 3443 : 3000; // Если HTTPS, используем порт 3443, иначе 3000

function navigateTo(page) {
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
                button.className = 'range-button'; // Исправлено на range-button
                button.textContent = file.split('.')[0];
                button.addEventListener('click', () => {
                    console.log(`Button clicked: ${button.textContent}`);
                    displayImage(index, currentImageList, '50bb');
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
            currentImageList = files; // Добавим это для использования в displayImage
            const equityGrid = document.getElementById('equity-grid');
            equityGrid.innerHTML = '';

            files.forEach((file, index) => {
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
                    displayImage(index, currentImageList, 'eq');
                });
                equityGrid.appendChild(button);
            });
        })
        .catch(error => console.error('Error loading equity images:', error));
}

function displayImage(index, imageList, folder) {
    console.log(`Displaying image at index ${index}`);
    currentImageIndex = index;
    currentImageList = imageList;
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
    displayImage(currentImageIndex, currentImageList, '50bb');
}

function showPreviousImage() {
    console.log('Showing previous image');
    currentImageIndex = (currentImageIndex - 1 + currentImageList.length) % currentImageList.length;
    displayImage(currentImageIndex, currentImageList, '50bb');
}

function disableButtons() {
    console.log('Disabling buttons');
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.classList.add('disabled');
    });
}

function enableButtons() {
    console.log('Enabling buttons');
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.classList.remove('disabled');
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
