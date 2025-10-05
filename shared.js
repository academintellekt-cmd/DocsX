// Общие функции для договоров и инвойсов

// Функция генерации номера договора
function generateContractNumber(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}.${month}.${day}`;
}

// Функция форматирования чисел без разделителей тысяч
function formatNumber(num) {
    return num.toString();
}

// Функция конвертации чисел в слова (до 500000)
function numberToWords(num) {
    if (num === 0) return 'zero';
    if (num > 500000) return num.toString(); // Если больше 500000, возвращаем число
    
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const thousands = ['', 'thousand', 'million'];
    
    function convertHundreds(n) {
        let result = '';
        if (n > 99) {
            result += ones[Math.floor(n / 100)] + ' hundred';
            n %= 100;
            if (n > 0) result += ' ';
        }
        if (n > 19) {
            result += tens[Math.floor(n / 10)];
            n %= 10;
            if (n > 0) result += '-' + ones[n];
        } else if (n > 9) {
            result += teens[n - 10];
        } else if (n > 0) {
            result += ones[n];
        }
        return result;
    }
    
    let result = '';
    let thousandIndex = 0;
    
    while (num > 0) {
        const chunk = num % 1000;
        if (chunk !== 0) {
            const chunkWords = convertHundreds(chunk);
            if (thousandIndex > 0) {
                result = chunkWords + ' ' + thousands[thousandIndex] + (result ? ' ' + result : '');
            } else {
                result = chunkWords;
            }
        }
        num = Math.floor(num / 1000);
        thousandIndex++;
    }
    
    return result;
}

// Общая функция для получения данных формы
function getFormData() {
    const form = document.getElementById('contractForm');
    if (!form) return {};
    
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
}

// Общая функция для форматирования даты договора
function formatAgreementDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

// Функция для сохранения данных формы в localStorage
function saveFormData() {
    const data = getFormData();
    localStorage.setItem('contractData', JSON.stringify(data));
    console.log('Form data saved to localStorage');
}

// Функция для загрузки данных формы из localStorage
function loadFormData() {
    const saved = localStorage.getItem('contractData');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (error) {
            console.error('Error parsing saved form data:', error);
            return {};
        }
    }
    return {};
}

// Функция для заполнения формы из сохраненных данных
function populateForm(data) {
    if (!data) return;
    
    Object.keys(data).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'file') {
                // Файлы не восстанавливаем
                return;
            }
            element.value = data[key];
        }
    });
}

// Функция для очистки сохраненных данных
function clearFormData() {
    localStorage.removeItem('contractData');
    localStorage.removeItem('loadedSpecification');
    localStorage.removeItem('loadedSignature');
    console.log('Form data cleared from localStorage');
}

// Функция для сохранения спецификации в localStorage
function saveSpecification(specificationHTML) {
    localStorage.setItem('loadedSpecification', specificationHTML);
}

// Функция для загрузки спецификации из localStorage
function loadSpecification() {
    return localStorage.getItem('loadedSpecification');
}

// Функция для сохранения подписи в localStorage
function saveSignature(signatureData) {
    localStorage.setItem('loadedSignature', signatureData);
}

// Функция для загрузки подписи из localStorage
function loadSignature() {
    return localStorage.getItem('loadedSignature');
}

// Функция для инициализации формы с текущей датой
function initializeForm() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    const dateInput = document.getElementById('agreementDate');
    const numberInput = document.getElementById('agreementNumber');
    
    if (dateInput) {
        dateInput.value = formattedDate;
    }
    
    if (numberInput) {
        const contractNumber = generateContractNumber(formattedDate);
        numberInput.value = contractNumber;
    }
}

// Функция для загрузки и восстановления всех данных
function restoreAllData() {
    // Загружаем данные формы
    const formData = loadFormData();
    populateForm(formData);
    
    // Восстанавливаем спецификацию только если есть элемент preview (для договоров)
    const specification = loadSpecification();
    if (specification) {
        window.loadedSpecification = specification;
        const preview = document.getElementById('specificationPreview');
        if (preview) {
            preview.style.display = 'block';
            preview.innerHTML = '<p>📋 Спецификация загружена из сохраненных данных</p>';
        }
    }
    
    // Восстанавливаем подпись
    const signature = loadSignature();
    if (signature) {
        window.loadedSignature = signature;
        const preview = document.getElementById('signaturePreview');
        if (preview) {
            preview.style.display = 'block';
            const img = document.getElementById('signatureImg');
            if (img) {
                img.src = signature;
            }
        }
    }
    
    // Восстанавливаем настройки инвойса
    const savedTermOfDelivery = localStorage.getItem('termOfDelivery');
    if (savedTermOfDelivery) {
        const termOfDeliveryInput = document.getElementById('termOfDelivery');
        if (termOfDeliveryInput) {
            termOfDeliveryInput.value = savedTermOfDelivery;
        }
    }
    
    // Восстанавливаем номер инвойса отдельно
    const savedInvoiceNumber = localStorage.getItem('invoiceNumber');
    if (savedInvoiceNumber && document.title.includes('инвойс')) {
        const invoiceNumberInput = document.getElementById('agreementNumber');
        if (invoiceNumberInput) {
            invoiceNumberInput.value = savedInvoiceNumber;
        }
    }
    
    console.log('All data restored from localStorage');
}

// Функция для сохранения всех данных
function saveAllData() {
    saveFormData();
    
    if (window.loadedSpecification) {
        saveSpecification(window.loadedSpecification);
    }
    
    if (window.loadedSignature) {
        saveSignature(window.loadedSignature);
    }
    
    // Сохраняем настройки инвойса отдельно
    const termOfDelivery = document.getElementById('termOfDelivery');
    if (termOfDelivery) {
        localStorage.setItem('termOfDelivery', termOfDelivery.value);
    }
    
    // Сохраняем номер инвойса отдельно
    const invoiceNumber = document.getElementById('agreementNumber');
    if (invoiceNumber && document.title.includes('инвойс')) {
        localStorage.setItem('invoiceNumber', invoiceNumber.value);
    }
    
    console.log('All data saved to localStorage');
}

// Экспорт функций для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateContractNumber,
        formatNumber,
        numberToWords,
        getFormData,
        formatAgreementDate,
        saveFormData,
        loadFormData,
        populateForm,
        clearFormData,
        saveSpecification,
        loadSpecification,
        saveSignature,
        loadSignature,
        initializeForm,
        restoreAllData,
        saveAllData
    };
}
