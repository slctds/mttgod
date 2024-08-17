let currentUser = null;
let currentTestFile = '';
let currentHand = '';
let currentCell = '';
let correctAnswers = 0;
let incorrectAnswers = 0;
let previousHand = '';
let previousCorrectAnswer = '';
const protocol = window.location.protocol;
const host = window.location.hostname;
const port = window.location.port;
let questionsAnswerCountHH50 = 0;
let wrongAnswersCountHH50 = 0;
let rightAnswersCountHH50 = 0;

let currentTestType = ''; // Переменная для хранения текущего типа теста

let handsHH50 = [];
let possibleAnswerHH50 = [];
let wrongAnswerHH50 = [];
let correctAnswersCountHH50 = 0;
let incorrectAnswersCountHH50 = 0;
let currentHandHH50 = null;
let lastQuestionInfoHH50 = '';
let selectedRangesHH50 = [];

let isTestEnded = false;  // Глобальный флаг для предотвращения повторной записи


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

    // Инициализация кнопок и событий для теста HH50
    const startButtonHH50 = document.getElementById('start-test-buttonHH50');
    if (startButtonHH50) {
        startButtonHH50.addEventListener('click', () => {
            console.log('Кнопка старт теста HH50 нажата');
            startTestHH50();
        });
    } else {
        console.error('Кнопка start-test-buttonHH50 не найдена');
    }


    const endButtonHH50 = document.getElementById('end-test-buttonHH50');
    if (endButtonHH50) {
        endButtonHH50.addEventListener('click', endTestHH50);
    } else {
        console.error('Кнопка end-test-buttonHH50 не найдена');
    }

    const retryButtonHH50 = document.getElementById('retry-errors-buttonHH50');
    if (retryButtonHH50) {
        retryButtonHH50.addEventListener('click', startErrorsTestHH50);
    } else {
        console.error('Кнопка retry-errors-buttonHH50 не найдена');
    }

    const eyeButtonHH50 = document.getElementById('eye-buttonHH50');
    if (eyeButtonHH50) {
        eyeButtonHH50.addEventListener('click', () => {
            alert("Функция для этой кнопки еще не реализована");
        });
    } else {
        console.error('Кнопка eye-buttonHH50 не найдена');
    }

    // Инициализация кнопок и событий для теста диапазонов DP50
    const finishButtonDP50 = document.querySelector('.app-button.end-button');
    if (finishButtonDP50) {
        // Удаляем предыдущий обработчик, если он был, чтобы избежать дублирования
        finishButtonDP50.removeEventListener('click', endTestDiap);
        // Привязываем обработчик для завершения теста DP50
        finishButtonDP50.addEventListener('click', endTestDiap);
    } else {
        console.error('Кнопка завершения теста не найдена!');
    }

    // Аналогичные действия для других тестов
    const finishButtonEQ = document.querySelector('.app-button.end-button');
    if (finishButtonEQ) {
        finishButtonEQ.removeEventListener('click', endEquityTest);
        finishButtonEQ.addEventListener('click', endEquityTest);
    } else {
        console.error('Кнопка завершения теста не найдена!');
    }


    const checkboxesHH50 = document.querySelectorAll('.range-checkbox');
    console.log(`Найдено чекбоксов для HH50: ${checkboxesHH50.length}`);


    updateSelectedRangesHH50();
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
        currentTestType = 'DP50';
        document.getElementById('test-by-image-menu').style.display = 'block';
    } else if (page === 'testByNumber') {
        console.log('Test by Number');
    } else if (page === 'testByHands') {
        console.log('Navigating to Test by Hands');
        document.getElementById('main-menuHH50').style.display = 'block';
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
    } else if (page === 'equity-test') {
        currentTestType = 'testEQ';
        document.getElementById('equity-test-menu').style.display = 'block';
        loadEquityTestButtons();
    } else if (page === 'equity-test-question') {
        document.getElementById('equity-test-question-menu').style.display = 'block';
    }
}

function updateSelectedRangesHH50() {
    console.log("Функция updateSelectedRangesHH50 вызвана");
    const ranges = ['1-25', '26-50', '51-75', '76-100'];
    selectedRangesHH50 = [];

    ranges.forEach(range => {
        const switchElement = document.getElementById(`range-switch-${range}`);
        if (switchElement) {
            const isChecked = switchElement.checked;
            if (isChecked) {
                selectedRangesHH50.push(range);
                console.log(`Выбран диапазон: ${range}`);
            }
        } else {
            console.error(`Переключатель с ID range-switch-${range} не найден`);
        }
    });

    ranges.forEach(range => {
        const switchElement = document.getElementById(`range-switch-${range}`);
        if (switchElement) {
            const isChecked = switchElement.checked;
            console.log(`Переключатель ${range} ${isChecked ? 'включен' : 'выключен'}`);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const switchesHH50 = document.querySelectorAll('.switch input[type="checkbox"]');
    switchesHH50.forEach(switchElement => {
        switchElement.addEventListener('change', updateSelectedRangesHH50);
    });

    updateSelectedRangesHH50(); // Инициализация выбранных диапазонов при загрузке страницы
});



function startTestHH50() {
    console.log("Функция startTestHH50 вызвана");
    isTestEnded = false;

    // Сброс счетчиков при запуске теста
    questionsAnswerCountHH50 = 0;
    wrongAnswersCountHH50 = 0;
    rightAnswersCountHH50 = 0;

    if (selectedRangesHH50.length === 0) {
        alert('Пожалуйста, выберите хотя бы один диапазон для теста.');
        return;
    }

    console.log('Отправка запроса на старт теста по URL: /api/byhands/start-test');
    fetch('/api/byhands/start-test', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Ответ от сервера получен');
        return response.json();
    })
    .then(data => {
        console.log('Обработка данных от сервера', data);
        if (data.success) {
            console.log('Тест успешно начат');
            document.getElementById('main-menuHH50').style.display = 'none';
            document.getElementById('test-menuHH50').style.display = 'block';

            // Заполняем массив handsHH50 объектами с полями hand и value
            handsHH50 = data.hands.map((hand, index) => ({
                hand: hand.trim(), // убираем лишние пробелы
                value: data.procentValues[index]
            }));
            console.log("Массив handsHH50 заполнен объектами:", handsHH50);

            // Заполняем массив possibleAnswerHH50 уникальными значениями из procent
            possibleAnswerHH50 = Array.from(new Set(data.procentValues));
            console.log("Массив possibleAnswerHH50 заполнен значениями:", possibleAnswerHH50);

            nextQuestionHH50();
        } else {
            console.error('Ошибка при запуске теста:', data.message);
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
}




function startErrorsTestHH50() {
    console.log("Функция startErrorsTestHH50 вызвана");

    if (wrongAnswerHH50.length === 0) {
        alert('Нет ошибок для повторения.');
        return;
    }

    handsHH50 = [...wrongAnswerHH50];
    wrongAnswerHH50 = [];

    correctAnswersCountHH50 = 0;
    incorrectAnswersCountHH50 = 0;
    updateIncorrectHandsDisplayHH50();

    document.getElementById('main-menuHH50').style.display = 'none';
    document.getElementById('test-menuHH50').style.display = 'block';
    console.log('Переключение на тест меню завершено');
    nextQuestionHH50(); 
}

function nextQuestionHH50() {
    console.log("Функция nextQuestionHH50 вызвана");
    if (handsHH50.length === 0) {
        console.warn('Нет доступных рук для вопросов.');
        return;
    }

    let randomIndex, selectedHand, correctValue;
    let attempts = 0;

    do {
        randomIndex = Math.floor(Math.random() * handsHH50.length);
        selectedHand = handsHH50[randomIndex].hand;
        correctValue = handsHH50[randomIndex].value;
        console.log(`Проверка выбранной руки в nextQuestionHH50: ${selectedHand}, значение: ${correctValue}`);
        attempts++;
    } while (!isInSelectedRanges(correctValue) && attempts < 10);

    if (!isInSelectedRanges(correctValue)) {
        console.warn('Нет доступных вопросов в выбранных диапазонах.');
        alert('Нет доступных вопросов в выбранных диапазонах.');
        return;
    }

    currentHandHH50 = selectedHand;
    currentCorrectValueHH50 = correctValue;

    // Увеличиваем счетчик общего количества вопросов
    questionsAnswerCountHH50++;
    console.log(`Задано вопросов: ${questionsAnswerCountHH50}`);

    console.log('Следующий вопрос выбран в nextQuestionHH50:', selectedHand, correctValue);

    displayQuestionHH50(selectedHand, correctValue);
}


function isInSelectedRanges(value) {
    console.log(`Проверка диапазонов для значения: ${value}`);
    for (let range of selectedRangesHH50) {
        const [min, max] = range.split('-').map(Number);
        if (value >= min && value <= max) {
            console.log(`Значение ${value} входит в диапазон ${range}`);
            return true;
        }
    }
    console.log(`Значение ${value} не входит в выбранные диапазоны`);
    return false;
}

function displayQuestionHH50(hand, correctValue) {
    console.log("Функция displayQuestionHH50 вызвана, hand:", hand, "correctValue:", correctValue);
    const answersContainer = document.getElementById('answersHH50');
    answersContainer.innerHTML = ''; // Очищаем контейнер перед генерацией новых кнопок

    console.log("Перед генерацией вариантов ответа массив possibleAnswerHH50:", possibleAnswerHH50);

    const options = generateOptionsHH50(correctValue);
    console.log("Варианты ответа сгенерированы в displayQuestionHH50:", options);

    if (options.length === 0) {
        console.error("Ошибка: массив options пуст!");
        alert("Произошла ошибка при генерации вариантов ответа. Пожалуйста, попробуйте снова.");
        return;
    }

    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('answer-buttonHH50');
        button.addEventListener('click', () => checkAnswerHH50(button, option));
        answersContainer.appendChild(button);
    });

    document.getElementById('questionHH50').textContent = `На границе какого диапазона находится рука ${hand}?`;
    console.log("Вопрос отображен в displayQuestionHH50:", `На границе какого диапазона находится рука ${hand}?`);
}




function checkAnswerHH50(button, selectedAnswer) {
    console.log("Функция checkAnswerHH50 вызвана с ответом:", selectedAnswer);

    // Отключаем все кнопки, чтобы предотвратить множественные клики
    const answerButtons = document.querySelectorAll('.answer-buttonHH50');
    answerButtons.forEach(btn => btn.disabled = true);

    let isCorrect = false;

    if (selectedAnswer == currentCorrectValueHH50) {
        button.classList.add('correctHH50');
        correctAnswersCountHH50++;
        rightAnswersCountHH50++;
        lastQuestionInfoHH50 = `Да, ${currentHandHH50} входит в ${currentCorrectValueHH50}%`;
        console.log(`Ответ правильный: ${selectedAnswer}`);
        isCorrect = true;
    } else {
        button.classList.add('incorrectHH50');
        incorrectAnswersCountHH50++;
        wrongAnswersCountHH50++;
        lastQuestionInfoHH50 = `Нет, ${currentHandHH50} это ${currentCorrectValueHH50}%`;
        wrongAnswerHH50.push({ hand: currentHandHH50, value: currentCorrectValueHH50 });
        updateIncorrectHandsDisplayHH50();
        console.log(`Ответ неправильный: ${selectedAnswer}, правильный ответ: ${currentCorrectValueHH50}`);
    }

    // Обновляем счетчики на экране перед переходом к следующему вопросу
    document.getElementById('correct-countHH50').textContent = `Верно - ${correctAnswersCountHH50} Неверно - ${incorrectAnswersCountHH50}`;
    document.getElementById('last-question-infoHH50').textContent = lastQuestionInfoHH50;
    console.log("Счетчики обновлены:", `Верно - ${correctAnswersCountHH50} Неверно - ${incorrectAnswersCountHH50}`);

    setTimeout(() => {
        // Переход к следующему вопросу или повтор вопроса
        if (isCorrect) {
            console.log("Переход к следующему вопросу");
            nextQuestionHH50();
        } else {
            console.log("Повтор вопроса с неправильным ответом");
            // Кнопки не обновляются при неправильном ответе
            answerButtons.forEach(btn => btn.disabled = false);
        }
    }, 1000);
}




function generateOptionsHH50(correctValue) {
    console.log("Функция generateOptionsHH50 вызвана");

    const validOptions = possibleAnswerHH50.filter(option => {
        return selectedRangesHH50.some(range => {
            const [min, max] = range.split('-').map(Number);
            return option >= min && option <= max;
        });
    });

    let options = [];
    const correctIndex = validOptions.indexOf(correctValue);

    if (correctIndex > 0) {
        options.push(validOptions[correctIndex - 1]);
    }
    options.push(correctValue);
    if (correctIndex < validOptions.length - 1) {
        options.push(validOptions[correctIndex + 1]);
    }

    while (options.length < 6) {
        const randomOption = validOptions[Math.floor(Math.random() * validOptions.length)];
        if (!options.includes(randomOption)) {
            options.push(randomOption);
        }
    }

    console.log("Варианты ответа сгенерированы:", options);
    return shuffleArrayHH50(options);
}

function shuffleArrayHH50(array) {
    console.log("Функция shuffleArrayHH50 вызвана");
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateIncorrectHandsDisplayHH50() {
    console.log("Функция updateIncorrectHandsDisplayHH50 вызвана");
    const incorrectHandsDisplay = document.getElementById('incorrect-handsHH50');
    incorrectHandsDisplay.textContent = 'Ошибки: ' + wrongAnswerHH50.map(item => item.hand).join(', ');
    console.log("Обновлен список ошибок:", wrongAnswerHH50.map(item => item.hand));
}

function endTestHH50() {
    console.log("Функция endTestHH50 вызвана");

    // Подготовка данных для отправки
    const correctAnswers = rightAnswersCountHH50; // Количество правильных ответов
    const incorrectAnswers = wrongAnswersCountHH50; // Количество неправильных ответов
    const testName = 'HH50'; // Идентификатор теста HH50

    console.log("Подготовленные данные для записи:", { correctAnswers, incorrectAnswers, testName });

    // Вызов функции endTest для записи в базу данных
    endTest(correctAnswers, incorrectAnswers, testName);

    // Сброс всех массивов и счетчиков после сохранения результатов
    handsHH50 = [];
    possibleAnswerHH50 = [];
    wrongAnswerHH50 = [];
    correctAnswersCountHH50 = 0;
    incorrectAnswersCountHH50 = 0;
    questionsAnswerCountHH50 = 0;
    wrongAnswersCountHH50 = 0;
    rightAnswersCountHH50 = 0;
    currentHandHH50 = null;
    lastQuestionInfoHH50 = '';
    selectedRangesHH50 = [];

    console.log("Все массивы и счетчики сброшены");

    // Очистка отображаемых данных
    document.getElementById('main-menuHH50').style.display = 'none';
    document.getElementById('test-menuHH50').style.display = 'none';
    document.getElementById('answersHH50').innerHTML = '';
    document.getElementById('questionHH50').textContent = '';
    document.getElementById('correct-countHH50').textContent = '';
    document.getElementById('last-question-infoHH50').textContent = '';
    document.getElementById('incorrect-handsHH50').textContent = '';

    // Переход на главную страницу
    document.getElementById('main-menu').style.display = 'block';
    console.log("Переход на главную страницу завершен");
}



function saveTestResultsHH50() {
    return new Promise((resolve, reject) => {
        const username = currentUser;
        const correctAnswers = rightAnswersCountHH50;
        const incorrectAnswers = wrongAnswersCountHH50;
        const timestamp = new Date().toISOString();
        const testName = 'HH50';

        console.log('Передаваемые данные:', {
            username,
            correctAnswers,
            incorrectAnswers,
            timestamp,
            testName
        });

        fetch('/api/save-test-results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                correct_answer: correctAnswers,
                incorrect_answer: incorrectAnswers,
                timestamp: timestamp,
                test_name: testName
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Результаты теста успешно сохранены');
                resolve();
            } else {
                console.error('Ошибка при сохранении результатов теста:', data.message);
                reject(new Error('Ошибка при сохранении результатов теста'));
            }
        })
        .catch(error => {
            console.error('Ошибка при сохранении результатов теста:', error);
            reject(error);
        });
    });
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
                filteredFiles = files.filter(file => {
                    const name = file.split('.')[0];
                    return name.length === 1 || name.length === 2;
                });
            } else if (type === 'boundaries') {
                filteredFiles = files.filter(file => {
                    const name = file.split('.')[0];
                    return name.length >= 3;
                });
            } else {
                filteredFiles = files;
            }

            // Сортировка по числовому значению
            filteredFiles.sort((a, b) => {
                const aName = a.split('.')[0];
                const bName = b.split('.')[0];

                // Преобразуем строку в число для сравнения
                const aNumber = parseInt(aName.replace(/\D/g, ''), 10);
                const bNumber = parseInt(bName.replace(/\D/g, ''), 10);

                // Если числа равны, учитываем длину строки (на случай диапазонов типа "A2" и "A10")
                if (aNumber === bNumber) {
                    return aName.length - bName.length;
                }
                return aNumber - bNumber;
            });

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

function loadEquityTestButtons() {
    console.log('Loading equity test buttons');
    fetch(`${protocol}//${host}:${port}/api/eqtest-files`)
        .then(response => response.json())
        .then(files => {
            console.log('Equity test files received from server:', files);
            if (!Array.isArray(files)) {
                console.error('Expected an array of files');
                return;
            }

            const buttonGrid = document.getElementById('equity-test-grid');
            buttonGrid.innerHTML = '';

            files.forEach((file) => {
                if (file === 'hands.xlsx') {
                    return; // Пропустить создание кнопки для этого файла
                }

                const button = document.createElement('button');
                button.className = 'equity-test-button';
                const fileNameWithoutExtension = file.split('.')[0];

                if (fileNameWithoutExtension.length <= 2) {
                    button.textContent = `vs ${fileNameWithoutExtension}`;
                    button.dataset.testType = `EQ${fileNameWithoutExtension}`; // Присвоение правильного идентификатора
                } else {
                    const [X, Y] = fileNameWithoutExtension.split('-');
                    button.textContent = `vs ${X}&${Y}`;
                    button.dataset.testType = `testDIAP${fileNameWithoutExtension}`; // Присвоение правильного идентификатора
                }

                button.addEventListener('click', () => {
                    console.log(`Button clicked: ${button.textContent}`);
                    currentTestFile = fileNameWithoutExtension;
                    currentTestType = button.dataset.testType; // Установка типа теста
                    startEquityTest();
                });

                buttonGrid.appendChild(button);
            });
        })
        .catch(error => console.error('Error loading equity test files:', error));
}

function startEquityTest() {
    // Сбрасываем счетчики правильных и неправильных ответов
    correctAnswers = 0;
    incorrectAnswers = 0;

    // Формируем имя теста на основе имени файла
    const testName = `EQ${currentTestFile.split('.')[0]}`;  // Убираем расширение и добавляем префикс EQ

    // Сохраняем имя теста в переменной, если нужно использовать его в других функциях
    currentTestType = testName;

    console.log('Starting equity test with file:', currentTestFile);
    checkOrCreateTestRecord().then(() => {
        navigateTo('equity-test-question');
        generateEquityTestQuestion();
    });
}


function checkOrCreateTestRecord() {
    return fetch(`${protocol}//${host}:${port}/api/check-or-create-test`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: currentUser, testType: currentTestType })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Test record checked or created successfully');
        } else {
            console.error('Failed to check or create test record');
        }
    })
    .catch(error => console.error('Error checking or creating test record:', error));
}

function generateEquityTestQuestion() {
    fetch(`${protocol}//${host}:${port}/api/get-random-hand`)
        .then(response => response.json())
        .then(data => {
            currentHand = data.hand;
            currentCell = data.cell;
            console.log('Generated hand:', currentHand);
            displayEquityTestQuestion();
        })
        .catch(error => console.error('Error generating test question:', error));
}

function displayEquityTestQuestion() {
    const questionContainer = document.getElementById('test-question');
    questionContainer.innerHTML = `Сколько эквити у ${currentHand} против диапазона ${currentTestFile}%?`;

    const answerButtons = [
        '0-20', '21-25', '26-30', '31-35', '36-40',
        '41-45', '46-50', '51-60', '61-70', '71-100'
    ];

    const answerButtonsContainer = document.getElementById('answer-buttons-equity');
    answerButtonsContainer.className = 'answer-buttonsEquity';
    answerButtonsContainer.innerHTML = '';

    answerButtons.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'equity-answer-button';
        button.textContent = answer;
        button.addEventListener('click', () => checkEquityAnswer(button, answer));
        answerButtonsContainer.appendChild(button);
    });

    const eyeButton = document.createElement('button');
    eyeButton.className = 'equity-eye-button';
    eyeButton.innerHTML = '&#128065;'; // Значок глаза
    eyeButton.addEventListener('click', toggleEquityImage);
    answerButtonsContainer.appendChild(eyeButton);

    displayPreviousQuestionInfo();
}

function toggleEquityImage() {
    const imageViewer = document.getElementById('image-viewer-equity');
    const displayedImage = document.getElementById('displayed-equity-image');
    const overlay = document.getElementById('overlay-equity');
    if (imageViewer.style.display === 'none' || imageViewer.style.display === '') {
        displayedImage.src = `eq/${currentTestFile}.png`;
        imageViewer.style.display = 'flex';
        overlay.style.display = 'block';
        disableEquityButtons();
    } else {
        closeEquityImage();
    }
}

function closeEquityImage() {
    const imageViewer = document.getElementById('image-viewer-equity');
    const overlay = document.getElementById('overlay-equity');
    imageViewer.style.display = 'none';
    overlay.style.display = 'none';
    setTimeout(() => {
        enableEquityButtons();
    }, 200);
}

function disableEquityButtons() {
    const buttons = document.querySelectorAll('.equity-answer-button, .equity-eye-button');
    buttons.forEach(button => {
        button.disabled = true;
    });
}

function enableEquityButtons() {
    const buttons = document.querySelectorAll('.equity-answer-button, .equity-eye-button');
    buttons.forEach(button => {
        button.disabled = false;
    });
}

// Проверка ответа на эквити
function checkEquityAnswer(button, selectedAnswer) {
    fetch(`${protocol}//${host}:${port}/api/check-answer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hand: currentHand, range: currentTestFile, selectedAnswer, cell: currentCell })
    })
    .then(response => response.json())
    .then(data => {
        const selectedRange = selectedAnswer.split('-');
        const lowerBound = parseInt(selectedRange[0]);
        const upperBound = parseInt(selectedRange[1]);

        const isCorrect = data.correctAnswer >= lowerBound && data.correctAnswer <= upperBound;
        if (isCorrect) {
            correctAnswers++;
            button.classList.add('correct');
            console.log('Correct answer!');
        } else {
            incorrectAnswers++;
            button.classList.add('incorrect');
            console.log('Incorrect answer!');
        }
        console.log('Правильный ответ:', data.correctAnswer); // Вывод правильного ответа в терминал
        updateTestRecord(isCorrect);

        // Сохранение данных предыдущего вопроса
        previousHand = currentHand;
        previousCorrectAnswer = data.correctAnswer;

        setTimeout(() => {
            generateEquityTestQuestion();
        }, 1000);
    })
    .catch(error => console.error('Error checking answer:', error));
}

// Обновление записи теста
function updateTestRecord(isCorrect) {
    fetch(`${protocol}//${host}:${port}/api/update-test-record`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: currentUser, testType: currentTestType, isCorrect })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Test record updated successfully');
        } else {
            console.error('Failed to update test record');
        }
    })
    .catch(error => console.error('Error updating test record:', error));
}

function displayPreviousQuestionInfo() {
    const previousQuestionInfoContainer = document.getElementById('previous-question-info');
    if (previousHand && previousCorrectAnswer) {
        previousQuestionInfoContainer.innerHTML = `у ${previousHand} ${previousCorrectAnswer}% эквити против диапазона ${currentTestFile}%`;
    } else {
        previousQuestionInfoContainer.innerHTML = '';
    }
}

function endEquityTest() {
    // Проверяем, не завершен ли тест уже, чтобы избежать повторной записи
    if (isTestEnded) return;

    // Формируем имя теста на основе текущего файла, если это тест на эквити
    const testName = `EQ${currentTestFile.split('.')[0]}`;

    console.log("Завершаем тест эквити, данные для отправки:", {
        correctAnswers: correctAnswers,
        incorrectAnswers: incorrectAnswers,
        testName: testName
    });

    // Вызов функции записи результатов
    endTest(correctAnswers, incorrectAnswers, testName);

    // Устанавливаем флаг завершения теста
    isTestEnded = true;
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
                console.log('Stats data:', data);
                let tableContent = `
                    <table class="stats-table">
                        <tr>
                            <th>Дата</th>
                            <th>Тест</th>
                            <th>Всего</th>
                            <th>Верно</th>
                            <th>Процент</th>
                        </tr>`;

                data.stats.forEach((row, index) => {
                    const percentage = row.percentage != null ? row.percentage.toFixed(2) : 'N/A';
                    tableContent += `
                        <tr onclick="toggleStatDetails('${row.category}', 'stat-${index}')">
                            <td>Total</td>
                            <td class="${row.category.toLowerCase()}-button">${row.category}</td>
                            <td>${row.totalAnswers}</td>
                            <td>${row.correctAnswers}</td>
                            <td>${percentage}%</td>
                        </tr>
                        <tr id="stat-${index}" class="collapsible-content collapsed">
                            <td colspan="5">
                                <div id="stat-content-stat-${index}"></div>
                            </td>
                        </tr>`;
                });

                tableContent += '</table>';
                document.getElementById('stats-content').innerHTML = tableContent;
            } else {
                document.getElementById('stats-content').innerHTML = '<p>Ошибка при загрузке статистики</п>';
            }
        })
        .catch(error => {
            console.error('Error loading stats:', error);
            document.getElementById('stats-content').innerHTML = '<p>Ошибка при загрузке статистики</п>';
        });
}




function toggleStatDetails(category, elementId) {
    console.log(`Toggling stat details for ${category}, elementId: ${elementId}`);
    const contentElement = document.getElementById(`stat-content-${elementId}`);
    if (!contentElement) {
        console.error(`Element with id stat-content-${elementId} not found`);
        return;
    }

    if (category === 'EQ') {
        if (isStatsEQOpen) {
            contentElement.innerHTML = '';
            isStatsEQOpen = false;
            toggleCollapsibleContent(elementId);
        } else {
            loadStatsEQ(contentElement, elementId);
            isStatsEQOpen = true;
        }
    } else if (category === 'DP') {
        if (isStatsDPOpen) {
            contentElement.innerHTML = '';
            isStatsDPOpen = false;
            toggleCollapsibleContent(elementId);
        } else {
            loadStatsDP(contentElement, elementId);
            isStatsDPOpen = true;
        }
    } else if (category === 'HH50') {
        if (isStatsHH50Open) {  // Нужно добавить глобальную переменную isStatsHH50Open, чтобы отслеживать состояние открытия таблицы
            contentElement.innerHTML = '';
            isStatsHH50Open = false;
            toggleCollapsibleContent(elementId);
        } else {
            loadStatsHH50(contentElement, elementId);
            isStatsHH50Open = true;
        }
    } else {
        toggleCollapsibleContent(elementId);
    }
}


function loadStatsEQ(contentElement, elementId) {
    fetch(`${protocol}//${host}:${port}/api/stats/eq?username=${currentUser}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                let tableContent = `
                    <table class="stats-table">
                        <tr>
                            <th>Дата</th>
                            <th>Тест</th>
                            <th>Всего</th>
                            <th>Верно</th>
                            <th>Процент</th>
                        </tr>`;

                data.stats.forEach((row, index) => {
                    const percentage = row.percentage != null ? row.percentage.toFixed(2) : 'N/A';
                    const eqElementId = `eq-stat-${elementId}-${index}`;
                    tableContent += `
                        <tr onclick="toggleDetailedStat('EQ', '${row.test_name}', '${eqElementId}')">
                            <td>All</td>
                            <td>${row.test_name}</td>
                            <td>${row.totalAnswers}</td>
                            <td>${row.correctAnswers}</td>
                            <td>${percentage}%</td>
                        </tr>
                        <tr id="${eqElementId}" class="collapsible-content collapsed">
                            <td colspan="5">
                                <div id="eq-content-${eqElementId}"></div>
                            </td>
                        </tr>`;
                });

                tableContent += '</table>';
                contentElement.innerHTML = tableContent;
                toggleCollapsibleContent(elementId);
            } else {
                contentElement.innerHTML = '<p>Ошибка при загрузке статистики</п>';
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке statsEQ:', error);
            contentElement.innerHTML = '<p>Ошибка при загрузке статистики</п>';
        });
}

function loadStatsDP(contentElement, elementId) {
    fetch(`${protocol}//${host}:${port}/api/stats/dp?username=${currentUser}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                let tableContent = `
                    <table class="stats-table">
                        <tr>
                            <th>Дата</th>
                            <th>Тест</th>
                            <th>Всего</th>
                            <th>Верно</th>
                            <th>Процент</th>
                        </tr>`;

                data.stats.forEach((row, index) => {
                    const percentage = row.percentage != null ? row.percentage.toFixed(2) : 'N/A';
                    const dpElementId = `dp-stat-${elementId}-${index}`;
                    tableContent += `
                        <tr onclick="toggleDetailedStat('DP', '${row.test_name}', '${dpElementId}')">
                            <td>All</td>
                            <td>${row.test_name}</td>
                            <td>${row.totalAnswers}</td>
                            <td>${row.correctAnswers}</td>
                            <td>${percentage}%</td>
                        </tr>
                        <tr id="${dpElementId}" class="collapsible-content collapsed">
                            <td colspan="5">
                                <div id="dp-content-${dpElementId}"></div>
                            </td>
                        </tr>`;
                });

                tableContent += '</table>';
                contentElement.innerHTML = tableContent;
                toggleCollapsibleContent(elementId);
            } else {
                contentElement.innerHTML = '<п>Ошибка при загрузке статистики</п>';
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке statsDP:', error);
            contentElement.innerHTML = '<п>Ошибка при загрузке статистики</п>';
        });
}

function toggleDetailedStat(type, testName, elementId) {
    console.log(`Toggling detailed stat for ${type} ${testName}, elementId: ${elementId}`);
    const contentElement = document.getElementById(`${type.toLowerCase()}-content-${elementId}`);
    if (!contentElement) {
        console.error(`Element with id ${type.toLowerCase()}-content-${elementId} not found`);
        return;
    }

    if (contentElement.innerHTML.trim() !== '') {
        contentElement.innerHTML = '';
        toggleCollapsibleContent(elementId);
        return;
    }

    fetch(`${protocol}//${host}:${port}/api/stats/details?username=${currentUser}&testName=${testName}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let tableContent = `
                    <table class="stats-table">
                        <tr>
                            <th>Дата</th>
                            <th>Тест</th>
                            <th>Всего</th>
                            <th>Верно</th>
                            <th>Процент</th>
                        </tr>`;

                data.stats.forEach(row => {
                    const percentage = row.percentage != null ? row.percentage.toFixed(2) : 'N/A';
                    tableContent += `
                        <tr>
                            <td>${row.date}</td>
                            <td>${row.test_name}</td>
                            <td>${row.totalAnswers}</td>
                            <td>${row.correctAnswers}</td>
                            <td>${percentage}%</td>
                        </tr>`;
                });

                tableContent += '</table>';
                contentElement.innerHTML = tableContent;
                toggleCollapsibleContent(elementId);
            } else {
                contentElement.innerHTML = '<p>Ошибка при загрузке статистики</п>';
            }
        })
        .catch(error => {
            console.error(`Ошибка при загрузке статистики ${type} ${testName}:`, error);
            contentElement.innerHTML = `<п>Ошибка при загрузке статистики ${type}</п>`;
        });
}

// Функции для работы с тестом
function startTest() {
    // Сбрасываем счетчики правильных и неправильных ответов
    correctAnswers = 0;
    incorrectAnswers = 0;
    isTestEnded = false;

    // Устанавливаем имя теста (например, "imageTest")
    const testName = 'DP50';

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
    if (!imagesToUse || !imagesToUse.length) {
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
    answerButtonsContainer.className = 'answer-buttonsDiap';
    answerButtonsContainer.innerHTML = '';

    const possibleAnswers = generatePossibleAnswers(imageNameWithoutExtension, imagesToUse);

    possibleAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'diap-answer-button'; // Новый класс для кнопок теста диапазонов
        button.textContent = answer;
        button.onclick = () => checkDiapAnswer(button, answer, imageNameWithoutExtension, imagesToUse);
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

function checkDiapAnswer(button, selectedAnswer, correctAnswer, imagesToUse) {
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

function endTest(correctAnswers, incorrectAnswers, testName) {
    const username = currentUser;

    console.log("Данные перед отправкой:", {
        username: username,
        testName: testName,
        correctAnswers: correctAnswers,
        incorrectAnswers: incorrectAnswers
    });

    fetch(`${protocol}//${host}:${port}/api/record-test`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            testName: testName,
            correctAnswers: correctAnswers,
            incorrectAnswers: incorrectAnswers
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`Тест завершен. Правильных: ${correctAnswers}, Неправильных: ${incorrectAnswers}`);
            navigateTo('main');
            document.getElementById('score').textContent = `Правильных: 0 | Неправильных: 0`;
        } else {
            alert('Ошибка при записи результатов теста');
        }
    })
    .catch(error => {
        console.error('Ошибка при записи результатов теста:', error);
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

function toggleCollapsibleContent(elementId) {
    const element = document.getElementById(elementId);
    if (element.classList.contains('expanded')) {
        element.classList.remove('expanded');
        element.classList.add('collapsed');
    } else {
        element.classList.remove('collapsed');
        element.classList.add('expanded');
    }
}

// Добавление глобального состояния для отслеживания открытой/закрытой таблицы statsEQ и statsDP
let isStatsEQOpen = false;
let isStatsDPOpen = false;
let isStatsHH50Open = false;


function loadStats() {
    if (!currentUser) {
        console.error('User is not logged in');
        return;
    }

    fetch(`${protocol}//${host}:${port}/api/stats?username=${currentUser}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Stats data:', data);
                let tableContent = `
                    <table class="stats-table">
                        <tr>
                            <th>Дата</th>
                            <th>Тест</th>
                            <th>Всего</th>
                            <th>Верно</th>
                            <th>Процент</th>
                        </tr>`;
                
                data.stats.forEach((row, index) => {
                    const percentage = row.percentage != null ? row.percentage.toFixed(2) : 'N/A';
                    const isEQ = row.category === 'EQ';
                    const isDP = row.category === 'DP';
                    tableContent += `
                        <tr onclick="toggleStatDetails('${row.category}', 'stat-${index}')">
                            <td>Total</td>
                            <td class="${isEQ ? 'eq-button' : isDP ? 'dp-button' : ''}">${row.category}</td>
                            <td>${row.totalAnswers}</td>
                            <td>${row.correctAnswers}</td>
                            <td>${percentage}%</td>
                        </tr>
                        <tr id="stat-${index}" class="collapsible-content collapsed">
                            <td colspan="5">
                                <div id="stat-content-stat-${index}"></div>
                            </td>
                        </tr>`;
                });

                tableContent += '</table>';
                document.getElementById('stats-content').innerHTML = tableContent;
            } else {
                document.getElementById('stats-content').innerHTML = '<p>Ошибка при загрузке статистики</п>';
            }
        })
        .catch(error => {
            console.error('Error loading stats:', error);
            document.getElementById('stats-content').innerHTML = '<p>Ошибка при загрузке статистики</п>';
        });
}

function toggleStatDetails(category, elementId) {
    console.log(`Toggling stat details for ${category}, elementId: ${elementId}`);
    const contentElement = document.getElementById(`stat-content-${elementId}`);
    if (!contentElement) {
        console.error(`Element with id stat-content-${elementId} not found`);
        return;
    }

    if (category === 'EQ') {
        if (isStatsEQOpen) {
            contentElement.innerHTML = '';
            isStatsEQOpen = false;
            toggleCollapsibleContent(elementId);
        } else {
            loadStatsEQ(contentElement, elementId);
            isStatsEQOpen = true;
        }
    } else if (category === 'DP') {
        if (isStatsDPOpen) {
            contentElement.innerHTML = '';
            isStatsDPOpen = false;
            toggleCollapsibleContent(elementId);
        } else {
            loadStatsDP(contentElement, elementId);
            isStatsDPOpen = true;
        }
    } else if (category === 'HH50') {
        if (isStatsHH50Open) {
            contentElement.innerHTML = '';
            isStatsHH50Open = false;
            toggleCollapsibleContent(elementId);
        } else {
            loadStatsHH50(contentElement, elementId);
            isStatsHH50Open = true;
        }
    } else {
        toggleCollapsibleContent(elementId);
    }
}


function loadStatsEQ(contentElement, elementId) {
    fetch(`${protocol}//${host}:${port}/api/stats/eq?username=${currentUser}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                let tableContent = `
                    <table class="stats-table">
                        <tr>
                            <th>Дата</th>
                            <th>Тест</th>
                            <th>Всего</th>
                            <th>Верно</th>
                            <th>Процент</th>
                        </tr>`;

                data.stats.forEach((row, index) => {
                    const percentage = row.percentage != null ? row.percentage.toFixed(2) : 'N/A';
                    const eqElementId = `eq-stat-${elementId}-${index}`;
                    tableContent += `
                        <tr onclick="toggleDetailedStat('EQ', '${row.test_name}', '${eqElementId}')">
                            <td>All</td>
                            <td>${row.test_name}</td>
                            <td>${row.totalAnswers}</td>
                            <td>${row.correctAnswers}</td>
                            <td>${percentage}%</td>
                        </tr>
                        <tr id="${eqElementId}" class="collapsible-content collapsed">
                            <td colspan="5">
                                <div id="eq-content-${eqElementId}"></div>
                            </td>
                        </tr>`;
                });

                tableContent += '</table>';
                contentElement.innerHTML = tableContent;
                toggleCollapsibleContent(elementId);
            } else {
                contentElement.innerHTML = '<p>Ошибка при загрузке статистики</п>';
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке statsEQ:', error);
            contentElement.innerHTML = '<p>Ошибка при загрузке статистики</п>';
        });
}

function loadStatsDP(contentElement, elementId) {
    fetch(`${protocol}//${host}:${port}/api/stats/dp?username=${currentUser}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                let tableContent = `
                    <table class="stats-table">
                        <tr>
                            <th>Дата</th>
                            <th>Тест</th>
                            <th>Всего</th>
                            <th>Верно</th>
                            <th>Процент</th>
                        </tr>`;

                data.stats.forEach((row, index) => {
                    const percentage = row.percentage != null ? row.percentage.toFixed(2) : 'N/A';
                    const dpElementId = `dp-stat-${elementId}-${index}`;
                    tableContent += `
                        <tr onclick="toggleDetailedStat('DP', '${row.test_name}', '${dpElementId}')">
                            <td>All</td>
                            <td>${row.test_name}</td>
                            <td>${row.totalAnswers}</td>
                            <td>${row.correctAnswers}</td>
                            <td>${percentage}%</td>
                        </tr>
                        <tr id="${dpElementId}" class="collapsible-content collapsed">
                            <td colspan="5">
                                <div id="dp-content-${dpElementId}"></div>
                            </td>
                        </tr>`;
                });

                tableContent += '</table>';
                contentElement.innerHTML = tableContent;
                toggleCollapsibleContent(elementId);
            } else {
                contentElement.innerHTML = '<п>Ошибка при загрузке статистики</п>';
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке statsDP:', error);
            contentElement.innerHTML = '<п>Ошибка при загрузке статистики</п>';
        });
}

function loadStatsHH50(contentElement, elementId) {
    fetch(`${protocol}//${host}:${port}/api/stats/hh50?username=${currentUser}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let tableContent = `
                    <table class="stats-table">
                        <tr>
                            <th>Дата</th>
                            <th>Тест</th>
                            <th>Всего</th>
                            <th>Верно</th>
                            <th>Процент</th>
                        </tr>`;

                const row = data.stats[0];  // Предполагается, что данные по HH50 будут в первой строке
                const percentage = row.percentage != null ? row.percentage.toFixed(2) : 'N/A';
                tableContent += `
                    <tr onclick="toggleStatDetails('HH50', '${elementId}')">
                        <td>Total</td>
                        <td>HH50</td>
                        <td>${row.totalAnswers}</td>
                        <td>${row.correctAnswers}</td>
                        <td>${percentage}%</td>
                    </tr>`;

                tableContent += '</table>';
                contentElement.innerHTML = tableContent;
                toggleCollapsibleContent(elementId);
            } else {
                contentElement.innerHTML = '<p>Ошибка при загрузке статистики HH50</п>';
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке statsHH50:', error);
            contentElement.innerHTML = '<p>Ошибка при загрузке статистики HH50</п>';
        });
}


function toggleDetailedStat(type, testName, elementId) {
    console.log(`Toggling detailed stat for ${type} ${testName}, elementId: ${elementId}`);
    const contentElement = document.getElementById(`${type.toLowerCase()}-content-${elementId}`);
    if (!contentElement) {
        console.error(`Element with id ${type.toLowerCase()}-content-${elementId} not found`);
        return;
    }

    if (contentElement.innerHTML.trim() !== '') {
        contentElement.innerHTML = '';
        toggleCollapsibleContent(elementId);
        return;
    }

    fetch(`${protocol}//${host}:${port}/api/stats/details?username=${currentUser}&testName=${testName}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let tableContent = `
                    <table class="stats-table">
                        <tr>
                            <th>Дата</th>
                            <th>Тест</th>
                            <th>Всего</th>
                            <th>Верно</th>
                            <th>Процент</th>
                        </tr>`;

                data.stats.forEach(row => {
                    const percentage = row.percentage != null ? row.percentage.toFixed(2) : 'N/A';
                    tableContent += `
                        <tr>
                            <td>${row.date}</td>
                            <td>${row.test_name}</td>
                            <td>${row.totalAnswers}</td>
                            <td>${row.correctAnswers}</td>
                            <td>${percentage}%</td>
                        </tr>`;
                });

                tableContent += '</table>';
                contentElement.innerHTML = tableContent;
                toggleCollapsibleContent(elementId);
            } else {
                contentElement.innerHTML = '<p>Ошибка при загрузке статистики</п>';
            }
        })
        .catch(error => {
            console.error(`Ошибка при загрузке статистики ${type} ${testName}:`, error);
            contentElement.innerHTML = `<п>Ошибка при загрузке статистики ${type}</п>`;
        });
}

function generatePossibleAnswers(correctAnswer, imagesToUse) {
    const answers = [correctAnswer];
    const correctAnswerLength = correctAnswer.length;

    // Фильтруем изображения, чтобы получить только те, которые соответствуют длине правильного ответа
    const filteredImages = imagesToUse
        .map(file => file.split('.')[0])
        .filter(answer => answer.length === correctAnswerLength);

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

function endTestDiap() {
    // Проверяем, не завершен ли тест уже, чтобы избежать повторной записи
    if (isTestEnded) return;

    const testName = 'DP50';

    console.log("Функция endTestDiap вызвана");

    // Вызов функции записи результатов
    endTest(correctAnswers, incorrectAnswers, testName);

    // Устанавливаем флаг завершения теста
    isTestEnded = true;
}